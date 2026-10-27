// Reading, checking and saving notes in the NOTES store (Cloudflare KV).
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MEDIA_RE = /^\/media\/[A-Za-z0-9._-]{1,120}$/;
const TYPES = ["p", "h", "image", "video"];

export function minutesToRead(blocks) {
  const words = blocks
    .filter((b) => b.type === "p" || b.type === "h")
    .map((b) => b.text)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const text = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function validateNote(input, slug) {
  if (!input || typeof input !== "object") return { error: "That note could not be read." };
  if (!SLUG_RE.test(slug) || slug.length > 80) {
    return { error: "The web address can only use small letters, numbers and dashes." };
  }
  const title = text(input.title, 160);
  if (!title) return { error: "Please add a title." };
  if (!Array.isArray(input.blocks) || input.blocks.length === 0) {
    return { error: "Please add some text, a picture or a video." };
  }
  if (input.blocks.length > 150) return { error: "This note has too many parts." };

  const blocks = [];
  for (const b of input.blocks) {
    if (!b || !TYPES.includes(b.type)) return { error: "One part of the note has an unknown type." };
    if (b.type === "p" || b.type === "h") {
      const t = text(b.text, 20000);
      if (t) blocks.push({ type: b.type, text: t });
    } else {
      const src = typeof b.src === "string" ? b.src : "";
      if (!MEDIA_RE.test(src)) return { error: "A picture or video is missing. Upload it or remove that part." };
      blocks.push(
        b.type === "image"
          ? { type: "image", src, alt: text(b.alt, 300) }
          : { type: "video", src, caption: text(b.caption, 300) }
      );
    }
  }
  if (blocks.length === 0) return { error: "Please add some text, a picture or a video." };

  let date = text(input.date, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
    date = new Date().toISOString().slice(0, 10);
  }

  return {
    note: {
      slug,
      title,
      summary: text(input.summary, 300),
      date,
      published: input.published === true,
      blocks,
    },
  };
}

function toEntry(note) {
  const cover = note.blocks.find((b) => b.type === "image");
  return {
    slug: note.slug,
    title: note.title,
    summary: note.summary,
    date: note.date,
    published: note.published,
    minutes: minutesToRead(note.blocks),
    cover: cover ? cover.src : "",
    updatedAt: note.updatedAt,
  };
}

const newestFirst = (a, b) =>
  b.date.localeCompare(a.date) || String(b.updatedAt).localeCompare(String(a.updatedAt));

// null means "nothing has been saved yet" (the site then shows the starter notes).
export async function getIndex(env) {
  const idx = await env.NOTES.get("index", "json");
  return Array.isArray(idx) ? idx : null;
}

export async function listNotes(env, { includeDrafts }) {
  const idx = await getIndex(env);
  if (idx === null) return { initialized: false, notes: [] };
  const notes = (includeDrafts ? idx : idx.filter((e) => e.published)).slice().sort(newestFirst);
  return { initialized: true, notes };
}

export function getNote(env, slug) {
  return env.NOTES.get(`note:${slug}`, "json");
}

export async function saveNote(env, note) {
  const now = new Date().toISOString();
  const existing = await getNote(env, note.slug);
  const full = { ...note, createdAt: existing?.createdAt || now, updatedAt: now };
  await env.NOTES.put(`note:${note.slug}`, JSON.stringify(full));
  const idx = (await getIndex(env)) ?? [];
  await env.NOTES.put("index", JSON.stringify([toEntry(full), ...idx.filter((e) => e.slug !== note.slug)]));
  return full;
}

export async function deleteNote(env, slug) {
  await env.NOTES.delete(`note:${slug}`);
  const idx = (await getIndex(env)) ?? [];
  await env.NOTES.put("index", JSON.stringify(idx.filter((e) => e.slug !== slug)));
}
