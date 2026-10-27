import { json, fail } from "../../../server/http.js";
import { requireAdmin } from "../../../server/auth.js";

const MB = 1024 * 1024;
const ALLOWED = {
  "image/jpeg": { ext: "jpg", kind: "image", max: 10 * MB },
  "image/png": { ext: "png", kind: "image", max: 10 * MB },
  "image/webp": { ext: "webp", kind: "image", max: 10 * MB },
  "image/gif": { ext: "gif", kind: "image", max: 10 * MB },
  "video/mp4": { ext: "mp4", kind: "video", max: 90 * MB },
  "video/webm": { ext: "webm", kind: "video", max: 90 * MB },
};

function randomName(ext) {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  const rand = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${Date.now()}-${rand}.${ext}`;
}

// Admin: upload one picture or video. The file is the whole request body.
export async function onRequestPost({ request, env }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;
  if (!env.MEDIA) return fail("Picture and video storage is not connected yet.", 503);

  const type = (request.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  const rule = ALLOWED[type];
  if (!rule) return fail("This kind of file is not allowed. Use JPG, PNG, WEBP, GIF, MP4 or WEBM.", 415);

  const length = Number(request.headers.get("content-length"));
  if (!Number.isFinite(length) || length <= 0) return fail("The file size is missing.", 411);
  if (length > rule.max) {
    return fail(`This file is too big. The limit is ${Math.round(rule.max / MB)} MB for a ${rule.kind}.`, 413);
  }

  const name = randomName(rule.ext);
  await env.MEDIA.put(name, request.body, { httpMetadata: { contentType: type } });
  return json({ url: `/media/${name}`, kind: rule.kind });
}
