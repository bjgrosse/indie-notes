import { Form } from "@remix-run/react";

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

export default function NewNotePage() {
  const [Commands, setCommands] = useState<Command[]>([]);
  const input = React.useRef<HTMLInputElement>(null);
  const recordingFinished = (audio: Blob) => {
    setCommands((state) => [{ id: shortid.generate(), audio }, ...state]);
  };
  const addText = () => {
    console.log(input.current?.value);
    setCommands((state) => [
      { id: shortid.generate(), rawText: input.current?.value },
      ...state,
    ]);
  };
  return (
    <div>
      <input ref={input} type="text" />
      <button onClick={addText}>Go</button>
      <RecordButton onFinished={recordingFinished} />
      {Commands.map((command, i) => (
        <p key={command.id}>
          <VoiceCommand {...command} />
        </p>
      ))}
      <Form
        method="post"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          width: "100%",
        }}
      >
        <div className="text-right">
          <button
            type="submit"
            className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Save
          </button>
        </div>
      </Form>
    </div>
  );
}
