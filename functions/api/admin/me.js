import { json } from "../../../server/http.js";
import { requireAdmin } from "../../../server/auth.js";

export async function onRequestGet({ request, env }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;
  return json({ ok: true, media: Boolean(env.MEDIA) });
}
