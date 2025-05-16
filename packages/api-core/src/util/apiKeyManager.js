import crypto from "crypto";

const apiKeys = {};

export function createApiKey(systemName) {
  const apiKey = crypto.randomBytes(20).toString("hex");
  apiKeys[apiKey] = { systemName, createdAt: new Date() };
  return apiKey;
}

export function validateApiKey(key) {
  return apiKeys.hasOwnProperty(key);
}
