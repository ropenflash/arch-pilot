import { AIError, isConnectionError } from "@/lib/ai/errors";
import {
  getAIRuntimeConfig,
  providerUnavailableMessage,
} from "@/lib/ai/config";
import type { ChatClient, ChatMessage } from "@/lib/ai/provider";

const GENERATE_TIMEOUT_MS = 180_000;
const HEALTH_TIMEOUT_MS = 4_000;

function completionsUrl(baseUrl: string): string {
  const trimmed = baseUrl.replace(/\/$/, "");
  if (trimmed.endsWith("/v1")) return `${trimmed}/chat/completions`;
  if (trimmed.endsWith("/chat/completions")) return trimmed;
  return `${trimmed}/chat/completions`;
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (isConnectionError(error) || (error instanceof Error && error.name === "AbortError")) {
      throw new AIError(
        "AI_PROVIDER_UNAVAILABLE",
        providerUnavailableMessage("openai"),
        error,
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export class OpenAICompatibleProvider implements ChatClient {
  readonly name = "openai-compatible";

  private get settings() {
    const { openai } = getAIRuntimeConfig();
    if (!openai.apiKey) {
      throw new AIError(
        "AI_PROVIDER_UNAVAILABLE",
        "OPENAI_API_KEY is not configured.",
      );
    }
    if (!openai.model) {
      throw new AIError(
        "AI_PROVIDER_UNAVAILABLE",
        "OPENAI_MODEL is not configured.",
      );
    }
    return openai;
  }

  async healthcheck() {
    try {
      const { openai } = getAIRuntimeConfig();
      if (!openai.apiKey || !openai.model) {
        return {
          available: false,
          message: "OpenAI-compatible provider is not fully configured.",
        };
      }
      const modelsUrl = openai.baseUrl.replace(/\/$/, "").replace(/\/chat\/completions$/, "");
      const url = modelsUrl.endsWith("/v1") ? `${modelsUrl}/models` : `${modelsUrl}/models`;
      const response = await fetchWithTimeout(
        url,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${openai.apiKey}` },
        },
        HEALTH_TIMEOUT_MS,
      );
      return {
        available: response.ok,
        message: response.ok
          ? undefined
          : providerUnavailableMessage("openai"),
      };
    } catch {
      return {
        available: false,
        message: providerUnavailableMessage("openai"),
      };
    }
  }

  async complete(messages: ChatMessage[], options?: { temperature?: number }) {
    const { apiKey, baseUrl, model } = this.settings;
    const response = await fetchWithTimeout(
      completionsUrl(baseUrl),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options?.temperature ?? 0.2,
          response_format: { type: "json_object" },
        }),
      },
      GENERATE_TIMEOUT_MS,
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      if (response.status === 401 || response.status === 403 || response.status === 404) {
        throw new AIError(
          "AI_PROVIDER_UNAVAILABLE",
          providerUnavailableMessage("openai"),
          body,
        );
      }
      throw new AIError(
        "AI_GENERATION_FAILED",
        "The AI provider failed to generate a response.",
        body,
      );
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new AIError(
        "AI_GENERATION_FAILED",
        "The AI provider returned an empty response.",
      );
    }
    return content;
  }
}
