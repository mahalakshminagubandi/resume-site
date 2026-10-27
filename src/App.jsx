import { useEffect, useState } from "react";
import { profile, about, ventures, press, experience, education } from "./data.js";
import { posts as starterPosts, blocksOf, formatDate, readingTime } from "./posts.js";
import Admin from "./Admin.jsx";

const SITE_TITLE = "Dr. Mahalakshmi Nagubandi – Naturopath, founder and builder";

/* Very small router: the part of the address after # decides what to show. */
function useHash() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}

/* Reads the list of notes from the server. Until the admin has saved anything,
   the starter notes from src/posts.js are shown instead. */
function useNoteIndex() {
  const [state, setState] = useState({ loaded: false, initialized: false, notes: [] });
  useEffect(() => {
    let cancelled = false;
    fetch("/api/notes")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("not ok"))))
      .then((d) => {
        if (!cancelled) setState({ loaded: true, initialized: Boolean(d.initialized), notes: d.notes || [] });
      })
      .catch(() => {
        if (!cancelled) setState({ loaded: true, initialized: false, notes: [] });
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const notes = state.initialized
    ? state.notes
    : starterPosts.map((p) => ({
        slug: p.slug,
        title: p.title,
        summary: p.summary,
        date: "",
        minutes: readingTime(p),
        cover: "",
      }));
  return { loaded: state.loaded, initialized: state.initialized, notes };
}

const safeSrc = (src) => (typeof src === "string" && src.startsWith("/media/") ? src : "");

function Header() {
  return (
    <header className="top">
      <div className="top-inner">
        <a className="brand" href="#/">
          {profile.short}
        </a>
        <nav aria-label="Main">
          <a href="#about">About</a>
          <a href="#built">Built</a>
          <a href="#news">News</a>
          <a href="#notes">Notes</a>
          <a href="#journey">Journey</a>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="foot">
      <div className="wrap foot-inner">
        <p className="foot-name">{profile.name}</p>
        <p>{profile.location}</p>
        <p className="foot-links">
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href="https://www.neonflake.com" target="_blank" rel="noreferrer">
            Neonflake
          </a>
        </p>
      </div>
    </footer>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="wrap hero-inner">
        <p className="hero-place">{profile.location}</p>
        <h1>
          <span>Naturopath by training.</span>
          <span className="accent">Builder by choice.</span>
        </h1>
        <p className="lede">
          I am a doctor who started companies. I have built clothes that light up, a machine that
          serves idli, and AI and hardware products, and I like starting new things.
        </p>
        <p className="hero-actions">
          <a className="btn" href="#built">
            See what I have built
          </a>
          <a className="text-link" href="#notes">
            Read my notes
          </a>
        </p>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="section" id="about" aria-labelledby="about-h">
      <div className="wrap split">
        <h2 id="about-h">About me</h2>
        <div className="prose">
          {about.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
          <ul className="chips" aria-label="Top skills">
            {profile.skills.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Built() {
  return (
    <section className="section alt" id="built" aria-labelledby="built-h">
      <div className="wrap split">
        <h2 id="built-h">What I have built</h2>
        <ul className="ventures">
          {ventures.map((v) => (
            <li key={v.name}>
              <div className="venture-head">
                <h3>{v.name}</h3>
                <p className="meta">
                  {v.role}
                  {v.years ? `, ${v.years}` : ""}
                </p>
              </div>
              <div>
                <p>{v.text}</p>
                {v.links.length > 0 && (
                  <p className="venture-links">
                    {v.links.map((l) => (
                      <a key={l.url} className="u" href={l.url} target="_blank" rel="noreferrer">
                        {l.label}
                      </a>
                    ))}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function News() {
  return (
    <section className="section" id="news" aria-labelledby="news-h">
      <div className="wrap">
        <h2 id="news-h">In the news</h2>

        <div className="media">
          <figure>
            <video
              controls
              playsInline
              preload="metadata"
              poster={press.video.poster}
              aria-label={`${press.video.outlet}: ${press.video.title}`}
            >
              <source src={press.video.src} type="video/mp4" />
              Your browser can’t play this video. <a href={press.video.src}>Download it instead</a>.
            </video>
            <figcaption>
              <strong>{press.video.outlet}:</strong> {press.video.title}. {press.video.note}
            </figcaption>
          </figure>

          <figure>
            <a href={press.clipping.src} target="_blank" rel="noreferrer">
              <img src={press.clipping.src} alt={press.clipping.alt} loading="lazy" />
            </a>
            <figcaption>
              <strong>{press.clipping.title}.</strong> {press.clipping.note}
            </figcaption>
          </figure>
        </div>

        <ul className="articles">
          {press.articles.map((a) => (
            <li key={a.url}>
              <p className="outlet">{a.outlet}</p>
              <h3>
                <a className="u" href={a.url} target="_blank" rel="noreferrer">
                  {a.title}
                </a>
              </h3>
              <p>{a.summary}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Notes({ index }) {
  return (
    <section className="section alt" id="notes" aria-labelledby="notes-h">
      <div className="wrap split">
        <h2 id="notes-h">Notes</h2>
        {!index.loaded ? (
          <p className="meta">Loading notes...</p>
        ) : index.notes.length === 0 ? (
          <p>New notes are coming soon.</p>
        ) : (
          <ul className="notes">
            {index.notes.map((n) => (
              <li key={n.slug} className={safeSrc(n.cover) ? "has-cover" : ""}>
                <div>
                  <h3>
                    <a href={`#/notes/${n.slug}`}>{n.title}</a>
                  </h3>
                  {n.summary && <p>{n.summary}</p>}
                  <p className="meta">
                    {n.date ? `${formatDate(n.date)}, ` : ""}
                    {n.minutes} min read
                  </p>
                </div>
                {safeSrc(n.cover) && <img className="note-cover" src={safeSrc(n.cover)} alt="" loading="lazy" />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Journey() {
  return (
    <section className="section" id="journey" aria-labelledby="journey-h">
      <div className="wrap split">
        <h2 id="journey-h">Journey</h2>
        <div>
          <ol className="timeline">
            {experience.map((job) => (
              <li key={job.company + job.role + job.start} className={job.end ? "job" : "job current"}>
                <span className="period">
                  {job.start} – {job.end ?? "Present"}
                </span>
                <h3>{job.role}</h3>
                <p className="meta">
                  {job.company}, {job.place}
                </p>
                <p>{job.text}</p>
              </li>
            ))}
          </ol>

          <h3 className="sub">Education</h3>
          <ul className="edu">
            {education.map((e) => (
              <li key={e.school + e.degree}>
                <p className="edu-degree">{e.degree}</p>
                <p className="meta">
                  {e.school}, {e.years}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function NoteBlocks({ blocks }) {
  return blocks.map((b, i) => {
    if (b.type === "h") {
      return (
        <h2 key={i} className="post-sub">
          {b.text}
        </h2>
      );
    }
    if (b.type === "image" && safeSrc(b.src)) {
      return (
        <figure key={i} className="post-figure">
          <img src={safeSrc(b.src)} alt={b.alt || ""} loading="lazy" />
        </figure>
      );
    }
    if (b.type === "video" && safeSrc(b.src)) {
      return (
        <figure key={i} className="post-figure">
          <video controls playsInline preload="metadata" src={safeSrc(b.src)} aria-label={b.caption || "Video"} />
          {b.caption && <figcaption>{b.caption}</figcaption>}
        </figure>
      );
    }
    if (b.type === "p") return <p key={i}>{b.text}</p>;
    return null;
  });
}

function PostPage({ slug, index }) {
  const [state, setState] = useState({ status: "loading", note: null });

  useEffect(() => {
    if (!index.loaded) return undefined;
    let cancelled = false;
    if (!index.initialized) {
      const starter = starterPosts.find((p) => p.slug === slug);
      setState(starter ? { status: "ok", note: starter } : { status: "missing", note: null });
      return undefined;
    }
    setState({ status: "loading", note: null });
    fetch(`/api/notes/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("missing"))))
      .then((note) => {
        if (!cancelled) setState({ status: "ok", note });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "missing", note: null });
      });
    return () => {
      cancelled = true;
    };
  }, [slug, index.loaded, index.initialized]);

  const note = state.note;
  useEffect(() => {
    document.title = note ? `${note.title} – ${profile.short}` : SITE_TITLE;
  }, [note]);

  return (
    <main className="post">
      <article className="wrap-narrow">
        <p className="meta">
          <a className="u" href="#notes">
            Back to all notes
          </a>
        </p>
        {state.status === "loading" && <p>Loading...</p>}
        {state.status === "missing" && <p>This note could not be found.</p>}
        {note && (
          <>
            <h1>{note.title}</h1>
            <p className="meta">
              By {profile.name}, {note.date ? `${formatDate(note.date)}, ` : ""}
              {readingTime(note)} min read
            </p>
            <div className="prose post-body">
              <NoteBlocks blocks={blocksOf(note)} />
            </div>
            <p className="post-end">
              <a className="btn" href="#notes">
                More notes
              </a>
            </p>
          </>
        )}
      </article>
    </main>
  );
}

function Site() {
  const hash = useHash();
  const index = useNoteIndex();
  const match = hash.match(/^#\/notes\/([a-z0-9-]+)$/);
  const slug = match ? match[1] : null;

  useEffect(() => {
    if (slug) {
      window.scrollTo(0, 0);
      return;
    }
    document.title = SITE_TITLE;
    if (hash === "" || hash.startsWith("#/")) {
      window.scrollTo(0, 0);
    } else {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    }
  }, [hash, slug, index.loaded]);

  return (
    <>
      <Header />
      {slug ? (
        <PostPage slug={slug} index={index} />
      ) : (
        <main>
          <Hero />
          <About />
          <Built />
          <News />
          <Notes index={index} />
          <Journey />
        </main>
      )}
      <Footer />
    </>
  );
}

export default function App() {
  const isAdmin = window.location.pathname.replace(/\/+$/, "") === "/admin";
  return isAdmin ? <Admin /> : <Site />;
}
