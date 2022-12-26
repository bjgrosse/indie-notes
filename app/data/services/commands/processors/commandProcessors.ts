import processAddTo from "./addToProcessor";
import processCreateNote from "./createNoteProcessor";
import type { CommandProcessor, CommandProcessorKeys } from "../types";

export const CommandProcessors: {
  [key in CommandProcessorKeys]: CommandProcessor;
} = { "add-to": processAddTo, "create-note": processCreateNote };
