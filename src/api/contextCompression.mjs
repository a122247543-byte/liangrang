const DEFAULT_MODEL_MAX_CONTEXT_TOKENS = 128000;
const DEFAULT_COMPRESSION_THRESHOLD_RATIO = 0.7;
const DEFAULT_RESERVE_OUTPUT_RATIO = 0.25;
const DEFAULT_RECENT_TURNS = 8;
const DEFAULT_MAX_TOOL_CONTENT_CHARS = 4000;
const DEFAULT_MAX_MESSAGE_CONTENT_CHARS = 12000;

export class ContextInputTooLongError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ContextInputTooLongError';
    this.details = details;
  }
}

export function estimateMessageTokens(messages) {
  return messages.reduce((total, message) => {
    const roleTokens = estimateTextTokens(message.role || '');
    const nameTokens = estimateTextTokens(message.name || '');
    return total + 4 + roleTokens + nameTokens + estimateTextTokens(contentToText(message.content));
  }, 2);
}

export function estimateTextTokens(value) {
  const text = String(value || '');
  if (!text) return 0;

  const cjkMatches = text.match(/[\u3400-\u9fff\uf900-\ufaff]/g) || [];
  const withoutCjk = text.replace(/[\u3400-\u9fff\uf900-\ufaff]/g, '');
  const wordMatches = withoutCjk.match(/[A-Za-z0-9_]+|[^\sA-Za-z0-9_]/g) || [];

  return cjkMatches.length + Math.ceil(wordMatches.join(' ').length / 4);
}

export function prepareMessagesForModel(messages, options = {}) {
  const config = normalizeOptions(options);
  const truncatedMessages = truncateBulkyMessages(messages, config);
  const latestUserMessage = findLatestUserMessage(truncatedMessages);
  const latestUserTokens = latestUserMessage ? estimateMessageTokens([latestUserMessage]) : 0;
  const inputBudget = Math.floor(config.modelMaxContextTokens * (1 - config.reserveOutputRatio));

  if (latestUserTokens > Math.floor(inputBudget * 0.9)) {
    throw new ContextInputTooLongError(
      '单条用户输入已经接近或超过可用上下文，请拆分内容，或只发送与当前任务相关的片段。',
      {
        latestUserTokens,
        inputBudget,
        modelMaxContextTokens: config.modelMaxContextTokens,
      },
    );
  }

  const originalInputTokens = estimateMessageTokens(truncatedMessages);
  const compressionTrigger = Math.floor(config.modelMaxContextTokens * config.compressionThresholdRatio);

  if (originalInputTokens <= compressionTrigger && originalInputTokens <= inputBudget) {
    return {
      messages: truncatedMessages,
      contextSummary: null,
      originalInputTokens,
      finalInputTokens: originalInputTokens,
      compressed: false,
      reservedOutputTokens: config.modelMaxContextTokens - inputBudget,
    };
  }

  const compressedMessages = compressOldHistory(truncatedMessages, config);
  const finalInputTokens = estimateMessageTokens(compressedMessages);

  return {
    messages: compressedMessages,
    contextSummary: findContextSummary(compressedMessages),
    originalInputTokens,
    finalInputTokens,
    compressed: true,
    reservedOutputTokens: config.modelMaxContextTokens - inputBudget,
  };
}

export function truncateBulkyMessages(messages, options = {}) {
  const config = normalizeOptions(options);
  return messages.map((message) => {
    const contentText = contentToText(message.content);
    const maxChars = isBulkyMessage(message)
      ? config.maxToolContentChars
      : config.maxMessageContentChars;

    if (contentText.length <= maxChars) return { ...message };

    return {
      ...message,
      content: truncateText(contentText, maxChars, '内容已截断，避免工具输出、日志或文件内容长期占满上下文'),
    };
  });
}

function compressOldHistory(messages, config) {
  const systemMessages = messages.filter((message) => message.role === 'system');
  const nonSystemMessages = messages.filter((message) => message.role !== 'system');
  const latestUserIndex = findLatestUserIndex(nonSystemMessages);
  const latestUserMessage = latestUserIndex >= 0 ? nonSystemMessages[latestUserIndex] : null;
  const beforeLatest = latestUserIndex >= 0 ? nonSystemMessages.slice(0, latestUserIndex) : nonSystemMessages;
  const afterLatest = latestUserIndex >= 0 ? nonSystemMessages.slice(latestUserIndex + 1) : [];
  const recentMessages = selectRecentTurns(beforeLatest, config.recentTurns);
  const recentStart = Math.max(0, beforeLatest.length - recentMessages.length);
  const oldMessages = beforeLatest.slice(0, recentStart);
  const contextSummary = buildContextSummary(oldMessages);

  const result = [...systemMessages];
  if (contextSummary) {
    result.push({
      role: 'system',
      name: 'context_summary',
      content: contextSummary,
    });
  }
  result.push(...recentMessages);
  if (latestUserMessage) result.push(latestUserMessage);
  result.push(...afterLatest);

  return result;
}

