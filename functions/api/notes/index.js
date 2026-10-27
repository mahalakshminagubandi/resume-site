import { json } from "../../../server/http.js";
import { listNotes } from "../../../server/notes.js";

// Public: the list of published notes.
export async function onRequestGet({ env }) {
  if (!env.NOTES) return json({ initialized: false, notes: [] }, 200, { "cache-control": "no-store" });
  const data = await listNotes(env, { includeDrafts: false });
  return json(data, 200, { "cache-control": "public, max-age=30" });
}
