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
    <div className="border-b border-amber-500/20 bg-amber-500/5 px-4 py-2 text-center text-xs text-amber-200">
      <span className="inline-flex items-center gap-2">
        <AlertTriangle className="h-3.5 w-3.5" />
        {message}
      </span>
    </div>
  );
}
