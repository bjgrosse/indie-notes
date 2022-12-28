export type CommandProcessorKeys = "add-to" | "create-note";
export type CommandResult = {
  success: boolean;
  message?: string;
  content?: string;
  recordId?: string;
};

export type TextCommandResult = CommandResult & {
  prompt: string;
};
export type CommandProcessor = (
  text: string,
  userId: string
) => Promise<CommandResult | undefined>;
