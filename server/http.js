// Small helpers for sending answers back from the server code.
export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...extraHeaders,
    },
  });
}

export const fail = (message, status = 400) => json({ error: message }, status);

export async function readJson(request, maxBytes = 300000) {
  const text = await request.text();
  if (text.length > maxBytes) throw new Error("too-big");
  return JSON.parse(text);
}
