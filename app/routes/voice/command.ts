import type { ActionArgs } from "@remix-run/server-runtime";
import { processRawText } from "~/data/services/commands/CommandService";
import type { TextCommandResult } from "~/data/services/commands/types";
import { requireUserId } from "~/session.server";
import { action as transcribe } from "./transcribe";

export async function action(args: ActionArgs): Promise<TextCommandResult> {
  const userId = await requireUserId(args.request);
  const transcription = await transcribe(args);

  const result = await processRawText(transcription.result, userId);

  return { ...result, prompt: transcription.result };
}
