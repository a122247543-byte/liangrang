import assert from 'node:assert/strict';
import { createContextAwareChatClient } from '../src/api/chatClient.mjs';
import {
  ContextInputTooLongError,
  estimateMessageTokens,
  prepareMessagesForModel,
} from '../src/api/contextCompression.mjs';

function makeLargeText(label, repeat = 60) {
  return Array.from({ length: repeat }, (_, index) => `${label} block ${index}: 这里是大量上下文、日志、文件内容和约束。`).join('\n');
}

function makeHistory(turns = 14) {
  const messages = [
    { role: 'system', content: 'You are a careful coding assistant. Keep project constraints.' },
  ];

  for (let index = 1; index <= turns; index += 1) {
    messages.push({ role: 'user', content: `目标 ${index}: 修改 src/api/file-${index}.js，要求保留系统提示并记录未完成事项。` });
    messages.push({ role: 'assistant', content: `已完成操作 ${index}: inspected E:\\测试\\src\\api\\file-${index}.js。TODO: continue verification.` });
    messages.push({ role: 'tool', name: 'shell_output', content: makeLargeText(`tool-${index}`, 20) });
  }

  messages.push({ role: 'user', content: '当前用户消息：请继续实现上下文压缩。' });
  return messages;
}

function testCompression() {
  const original = makeHistory();
  const prepared = prepareMessagesForModel(original, {
    modelMaxContextTokens: 4200,
    recentTurns: 6,
    maxToolContentChars: 300,
    maxMessageContentChars: 900,
  });

  assert.equal(prepared.compressed, true);
  assert.ok(prepared.originalInputTokens > prepared.finalInputTokens);
  assert.equal(prepared.messages[0].role, 'system');
  assert.equal(prepared.messages[1].name, 'context_summary');
  assert.match(prepared.contextSummary, /用户目标/);
  assert.match(prepared.contextSummary, /重要约束/);
  assert.match(prepared.contextSummary, /已完成操作/);
  assert.match(prepared.contextSummary, /关键文件路径/);
  assert.match(prepared.contextSummary, /未完成事项/);
  assert.equal(prepared.messages.at(-1).content, '当前用户消息：请继续实现上下文压缩。');
  assert.ok(prepared.messages.some((message) => /目标 14/.test(message.content)));
  assert.ok(!prepared.messages.some((message) => /目标 1:/.test(message.content) && message.role === 'user'));
}

function testToolTruncation() {
  const prepared = prepareMessagesForModel([
    { role: 'system', content: 'system' },
    { role: 'tool', name: 'shell_output', content: makeLargeText('very-long-tool-output', 80) },
    { role: 'user', content: 'short request' },
  ], {
    modelMaxContextTokens: 10000,
    maxToolContentChars: 260,
  });

  const toolMessage = prepared.messages.find((message) => message.role === 'tool');
  assert.ok(toolMessage.content.length <= 260);
  assert.match(toolMessage.content, /内容已截断/);
}

function testSingleInputTooLong() {
  assert.throws(() => {
    prepareMessagesForModel([
      { role: 'system', content: 'system' },
      { role: 'user', content: makeLargeText('single-user-input', 300) },
    ], {
      modelMaxContextTokens: 800,
      maxMessageContentChars: 100000,
    });
  }, ContextInputTooLongError);
}

async function testClientWrapper() {
  let capturedRequest;
  const chat = createContextAwareChatClient({
    defaults: { model: 'gpt-4o', modelMaxContextTokens: 4200, recentTurns: 6, maxToolContentChars: 300 },
    send: async (request) => {
      capturedRequest = request;
      return { id: 'ok', output_text: 'done' };
    },
  });

  const response = await chat({ messages: makeHistory() });
  assert.equal(response.contextCompression.compressed, true);
  assert.equal(capturedRequest.messages[1].name, 'context_summary');
  assert.equal(capturedRequest.max_tokens, response.contextCompression.reservedOutputTokens);
  assert.ok(estimateMessageTokens(capturedRequest.messages) < response.contextCompression.originalInputTokens);
}

await testClientWrapper();
testCompression();
testToolTruncation();
testSingleInputTooLong();

console.log('context compression checks passed');
