import { Client } from "@gradio/client";

const SPACE_ID = "prithivMLmods/Qwen-Image-Edit-2511-LoRAs-Fast";
const SPACE_ORIGIN = "https://prithivMLmods-qwen-image-edit-2511-loras-fast.hf.space";
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN as string | undefined;

function normalizeSpaceUrl(url: string): string {
  const trimmed = String(url || "").trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("/")) return `${SPACE_ORIGIN}${trimmed}`;
  // Sometimes Gradio returns "file=..." without a leading slash
  if (trimmed.startsWith("file=")) return `${SPACE_ORIGIN}/${trimmed}`;
  return trimmed;
}

export interface ImageEditRequest {
  image: Blob;
  prompt: string;
  loraAdapter?: string;
  seed?: number;
  randomizeSeed?: boolean;
  guidanceScale?: number;
  steps?: number;
}

/**
 * Call the Qwen Image Edit Space on Hugging Face using @gradio/client.
 * Expects a Blob image and a fully-formed prompt string.
 */
export async function generateEditedImage({
  image,
  prompt,
  loraAdapter = "Photo-to-Anime",
  seed = 0,
  randomizeSeed = true,
  guidanceScale = 1,
  steps = 4,
}: ImageEditRequest): Promise<string> {
  let client: any;
  try {
    if (!HF_TOKEN) {
      throw new Error(
        "Missing Hugging Face token (VITE_HF_TOKEN). Add it to your .env file to call the GPU Space."
      );
    }
    // Cast options as any because current @gradio/client types don't expose hf_token on ClientOptions
    client = await Client.connect(SPACE_ID, { hf_token: HF_TOKEN } as any);
  } catch (e) {
    const msg =
      (e instanceof Error && e.message) ||
      "Failed to connect to Hugging Face Space. Check your VITE_HF_TOKEN and network.";
    throw new Error(msg);
  }

  const payload = {
    images: [
      {
        image,
        caption: null,
      },
    ],
    prompt,
    lora_adapter: loraAdapter,
    seed,
    randomize_seed: randomizeSeed,
    guidance_scale: guidanceScale,
    steps,
  };

  let result: any;
  try {
    result = await client.predict("/infer", payload as any);
  } catch (e: any) {
    const msg =
      (typeof e?.message === "string" && e.message) ||
      (typeof e?.error === "string" && e.error) ||
      (typeof e === "string" && e) ||
      "";
    throw new Error(msg || "Image generation failed during /infer call.");
  }
  const data = (result as any)?.data ?? [];
  const imageResult = Array.isArray(data) ? data[0] : data;

  let url = "";
  if (typeof imageResult === "string") {
    url = imageResult;
  } else if (imageResult?.url) {
    url = imageResult.url;
  } else if (imageResult?.path) {
    url = imageResult.path;
  }

  url = normalizeSpaceUrl(url);

  if (!url) {
    throw new Error("Image generation failed: no image URL returned.");
  }

  return url;
}

