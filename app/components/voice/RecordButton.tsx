import { useRecordAudio } from "~/hooks/useRecordAudio";

export type RecordButtonProps = {
  onFinished: (audio: Blob) => void;
};
export default function RecordButton({ onFinished }: RecordButtonProps) {
  const { startRecording, stopRecording, isRecording } =
    useRecordAudio(onFinished);
  return (
    <button onClick={isRecording ? stopRecording : startRecording}>
      {isRecording ? "Stop" : "Record"}
    </button>
  );
}
