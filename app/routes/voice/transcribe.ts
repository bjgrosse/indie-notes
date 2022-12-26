import * as banana from "@banana-dev/banana-dev";
import type { ActionArgs } from "@remix-run/server-runtime";

// Enter your Banana API keys in .env.local
const apiKey = process.env.BANANA_API_KEY as string;
const modelKey = process.env.BANANA_MODEL_KEY as string;

type ModelOutput = {
  text: string;
};

type WhisperTranscribeResult = {
  modelOutputs: ModelOutput[];
};

export type TranscribeResult = {
  id: string;
  result: string;
};
export async function action({
  request,
}: ActionArgs): Promise<TranscribeResult> {
  const data = await request.formData();
  const id = data.get("id") as string;
  const audio = data.get("audio") as string;

  const modelParameters = {
    mp3BytesString: audio,
  };

  const result = (await banana.run(
    apiKey,
    modelKey,
    modelParameters
  )) as WhisperTranscribeResult;

  console.log(result);
  return { id, result: result.modelOutputs[0].text };
}
