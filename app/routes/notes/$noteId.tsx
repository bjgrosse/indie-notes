import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useCatch, useLoaderData, useParams } from "@remix-run/react";
import invariant from "tiny-invariant";

import { deleteNote, getNote, updateNote } from "~/data/models/note.server";
import { requireUserId } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request);
  invariant(params.noteId, "noteId not found");

  const note = await getNote({ userId, id: params.noteId });
  if (!note) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ note });
}

export async function action({ request, params }: ActionArgs) {
  const userId = await requireUserId(request);
  invariant(params.noteId, "noteId not found");

  const formData = await request.formData();
  const action = formData.get("action");
  const title = formData.get("title");
  const body = formData.get("body");

  if (action === "delete") {
    await deleteNote({ userId, id: params.noteId });

    return redirect("/notes");
  } else {
    if (typeof title !== "string" || title.length === 0) {
      return json(
        { errors: { title: "Title is required", body: null } },
        { status: 400 }
      );
    }

    if (typeof body !== "string" || body.length === 0) {
      return json(
        { errors: { title: null, body: "Body is required" } },
        { status: 400 }
      );
    }

    return await updateNote({ userId, id: params.noteId, title, body });
  }
}

export default function NoteDetailsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <Form method="post" key={data.note.id}>
        <p>
          <input
            className="mb-2 w-full text-2xl font-bold"
            name="title"
            defaultValue={data.note.title ?? ""}
            type="text"
            placeholder="enter a title"
          />
        </p>
        <textarea className="w-full" name="body">
          {data.note.body}
        </textarea>
        <hr className="my-4" />
        <button
          type="submit"
          name="action"
          value="delete"
          className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Delete
        </button>
        <button
          type="submit"
          name="action"
          value="save"
          className="ml-4 rounded  bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </Form>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Note not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
