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
      console.log("audio");
      started.current = true;
      var reader = new FileReader();
      reader.readAsDataURL(audio);
      reader.onloadend = function () {
        const result = reader.result as string;
        var base64data = result.split(",")[1];

        console.log(fetcher.type);
        fetcher.submit(
          { audio: base64data },
          { method: "post", action: "/voice/command" }
        );
      };
    } else if (rawText) {
      started.current = true;
      console.log(rawText);
      setTimeout(() => {
        fetcher.submit(
          { text: rawText },
          { method: "post", action: "/voice/text" }
        );
      }, 0);

      console.log("test/");
    }
  }, [audio, fetcher, rawText]);

  return fetcher.state !== "idle" ? (
    <>Processing...</>
  ) : (
    <>
      {fetcher.data?.success ? "✅" : "❌"} {fetcher.data?.prompt}
      <br />
      {!fetcher.data?.success && fetcher.data?.message}
    </>
  );
}
