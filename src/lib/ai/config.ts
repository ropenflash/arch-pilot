function requiredEnv(name: string): string | undefined {
  const value = process.env[name];
  if (!value || !value.trim()) return undefined;
  return value.trim();
}

export type AIProviderKind = "ollama" | "openai";

export interface AIRuntimeConfig {
  provider: AIProviderKind;
  ollama: {
    baseUrl: string;
    model: string;
  };
  openai: {
    apiKey: string;
    baseUrl: string;
    model: string;
  };
}

export function getAIRuntimeConfig(): AIRuntimeConfig {
  const providerRaw = (process.env.AI_PROVIDER ?? "ollama").trim().toLowerCase();
  const provider: AIProviderKind =
    providerRaw === "openai" || providerRaw === "openai-compatible"
      ? "openai"
      : "ollama";

  const ollamaModel = requiredEnv("OLLAMA_MODEL");
  const openaiModel = requiredEnv("OPENAI_MODEL");

  return {
    provider,
    ollama: {
      baseUrl: requiredEnv("OLLAMA_BASE_URL") ?? "http://localhost:11434",
      model: ollamaModel ?? "",
    },
    openai: {
      apiKey: requiredEnv("OPENAI_API_KEY") ?? "",
      baseUrl: requiredEnv("OPENAI_BASE_URL") ?? "https://api.openai.com/v1",
      model: openaiModel ?? "",
    },
  };
}

export function providerUnavailableMessage(kind: AIProviderKind): string {
  if (kind === "ollama") {
    return "Local AI provider unavailable. Configure another AI provider or start Ollama.";
  }
  return "The configured AI provider is unavailable.";
}
