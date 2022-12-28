import { useRecordAudio } from "~/hooks/useRecordAudio";
import { MicrophoneIcon, StopIcon } from "@heroicons/react/24/solid";
import { DetailedHTMLProps, HTMLAttributes, useEffect, useRef } from "react";
import { usePrevious } from "~/hooks/usePrevious";
export type RecordButtonProps = Omit<
  DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
  "onClick"
> & {
  onFinished: (audio: Blob) => void;
  autoStart?: boolean;
};
export default function RecordButton({
  onFinished,
  className,
  autoStart,
  ...props
}: RecordButtonProps) {
  const { startRecording, stopRecording, isRecording } =
    useRecordAudio(onFinished);
  const started = useRef(false);
  const wasRecording = usePrevious(isRecording);

  useEffect(() => {
    if (autoStart && !started.current) {
      started.current = true;
      startRecording();
    }
  }, [autoStart, startRecording]);

  useEffect(() => {
    if (isRecording && !wasRecording) {
      const audio = new Audio("/sounds/recording-start.mp3");
      audio.play();
    } else if (!isRecording && wasRecording) {
      const audio = new Audio("/sounds/recording-end.wav");
      audio.play();
    }
  }, [isRecording, wasRecording]);
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
