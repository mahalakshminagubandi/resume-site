import { json, fail, readJson } from "../../../server/http.js";
import { checkLogin, clearCookie, configured, makeSession, sameSiteOnly, sessionCookie } from "../../../server/auth.js";

export async function onRequestPost({ request, env }) {
  if (!configured(env)) return json({ error: "not-configured" }, 503);
  if (!sameSiteOnly(request)) return fail("Blocked request", 403);
  let body;
  try {
    body = await readJson(request, 2000);
  } catch {
    return fail("Please type your password.");
  }
  const result = await checkLogin(request, env, body && body.password);
  if (result === "locked") return json({ error: "Too many wrong tries. Please wait 15 minutes." }, 429);
  if (result !== "ok") return json({ error: "That password is not right." }, 401, { "set-cookie": clearCookie() });
  return json({ ok: true }, 200, { "set-cookie": sessionCookie(await makeSession(env)) });
}
