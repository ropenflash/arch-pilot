import { applyDeterministicCapacity } from "@/lib/capacity/calculations";
import { AIError } from "@/lib/ai/errors";
import { getAIRuntimeConfig } from "@/lib/ai/config";
import { OllamaProvider } from "@/lib/ai/ollama";
import { OpenAICompatibleProvider } from "@/lib/ai/openai";
import {
  parseArchitectureReviewOutput,
  parseSystemDesignOutput,
} from "@/lib/ai/parser";
import {
  buildRepairMessages,
  buildReviewMessages,
  buildSystemDesignMessages,
} from "@/lib/ai/prompts";
import type { AIProvider, ChatClient, ChatMessage } from "@/lib/ai/provider";
import type {
  ArchitectureReview,
  ArchitectureReviewInput,
  SystemDesign,
  SystemDesignInput,
} from "@/lib/architecture/validation";

export class StructuredAIProvider implements AIProvider {
  readonly name: string;

  constructor(private readonly client: ChatClient) {
    this.name = client.name;
  }

  healthcheck() {
    return this.client.healthcheck();
  }

  async generateSystemDesign(input: SystemDesignInput): Promise<SystemDesign> {
    const messages = buildSystemDesignMessages(input);
    const first = await this.client.complete(messages);
    const parsed = parseSystemDesignOutput(first);
    if (parsed.success && parsed.data) {
      return applyDeterministicCapacity(input, parsed.data);
    }

    const repaired = await this.repair(
      messages,
      first,
      parsed.issues ?? parsed.error ?? "Invalid JSON",
    );
    const second = parseSystemDesignOutput(repaired);
    if (second.success && second.data) {
      return applyDeterministicCapacity(input, second.data);
    }

    throw new AIError(
      "AI_PARSE_ERROR",
      "Unable to parse architecture.",
      second.issues ?? parsed.issues,
    );
  }

  async reviewArchitecture(
    input: ArchitectureReviewInput,
  ): Promise<ArchitectureReview> {
    const messages = buildReviewMessages(input);
    const first = await this.client.complete(messages);
    const parsed = parseArchitectureReviewOutput(first);
    if (parsed.success && parsed.data) {
      return parsed.data;
    }

    const repaired = await this.repair(
      messages,
      first,
      parsed.issues ?? parsed.error ?? "Invalid JSON",
    );
    const second = parseArchitectureReviewOutput(repaired);
    if (second.success && second.data) {
      return second.data;
    }

    throw new AIError(
      "AI_PARSE_ERROR",
      "Unable to parse architecture review.",
      second.issues ?? parsed.issues,
    );
  }

  private async repair(
    original: ChatMessage[],
    invalidOutput: string,
    issues: string,
  ) {
    const messages = buildRepairMessages(original, invalidOutput, issues);
    return this.client.complete(messages, { temperature: 0 });
  }
}

export function createAIProvider(): AIProvider {
  const config = getAIRuntimeConfig();
  const client =
    config.provider === "openai"
      ? new OpenAICompatibleProvider()
      : new OllamaProvider();
  return new StructuredAIProvider(client);
}

export async function getProviderStatus() {
  const config = getAIRuntimeConfig();
  const provider = createAIProvider();
  const health = await provider.healthcheck();
  return {
    provider: config.provider,
    model:
      config.provider === "openai"
        ? config.openai.model || null
        : config.ollama.model || null,
    ...health,
  };
}
