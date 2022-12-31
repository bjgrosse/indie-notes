import * as React from "react";
import { useState } from "react";
import RecordButton from "~/components/voice/RecordButton";
import VoiceCommand from "~/components/voice/VoiceCommand";
import shortid from "shortid";
type Command = {
  id: string;
  audio?: Blob;
  rawText?: string;
};

export default function QuickVoiceCommandPage() {
  const [Commands, setCommands] = useState<Command[]>([]);
  const input = React.useRef<HTMLInputElement>(null);
  const devMode = true;
  const recordingFinished = (audio: Blob) => {
    setCommands((state) => [{ id: shortid.generate(), audio }, ...state]);
  };
  const addText = () => {
    setCommands((state) => [
      { id: shortid.generate(), rawText: input.current?.value },
      ...state,
    ]);
  };
  return (
    <div className="flex h-full w-full flex-col items-center p-12">
      {devMode && (
        <>
          <input ref={input} type="text" />
          <button onClick={addText}>Go</button>
        </>
      )}
      <RecordButton
        onFinished={recordingFinished}
        className="mb-12 self-center"
        autoStart={!devMode}
      />
      <div className="flex max-h-full min-h-0 w-96 max-w-full flex-shrink flex-col items-stretch  overflow-y-auto">
        {Commands.map((command, i) => (
          <VoiceCommand key={command.id} {...command} />
        ))}
      </div>
    </div>
  );
}