function selectRecentTurns(messages, recentTurns) {
  if (messages.length === 0) return [];

  let turns = 0;
  let start = messages.length;
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].role === 'user') {
      turns += 1;
      if (turns > recentTurns) {
        start = index + 1;
        break;
      }
    }
    start = index;
  }

  return messages.slice(start);
}

function buildContextSummary(oldMessages) {
  if (oldMessages.length === 0) return null;

  const userMessages = oldMessages.filter((message) => message.role === 'user');
  const assistantMessages = oldMessages.filter((message) => message.role === 'assistant');
  const toolMessages = oldMessages.filter((message) => message.role === 'tool' || message.role === 'function');
  const allText = oldMessages.map((message) => contentToText(message.content)).join('\n');
  const filePaths = extractFilePaths(allText).slice(0, 12);

  return [
    'context_summary:',
    `用户目标: ${summarizeMessages(userMessages, 900) || '未从早期历史中明确识别。'}`,
    `重要约束: ${extractConstraintHints(allText) || '遵循系统提示、用户显式要求和当前项目约束。'}`,
    `已完成操作: ${summarizeMessages(assistantMessages, 900) || '早期历史未记录明确完成项。'}`,
    `关键文件路径: ${filePaths.length ? filePaths.join(', ') : '早期历史未记录关键路径。'}`,
    `未完成事项: ${extractTodoHints(allText) || '继续处理当前用户消息，并保留最近对话中的待办。'}`,
    `压缩说明: 已将 ${oldMessages.length} 条更早消息压缩为摘要；工具输出、日志和文件内容只保留必要片段。`,
    toolMessages.length ? `工具输出概况: ${summarizeMessages(toolMessages, 700)}` : '工具输出概况: 早期历史无工具输出。',
  ].join('\n');
}

function summarizeMessages(messages, maxChars) {
  const summary = messages
    .map((message) => `- ${truncateText(contentToText(message.content).replace(/\s+/g, ' ').trim(), 260)}`)
    .filter((line) => line.length > 2)
    .join('\n');
  return truncateText(summary, maxChars);
}

function extractConstraintHints(text) {
  const lines = text.split(/\r?\n/).filter((line) => /要求|必须|不要|不能|保留|限制|constraint|must|should|todo|fix/i.test(line));
  return truncateText(lines.slice(0, 10).join('\n'), 900);
}

function extractTodoHints(text) {
  const lines = text.split(/\r?\n/).filter((line) => /未完成|待办|todo|next|剩余|继续|失败|blocked|error/i.test(line));
  return truncateText(lines.slice(0, 8).join('\n'), 700);
}

function extractFilePaths(text) {
  const matches = text.match(/[A-Za-z]:\\[^\s'"<>|]+|(?:\.\/|\.\.\/|\/)?[\w.-]+(?:\/[\w.@()-]+)+/g) || [];
  return [...new Set(matches.map((item) => item.replace(/[),.;:]+$/, '')))];
}

function findContextSummary(messages) {
  return messages.find((message) => message.name === 'context_summary')?.content || null;
}

function findLatestUserMessage(messages) {
  const index = findLatestUserIndex(messages);
  return index >= 0 ? messages[index] : null;
}

function findLatestUserIndex(messages) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].role === 'user') return index;
  }
  return -1;
}

function isBulkyMessage(message) {
  const label = `${message.role || ''} ${message.name || ''}`.toLowerCase();
  return /tool|function|log|output|stdout|stderr|file/.test(label);
}

function truncateText(value, maxChars = DEFAULT_MAX_MESSAGE_CONTENT_CHARS, reason = '内容已截断') {
  const text = String(value || '');
  if (text.length <= maxChars) return text;

  const marker = `\n\n[${reason}: 原始长度 ${text.length} 字符，仅保留开头和结尾。]\n\n`;
  const keep = Math.max(0, maxChars - marker.length);
  const head = Math.ceil(keep * 0.65);
  const tail = Math.floor(keep * 0.35);
  return `${text.slice(0, head)}${marker}${text.slice(text.length - tail)}`;
}

function contentToText(content) {
  if (content == null) return '';
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map((part) => {
      if (typeof part === 'string') return part;
      if (part?.type === 'text') return part.text || '';
      if (part?.type === 'input_text') return part.text || '';
      if (part?.type === 'image_url' || part?.type === 'input_image') return '[image omitted]';
      return JSON.stringify(part);
    }).join('\n');
  }
  return JSON.stringify(content);
}

function normalizeOptions(options) {
  return {
    modelMaxContextTokens: options.modelMaxContextTokens || DEFAULT_MODEL_MAX_CONTEXT_TOKENS,
    compressionThresholdRatio: options.compressionThresholdRatio || DEFAULT_COMPRESSION_THRESHOLD_RATIO,
    reserveOutputRatio: options.reserveOutputRatio || DEFAULT_RESERVE_OUTPUT_RATIO,
    recentTurns: clamp(options.recentTurns || DEFAULT_RECENT_TURNS, 5, 10),
    maxToolContentChars: options.maxToolContentChars || DEFAULT_MAX_TOOL_CONTENT_CHARS,
    maxMessageContentChars: options.maxMessageContentChars || DEFAULT_MAX_MESSAGE_CONTENT_CHARS,
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
