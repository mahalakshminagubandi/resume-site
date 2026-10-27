import { json, fail, readJson } from "../../../../server/http.js";
import { requireAdmin } from "../../../../server/auth.js";
import { deleteNote, getNote, saveNote, SLUG_RE, validateNote } from "../../../../server/notes.js";

export async function onRequestGet({ request, env, params }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;
  const slug = String(params.slug || "");
  if (!SLUG_RE.test(slug)) return fail("not-found", 404);
  const note = await getNote(env, slug);
  return note ? json(note) : fail("not-found", 404);
}

// Create (add ?new=1) or update a note.
export async function onRequestPut({ request, env, params }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;
  const slug = String(params.slug || "");
  let body;
  try {
    body = await readJson(request);
  } catch {
    return fail("That note is too big or could not be read.");
  }
  const checked = validateNote(body, slug);
  if (checked.error) return fail(checked.error);
  if (new URL(request.url).searchParams.get("new") === "1" && (await getNote(env, slug))) {
    return fail("A note with this web address already exists. Please change the web address.", 409);
  }
  const saved = await saveNote(env, checked.note);
  return json({ ok: true, note: saved });
}

export async function onRequestDelete({ request, env, params }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;
  const slug = String(params.slug || "");
  if (!SLUG_RE.test(slug)) return fail("not-found", 404);
  await deleteNote(env, slug);
  return json({ ok: true });
}
