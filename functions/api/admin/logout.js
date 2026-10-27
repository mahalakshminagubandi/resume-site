import { json } from "../../../server/http.js";
import { clearCookie } from "../../../server/auth.js";

export async function onRequestPost() {
  return json({ ok: true }, 200, { "set-cookie": clearCookie() });
}
