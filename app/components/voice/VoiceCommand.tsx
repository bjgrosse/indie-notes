import { useFetcher } from "@remix-run/react";
import { useEffect, useRef } from "react";
import type { TextCommandResult } from "~/data/services/commands/types";

// component that takes n a blob and returns a string of the transcribed text
export type VoiceCommandProps = {
  audio?: Blob;
  rawText?: string;
};
export default function VoiceCommand({ audio, rawText }: VoiceCommandProps) {
  const started = useRef(false);
  const fetcher = useFetcher<TextCommandResult>();
  useEffect(() => {
    if (started.current || fetcher.type !== "init") return;
    if (audio) {
      started.current = true;
      var reader = new FileReader();
      reader.readAsDataURL(audio);
      reader.onloadend = function () {
        const result = reader.result as string;
        var base64data = result.split(",")[1];

        fetcher.submit(
          { audio: base64data },
          { method: "post", action: "/voice/command" }
        );
      };
    } else if (rawText) {
      started.current = true;
      setTimeout(() => {
        fetcher.submit(
          { text: rawText },
          { method: "post", action: "/voice/text" }
        );
      }, 0);
    }
  }, [audio, fetcher, rawText]);

  const message = fetcher.data?.recordId ? (
    <a href={`/notes/${fetcher.data?.recordId}`}>{fetcher.data?.message}</a>
  ) : (
    <span>{fetcher.data?.message}</span>
  );
  return fetcher.state !== "idle" ? (
    <div className="mb-2 flex max-w-full flex-shrink-0 truncate rounded border p-2">
      Processing...
    </div>
  ) : (
    <div
      className="mb-2 flex max-w-full flex-shrink-0 truncate rounded border  p-2"
      title={fetcher.data?.message}
    >
      {fetcher.data?.success ? "✅" : "❌"}
      <div className="ml-2 flex min-w-0 max-w-full flex-shrink flex-grow flex-col">
        {message}
        <code className="max-h-24 w-full max-w-full overflow-y-auto whitespace-normal">
          {fetcher.data?.content || fetcher.data?.prompt}
        </code>
      </div>
    </div>
  );
}
