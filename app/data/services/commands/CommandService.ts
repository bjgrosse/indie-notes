import { CommandProcessors } from "./processors/commandProcessors";
import type { CommandResult } from "./types";

export async function processRawText(
  text: string,
  userId: string
): Promise<CommandResult> {
  for (let processor of Object.values(CommandProcessors)) {
    const result = await processor(text, userId);

    if (result) {
      return result;
    }
  }

  throw Error("No command processor found for text.");
}
