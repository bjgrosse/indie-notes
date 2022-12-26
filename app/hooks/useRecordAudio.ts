import { useCallback, useState } from "react";

export type RecordAudio = {
  startRecording: () => void;
  stopRecording: () => void;
  audio: Blob | null;
  isRecording: boolean;
};
/**
 * A hook which records audio in the browser. It returns a function which can be called to start recording.
 */
export const useRecordAudio = (
  onFinished: (audio: Blob) => void
): RecordAudio => {
  const [audio, setAudio] = useState<Blob | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const startRecording = useCallback(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        const chunks: BlobPart[] = [];

        mediaRecorder.addEventListener("dataavailable", (event) => {
          chunks.push(event.data);
        });

        mediaRecorder.addEventListener("stop", () => {
          const blob = new Blob(chunks);
          setIsRecording(false);
          onFinished(blob);
          setAudio(blob);
        });

        mediaRecorder.start();
        setIsRecording(true);
        setRecorder(mediaRecorder);
      })
      .catch((err) => {
        setIsRecording(false);
        console.error("Error recording audio: ", err);
      });
  }, [onFinished]);

  const stopRecording = useCallback(() => {
    recorder?.stop();
  }, [recorder]);

  return { startRecording, stopRecording, audio, isRecording };
};
