import { getProviderStatus } from "@/lib/ai";
import { errorFromUnknown, jsonOk } from "@/lib/api/http";

export async function GET() {
  try {
    const status = await getProviderStatus();
    return jsonOk(status);
  } catch (error) {
    return errorFromUnknown(error);
  }
}
