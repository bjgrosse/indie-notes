import { useFetcher } from "@remix-run/react";
import { useEffect, useRef } from "react";
import type { TranscribeResult } from "~/routes/voice/transcribe";

// component that takes n a blob and returns a string of the transcribed text
export type TranscriptionProps = {
  audio: Blob;
};
export default function Transcription({ audio }: TranscriptionProps) {
  const started = useRef(false);
  const fetcher = useFetcher<TranscribeResult>();

  useEffect(() => {
    if (!started.current && audio) {
      started.current = true;
      var reader = new FileReader();
      reader.readAsDataURL(audio);
      reader.onloadend = function () {
        const result = reader.result as string;
        var base64data = result.split(",")[1];
        fetcher.submit(
          { audio: base64data },
          { method: "post", action: "/voice/transcribe" }
        );
      };
    }
  }, [audio, fetcher]);

  return fetcher.state !== "idle" ? "Transcribing..." : fetcher.data?.result;
}
