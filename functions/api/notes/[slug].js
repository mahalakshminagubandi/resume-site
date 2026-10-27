import { json, fail } from "../../../server/http.js";
import { getNote, SLUG_RE } from "../../../server/notes.js";

// Public: one published note.
export async function onRequestGet({ env, params }) {
  const slug = String(params.slug || "");
  if (!env.NOTES || !SLUG_RE.test(slug)) return fail("not-found", 404);
  const note = await getNote(env, slug);
  if (!note || !note.published) return fail("not-found", 404);
  return json(note, 200, { "cache-control": "public, max-age=30" });
}
