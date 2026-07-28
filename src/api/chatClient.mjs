import { prepareMessagesForModel } from './contextCompression.mjs';

export const MODEL_CONTEXT_LIMITS = {
  'gpt-4o': 128000,
  'gpt-4o-mini': 128000,
  'gpt-4.1': 1047576,
  'gpt-4.1-mini': 1047576,
  'gpt-5': 400000,
  'gpt-5-mini': 400000,
  'claude-3-5-sonnet': 200000,
  'claude-3-7-sonnet': 200000,
  'claude-sonnet-4': 200000,
};

export function getModelMaxContextTokens(model, fallback = 128000) {
  if (!model) return fallback;
  const exact = MODEL_CONTEXT_LIMITS[model];
  if (exact) return exact;

  const matchedKey = Object.keys(MODEL_CONTEXT_LIMITS).find((key) => model.includes(key));
  return matchedKey ? MODEL_CONTEXT_LIMITS[matchedKey] : fallback;
}

export function createContextAwareChatClient({ send, defaults = {} }) {
  if (typeof send !== 'function') {
    throw new TypeError('createContextAwareChatClient requires a send(request) function.');
  }

  return async function chat(request) {
    const model = request.model || defaults.model;
    const modelMaxContextTokens = request.modelMaxContextTokens
      || defaults.modelMaxContextTokens
      || getModelMaxContextTokens(model);

    const prepared = prepareMessagesForModel(request.messages || [], {
      ...defaults,
      ...request.contextCompression,
      modelMaxContextTokens,
    });

    const response = await send({
      ...request,
      model,
      messages: prepared.messages,
      max_tokens: request.max_tokens || request.maxTokens || prepared.reservedOutputTokens,
      contextCompression: undefined,
      contextCompressionMeta: prepared,
    });

    return {
      ...response,
      contextCompression: prepared,
    };
  };
}
