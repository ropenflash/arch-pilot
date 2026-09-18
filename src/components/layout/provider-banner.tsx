import { AlertTriangle } from "lucide-react";
import { getProviderStatus } from "@/lib/ai";

export async function ProviderBanner() {
  let message: string | null = null;
  try {
    const status = await getProviderStatus();
    if (!status.available) {
      message =
        status.message ??
        "Local AI provider unavailable. Configure another AI provider or start Ollama.";
    }
  } catch {
    message =
      "Local AI provider unavailable. Configure another AI provider or start Ollama.";
  }

  if (!message) return null;

  return (
    <div className="border-b border-primary/25 bg-primary/10 px-4 py-2 text-center text-sm text-foreground">
      <span className="inline-flex items-center gap-2">
        <AlertTriangle className="h-3.5 w-3.5" />
        {message}
      </span>
    </div>
  );
}
