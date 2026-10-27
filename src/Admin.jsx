import { useEffect, useState } from "react";
import { api, shrinkImage, uploadFile } from "./api.js";
import { formatDate, posts as starterPosts, toSavedNote } from "./posts.js";

const today = () => new Date().toISOString().slice(0, 10);

function slugify(text) {
  const slug = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
  return slug;
}

let counter = 0;
const withId = (b) => ({ ...b, id: `b${Date.now()}-${counter++}` });

/* ---------------- Login ---------------- */
function Login({ onDone }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.login(password);
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="ad-wrap ad-narrow">
      <h1>Admin</h1>
      <form className="ad-card" onSubmit={submit}>
        <label htmlFor="pw">Password</label>
        <input
          id="pw"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          autoFocus
        />
        {error && (
          <p className="ad-error" role="alert">
            {error}
          </p>
        )}
        <button className="ad-btn" type="submit" disabled={busy || !password}>
          {busy ? "Checking..." : "Log in"}
        </button>
      </form>
      <p className="ad-hint">
        <a href="/">Back to my website</a>
      </p>
    </main>
  );
}

/* ---------------- List of notes ---------------- */
function NoteList({ media, onEdit, onNew, onLoggedOut }) {
  const [state, setState] = useState({ loading: true, error: "", initialized: true, notes: [] });
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const d = await api.listNotes();
      setState({ loading: false, error: "", initialized: d.initialized, notes: d.notes });
    } catch (err) {
      if (err.status === 401) onLoggedOut();
      else setState((s) => ({ ...s, loading: false, error: err.message }));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function importStarter() {
    setBusy(true);
    try {
      const date = today();
      for (const p of [...starterPosts].reverse()) {
        try {
          await api.saveNote(p.slug, toSavedNote(p, date), true);
        } catch (err) {
          if (err.status !== 409) throw err;
        }
      }
      await load();
    } catch (err) {
      setState((s) => ({ ...s, error: err.message }));
    } finally {
      setBusy(false);
    }
  }

  async function remove(note) {
    if (!window.confirm(`Delete "${note.title}"? This cannot be undone.`)) return;
    try {
      await api.deleteNote(note.slug);
      await load();
    } catch (err) {
      setState((s) => ({ ...s, error: err.message }));
    }
  }

  async function openNote(slug) {
    try {
      onEdit(await api.getNote(slug));
    } catch (err) {
      setState((s) => ({ ...s, error: err.message }));
    }
  }

  async function logout() {
    try {
      await api.logout();
    } finally {
      onLoggedOut();
    }
  }

  return (
    <main className="ad-wrap">
      <header className="ad-head">
        <h1>Notes</h1>
        <p className="ad-head-actions">
          <button className="ad-btn" onClick={onNew} disabled={!state.initialized || state.loading}>
            New note
          </button>
          <a className="ad-btn ad-btn-light" href="/" target="_blank" rel="noreferrer">
            View my website
          </a>
          <button className="ad-btn ad-btn-light" onClick={logout}>
            Log out
          </button>
        </p>
      </header>

      {!media && (
        <p className="ad-warn">
          Picture and video storage is not connected yet, so uploads will not work. Finish the R2 step in Cloudflare.
        </p>
      )}
      {state.error && (
        <p className="ad-error" role="alert">
          {state.error}
        </p>
      )}

      {!state.loading && !state.initialized && (
        <div className="ad-card">
          <h2>First, move the starter notes here</h2>
          <p>
            Your website is still showing the 3 starter notes that came with the code. Click the button to move them into
            this admin, so you can edit or delete them. After that you can write new notes.
          </p>
          <button className="ad-btn" onClick={importStarter} disabled={busy}>
            {busy ? "Moving..." : "Move my 3 starter notes here"}
          </button>
        </div>
      )}

      {state.loading && <p>Loading...</p>}

      {state.initialized && !state.loading && state.notes.length === 0 && (
        <p>You have no notes yet. Click New note to write one.</p>
      )}

      {state.notes.length > 0 && (
        <ul className="ad-list">
          {state.notes.map((n) => (
            <li key={n.slug}>
              <div>
                <p className="ad-title">{n.title}</p>
                <p className="ad-meta">
                  {n.published ? "Published" : "Draft"}, {formatDate(n.date)}
                </p>
              </div>
              <p className="ad-row-actions">
                <button className="ad-btn ad-btn-light" onClick={() => openNote(n.slug)}>
                  Edit
                </button>
                {n.published && (
                  <a className="ad-btn ad-btn-light" href={`/#/notes/${n.slug}`} target="_blank" rel="noreferrer">
                    View
                  </a>
                )}
                <button className="ad-btn ad-btn-danger" onClick={() => remove(n)}>
                  Delete
                </button>
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

/* ---------------- One part of a note ---------------- */
function MediaPart({ block, onChange }) {
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");
  const isImage = block.type === "image";

  async function pick(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    const okType = isImage ? /^image\/(jpeg|png|webp|gif)$/ : /^video\/(mp4|webm)$/;
    if (!okType.test(file.type)) {
      setError(
        isImage
          ? "Please choose a JPG, PNG, WEBP or GIF picture. iPhone HEIC photos do not work."
          : "Please choose an MP4 or WEBM video. iPhone MOV videos do not work."
      );
      return;
    }
    if (!isImage && file.size > 90 * 1024 * 1024) {
      setError("This video is bigger than 90 MB. Please make it smaller and try again.");
      return;
    }
    try {
      setProgress(0);
      const prepared = isImage ? await shrinkImage(file) : file;
      const result = await uploadFile(prepared, setProgress);
      onChange({ src: result.url });
    } catch (err) {
      setError(err.message);
    } finally {
      setProgress(null);
    }
  }

  return (
    <div>
      {block.src &&
        (isImage ? (
          <img className="ad-preview" src={block.src} alt="" />
        ) : (
          <video className="ad-preview" src={block.src} controls preload="metadata" />
        ))}
      <label className="ad-btn ad-btn-light ad-file-label">
        {block.src ? (isImage ? "Replace picture" : "Replace video") : isImage ? "Choose a picture" : "Choose a video"}
        <input
          className="ad-file"
          type="file"
          accept={isImage ? "image/jpeg,image/png,image/webp,image/gif" : "video/mp4,video/webm"}
          onChange={pick}
        />
      </label>
      {progress !== null && <p className="ad-meta">Uploading... {progress}%</p>}
      {error && (
        <p className="ad-error" role="alert">
          {error}
        </p>
      )}
      {isImage ? (
        <>
          <label htmlFor={`alt-${block.id}`}>Describe the picture in a few words</label>
          <input
            id={`alt-${block.id}`}
            type="text"
            value={block.alt || ""}
            onChange={(e) => onChange({ alt: e.target.value })}
          />
        </>
      ) : (
        <>
          <label htmlFor={`cap-${block.id}`}>Caption (optional)</label>
          <input
            id={`cap-${block.id}`}
            type="text"
            value={block.caption || ""}
            onChange={(e) => onChange({ caption: e.target.value })}
          />
        </>
      )}
    </div>
  );
}

const PART_NAMES = { p: "Paragraph", h: "Heading", image: "Picture", video: "Video" };

/* ---------------- Editor ---------------- */
function Editor({ initial, isNew: startsNew, onClose }) {
  const [note, setNote] = useState(initial);
  const [isNew, setIsNew] = useState(startsNew);
  const [slugTouched, setSlugTouched] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ kind: "", text: "" });

  function change(patch) {
    setNote((n) => ({ ...n, ...patch }));
    setDirty(true);
  }

  function changeTitle(title) {
    const patch = { title };
    if (isNew && !slugTouched) patch.slug = slugify(title);
    change(patch);
  }

  function changeBlock(i, patch) {
    change({ blocks: note.blocks.map((b, k) => (k === i ? { ...b, ...patch } : b)) });
  }

  function moveBlock(i, step) {
    const j = i + step;
    if (j < 0 || j >= note.blocks.length) return;
    const blocks = note.blocks.slice();
    [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
    change({ blocks });
  }

  function removeBlock(i) {
    if (!window.confirm("Remove this part?")) return;
    change({ blocks: note.blocks.filter((_, k) => k !== i) });
  }

  function addBlock(type) {
    const base = type === "p" || type === "h" ? { type, text: "" } : { type, src: "" };
    change({ blocks: [...note.blocks, withId(base)] });
  }

  function close() {
    if (dirty && !window.confirm("You have changes that are not saved. Leave anyway?")) return;
    onClose();
  }

  async function save() {
    setMessage({ kind: "", text: "" });
    let slug = note.slug;
    if (!slug) slug = `note-${Date.now()}`;
    setSaving(true);
    try {
      const payload = {
        title: note.title,
        summary: note.summary,
        date: note.date,
        published: note.published,
        blocks: note.blocks.map(({ id, ...rest }) => rest),
      };
      const result = await api.saveNote(slug, payload, isNew);
      setNote((n) => ({ ...n, slug: result.note.slug }));
      setIsNew(false);
      setDirty(false);
      setMessage({
        kind: "ok",
        text: note.published
          ? "Saved. Visitors may need up to a minute to see the change."
          : "Saved as a draft. Only you can see it.",
      });
    } catch (err) {
      setMessage({ kind: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="ad-wrap ad-editor">
      <header className="ad-head">
        <h1>{isNew ? "New note" : "Edit note"}</h1>
        <p className="ad-head-actions">
          <button className="ad-btn ad-btn-light" onClick={close}>
            Back to all notes
          </button>
        </p>
      </header>

      <div className="ad-card">
        <label htmlFor="title">Title</label>
        <input id="title" type="text" value={note.title} onChange={(e) => changeTitle(e.target.value)} />

        <label htmlFor="summary">Short summary (shown in the list of notes)</label>
        <input id="summary" type="text" value={note.summary} onChange={(e) => change({ summary: e.target.value })} />

        <div className="ad-two">
          <div>
            <label htmlFor="date">Date</label>
            <input id="date" type="date" value={note.date} onChange={(e) => change({ date: e.target.value })} />
          </div>
          <div>
            <label htmlFor="slug">Web address</label>
            <input
              id="slug"
              type="text"
              value={note.slug}
              disabled={!isNew}
              onChange={(e) => {
                setSlugTouched(true);
                change({ slug: slugify(e.target.value) });
              }}
            />
            <p className="ad-meta">Ends with /#/notes/{note.slug || "..."}</p>
          </div>
        </div>

        <label className="ad-check">
          <input
            type="checkbox"
            checked={note.published}
            onChange={(e) => change({ published: e.target.checked })}
          />
          Show this note on my website
        </label>
      </div>

      <h2 className="ad-section">Content</h2>
      {note.blocks.length === 0 && <p>Add your first paragraph, picture or video with the buttons below.</p>}

      {note.blocks.map((b, i) => (
        <div className="ad-card ad-part" key={b.id}>
          <div className="ad-part-head">
            <strong>{PART_NAMES[b.type]}</strong>
            <span className="ad-row-actions">
              <button className="ad-btn ad-btn-light" onClick={() => moveBlock(i, -1)} disabled={i === 0}>
                Move up
              </button>
              <button
                className="ad-btn ad-btn-light"
                onClick={() => moveBlock(i, 1)}
                disabled={i === note.blocks.length - 1}
              >
                Move down
              </button>
              <button className="ad-btn ad-btn-danger" onClick={() => removeBlock(i)}>
                Remove
              </button>
            </span>
          </div>
          {b.type === "p" && (
            <textarea
              rows={6}
              value={b.text}
              aria-label="Paragraph text"
              onChange={(e) => changeBlock(i, { text: e.target.value })}
            />
          )}
          {b.type === "h" && (
            <input
              type="text"
              value={b.text}
              aria-label="Heading text"
              onChange={(e) => changeBlock(i, { text: e.target.value })}
            />
          )}
          {(b.type === "image" || b.type === "video") && (
            <MediaPart block={b} onChange={(patch) => changeBlock(i, patch)} />
          )}
        </div>
      ))}

      <p className="ad-add">
        <button className="ad-btn ad-btn-light" onClick={() => addBlock("p")}>
          Add paragraph
        </button>
        <button className="ad-btn ad-btn-light" onClick={() => addBlock("h")}>
          Add heading
        </button>
        <button className="ad-btn ad-btn-light" onClick={() => addBlock("image")}>
          Add picture
        </button>
        <button className="ad-btn ad-btn-light" onClick={() => addBlock("video")}>
          Add video
        </button>
      </p>

      <div className="ad-savebar">
        <button className="ad-btn" onClick={save} disabled={saving || !note.title.trim()}>
          {saving ? "Saving..." : "Save"}
        </button>
        {message.text && (
          <p className={message.kind === "error" ? "ad-error" : "ad-ok"} role="status">
            {message.text}
          </p>
        )}
        {!isNew && note.published && (
          <a className="ad-btn ad-btn-light" href={`/#/notes/${note.slug}`} target="_blank" rel="noreferrer">
            View on my website
          </a>
        )}
      </div>
    </main>
  );
}

/* ---------------- The whole admin ---------------- */
export default function Admin() {
  const [view, setView] = useState("loading");
  const [media, setMedia] = useState(true);
  const [editing, setEditing] = useState(null);

  async function start() {
    try {
      const me = await api.me();
      setMedia(me.media !== false);
      setView("list");
    } catch (err) {
      setView(err.status === 503 ? "setup" : "login");
    }
  }

  useEffect(() => {
    document.title = "Admin";
    let tag = document.querySelector('meta[name="robots"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.name = "robots";
      document.head.appendChild(tag);
    }
    tag.content = "noindex";
    start();
  }, []);

  if (view === "loading") {
    return (
      <main className="ad-wrap ad-narrow">
        <p>Loading...</p>
      </main>
    );
  }
  if (view === "setup") {
    return (
      <main className="ad-wrap ad-narrow">
        <h1>Admin</h1>
        <p className="ad-warn">
          The admin is not set up yet. Please finish the Cloudflare steps (the notes store, the password and the secret),
          then deploy the site again.
        </p>
      </main>
    );
  }
  if (view === "login") return <Login onDone={start} />;

  if (editing) {
    const initial = { ...editing.note, blocks: editing.note.blocks.map(withId) };
    return (
      <Editor
        key={editing.note.slug || "new"}
        initial={initial}
        isNew={editing.isNew}
        onClose={() => setEditing(null)}
      />
    );
  }

  return (
    <NoteList
      media={media}
      onEdit={(note) => setEditing({ note, isNew: false })}
      onNew={() =>
        setEditing({
          note: { slug: "", title: "", summary: "", date: today(), published: false, blocks: [{ type: "p", text: "" }] },
          isNew: true,
        })
      }
      onLoggedOut={() => setView("login")}
    />
  );
}
