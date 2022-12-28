import { useRecordAudio } from "~/hooks/useRecordAudio";
import { MicrophoneIcon, StopIcon } from "@heroicons/react/24/solid";
import type { DetailedHTMLProps, HTMLAttributes } from "react";
export type RecordButtonProps = Omit<
  DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
  "onClick"
> & {
  onFinished: (audio: Blob) => void;
};
export default function RecordButton({
  onFinished,
  className,
  ...props
}: RecordButtonProps) {
  const { startRecording, stopRecording, isRecording } =
    useRecordAudio(onFinished);
  return (
    <button
      className={`rounded-full border p-6 ${className}`}
      onClick={isRecording ? stopRecording : startRecording}
      {...props}
    >
      {isRecording ? (
        <StopIcon className="w-12" color="red" />
      ) : (
        <MicrophoneIcon className="w-12" color="green" />
      )}
    </button>
  );
}
