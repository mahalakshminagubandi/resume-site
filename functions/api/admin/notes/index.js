import { json } from "../../../../server/http.js";
import { requireAdmin } from "../../../../server/auth.js";
import { listNotes } from "../../../../server/notes.js";

// Admin: every note, including drafts.
export async function onRequestGet({ request, env }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;
  return json(await listNotes(env, { includeDrafts: true }));
}
