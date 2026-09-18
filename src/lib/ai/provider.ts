import type {
  ArchitectureReview,
  ArchitectureReviewInput,
  SystemDesign,
  SystemDesignInput,
} from "@/lib/architecture/validation";

export interface AIProvider {
  readonly name: string;
  generateSystemDesign(input: SystemDesignInput): Promise<SystemDesign>;
  reviewArchitecture(input: ArchitectureReviewInput): Promise<ArchitectureReview>;
  healthcheck(): Promise<{ available: boolean; message?: string }>;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatClient {
  readonly name: string;
  complete(messages: ChatMessage[], options?: { temperature?: number }): Promise<string>;
  healthcheck(): Promise<{ available: boolean; message?: string }>;
}
