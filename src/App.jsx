import { useEffect, useState } from "react";
import { profile, about, ventures, press, experience, education } from "./data.js";
import { posts, readingTime } from "./posts.js";

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

function Notes() {
  return (
    <section className="section alt" id="notes" aria-labelledby="notes-h">
      <div className="wrap split">
        <h2 id="notes-h">Notes</h2>
        <ul className="notes">
          {posts.map((p) => (
            <li key={p.slug}>
              <h3>
                <a href={`#/notes/${p.slug}`}>{p.title}</a>
              </h3>
              <p>{p.summary}</p>
              <p className="meta">{readingTime(p)} min read</p>
            </li>
          ))}
        </ul>
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

function Post({ post }) {
  return (
    <main className="post">
      <article className="wrap-narrow">
        <p className="meta">
          <a className="u" href="#notes">
            Back to all notes
          </a>
        </p>
        <h1>{post.title}</h1>
        <p className="meta">By {profile.name}, {readingTime(post)} min read</p>
        <div className="prose post-body">
          {post.paragraphs.map((t) => (
            <p key={t.slice(0, 24)}>{t}</p>
          ))}
        </div>
        <p className="post-end">
          <a className="btn" href="#notes">
            More notes
          </a>
        </p>
      </article>
    </main>
  );
}

export default function App() {
  const hash = useHash();
  const match = hash.match(/^#\/notes\/([\w-]+)$/);
  const post = match ? posts.find((p) => p.slug === match[1]) : null;

  useEffect(() => {
    document.title = post ? `${post.title} – ${profile.short}` : SITE_TITLE;
    if (post || hash === "" || hash.startsWith("#/")) {
      window.scrollTo(0, 0);
    } else {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    }
  }, [hash, post]);

  return (
    <>
      <Header />
      {post ? (
        <Post post={post} />
      ) : (
        <main>
          <Hero />
          <About />
          <Built />
          <News />
          <Notes />
          <Journey />
        </main>
      )}
      <Footer />
    </>
  );
}
