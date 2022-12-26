import type { ActionArgs } from "@remix-run/server-runtime";
import { processRawText } from "~/data/services/commands/CommandService";
import type { TextCommandResult } from "~/data/services/commands/types";
import { requireUserId } from "~/session.server";

export async function action(args: ActionArgs): Promise<TextCommandResult> {
  console.log("haha");
  const userId = await requireUserId(args.request);
  const data = await args.request.formData();
  const prompt = data.get("text") as string;
  const result = await processRawText(prompt, userId);

  return { ...result, prompt };
}
