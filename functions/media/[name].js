// Public: sends back an uploaded picture or video (with support for video seeking).
export async function onRequestGet({ request, env, params }) {
  const name = String(params.name || "");
  if (!env.MEDIA || !/^[A-Za-z0-9._-]{1,120}$/.test(name)) return new Response("Not found", { status: 404 });

  const wantsRange = request.headers.has("range");
  let object;
  try {
    object = wantsRange ? await env.MEDIA.get(name, { range: request.headers }) : await env.MEDIA.get(name);
  } catch {
    return new Response("Range not satisfiable", { status: 416 });
  }
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("accept-ranges", "bytes");
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("x-content-type-options", "nosniff");

  let status = 200;
  if (wantsRange && object.range) {
    const size = object.size;
    const r = object.range;
    let start = 0;
    let end = size - 1;
    if ("suffix" in r && r.suffix !== undefined) {
      start = Math.max(0, size - r.suffix);
    } else {
      start = r.offset ?? 0;
      end = r.length !== undefined ? Math.min(size - 1, start + r.length - 1) : size - 1;
    }
    headers.set("content-range", `bytes ${start}-${end}/${size}`);
    headers.set("content-length", String(end - start + 1));
    status = 206;
  } else {
    headers.set("content-length", String(object.size));
  }
  return new Response(object.body, { status, headers });
}
