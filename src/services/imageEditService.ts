import { Client } from "@gradio/client";

const SPACE_ID = "prithivMLmods/Qwen-Image-Edit-2511-LoRAs-Fast";

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
  const client = await Client.connect(SPACE_ID);

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

  const result = await client.predict("/infer", payload as any);
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

  if (!url) {
    throw new Error("Image generation failed: no image URL returned.");
  }

  return url;
}

