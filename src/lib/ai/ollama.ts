import { AIError, isConnectionError } from "@/lib/ai/errors";
import {
  getAIRuntimeConfig,
  providerUnavailableMessage,
} from "@/lib/ai/config";
import type { ChatClient, ChatMessage } from "@/lib/ai/provider";

const GENERATE_TIMEOUT_MS = 180_000;
const HEALTH_TIMEOUT_MS = 4_000;

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
        providerUnavailableMessage("ollama"),
        error,
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export class OllamaProvider implements ChatClient {
  readonly name = "ollama";

  private get settings() {
    const { ollama } = getAIRuntimeConfig();
    if (!ollama.model) {
      throw new AIError(
        "AI_PROVIDER_UNAVAILABLE",
        "OLLAMA_MODEL is not configured.",
      );
    }
    return ollama;
  }

  async healthcheck() {
    try {
      const { ollama } = getAIRuntimeConfig();
      const response = await fetchWithTimeout(
        `${ollama.baseUrl.replace(/\/$/, "")}/api/tags`,
        { method: "GET" },
        HEALTH_TIMEOUT_MS,
      );
      if (!response.ok) {
        return {
          available: false,
          message: providerUnavailableMessage("ollama"),
        };
      }
      if (!ollama.model) {
        return {
          available: false,
          message: "OLLAMA_MODEL is not configured.",
        };
      }
      return { available: true };
    } catch {
      return {
        available: false,
        message: providerUnavailableMessage("ollama"),
      };
    }
  }

  async complete(messages: ChatMessage[], options?: { temperature?: number }) {
    const { baseUrl, model } = this.settings;
    const response = await fetchWithTimeout(
      `${baseUrl.replace(/\/$/, "")}/api/chat`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          format: "json",
          options: {
            temperature: options?.temperature ?? 0.2,
          },
        }),
      },
      GENERATE_TIMEOUT_MS,
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      if (response.status >= 500 || response.status === 404) {
        throw new AIError(
          "AI_PROVIDER_UNAVAILABLE",
          providerUnavailableMessage("ollama"),
          body,
        );
      }
      throw new AIError(
        "AI_GENERATION_FAILED",
        "The local model failed to generate a response.",
        body,
      );
    }

    const data = (await response.json()) as {
      message?: { content?: string };
      response?: string;
    };
    const content = data.message?.content ?? data.response;
    if (!content) {
      throw new AIError(
        "AI_GENERATION_FAILED",
        "The local model returned an empty response.",
      );
    }
    return content;
  }
}
