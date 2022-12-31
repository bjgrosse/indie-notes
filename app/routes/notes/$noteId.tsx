import type { ActionArgs, LoaderArgs, TypedResponse } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useCatch,
  useLoaderData,
  useParams,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import type { Role } from "~/data/constants";

import {
  deleteNote,
  getNote,
  shareNote,
  updateNote,
} from "~/data/models/note.server";
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

export async function action({
  request,
  params,
}: ActionArgs): Promise<
  TypedResponse<{ errors: { title?: string; body?: string; email?: string } }>
> {
  const userId = await requireUserId(request);
  invariant(params.noteId, "noteId not found");

  const formData = await request.formData();
  const action = formData.get("action");
  const title = formData.get("title");
  const body = formData.get("body");
  const email = formData.get("email");
  const role = formData.get("role") as Role;

  if (action === "delete") {
    await deleteNote({ userId, id: params.noteId });

    return redirect("/notes");
  } else if (action === "save") {
    if (typeof title !== "string" || title.length === 0) {
      return json({ errors: { title: "Title is required" } }, { status: 400 });
    }

    if (typeof body !== "string" || body.length === 0) {
      return json({ errors: { body: "Body is required" } }, { status: 400 });
    }
    await updateNote({ userId, id: params.noteId, title, body });
  } else if (action === "share") {
    if (typeof email !== "string" || email.length === 0) {
      return json({ errors: { email: "Email is required" } }, { status: 400 });
    }

    try {
      await shareNote({ email, id: params.noteId, role, userId });
    } catch (error) {
      if ((error as Error).message?.includes("Unique constraint failed")) {
        return json(
          { errors: { email: "User already has access" } },
          { status: 400 }
        );
      } else {
        throw error;
      }
    }
  }

  return json({ errors: {} });
}

export default function NoteDetailsPage() {
  const data = useLoaderData<typeof loader>();

  const actionData = useActionData<typeof action>();

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
        <hr className="my-4" />
        <div>
          <span className="mr-2 align-middle">Share with</span>
          <input
            name="email"
            type="email"
            placeholder="enter email"
            aria-invalid={actionData?.errors?.email ? true : undefined}
            aria-errormessage={
              actionData?.errors?.email ? "email-error" : undefined
            }
          />
          <select name="role" defaultValue="editor">
            <option value="owner">Owner</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>

          <button
            type="submit"
            name="action"
            value="share"
            className="ml-4 rounded bg-blue-500  py-1 px-4 align-middle text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Share
          </button>

          {actionData?.errors?.email && (
            <div className="pt-1 text-red-700" id="title-error">
              {actionData.errors.email}
            </div>
          )}
        </div>
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
