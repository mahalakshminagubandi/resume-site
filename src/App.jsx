import { profile, experience, education } from "./data.js";

function Period({ start, end }) {
  return (
    <span className="period">
      {start} – {end ?? "Present"}
    </span>
  );
}

export default function App() {
  return (
    <div className="page">
      <header className="side">
        <div className="side-inner">
          <h1>{profile.name}</h1>
          <p className="title">{profile.title}</p>
          <p className="location">{profile.location}</p>

          <p className="summary">{profile.summary}</p>

          <ul className="skills" aria-label="Top skills">
            {profile.skills.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>

          <p className="contact">
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              LinkedIn profile
            </a>
          </p>
        </div>
      </header>

      <main className="main">
        <section aria-labelledby="exp-h">
          <h2 id="exp-h">Experience</h2>
          <ol className="timeline">
            {experience.map((job) => (
              <li key={job.company + job.role + job.start} className={job.end ? "job" : "job current"}>
                <Period start={job.start} end={job.end} />
                <h3>{job.role}</h3>
                <p className="company">
                  {job.company}, {job.place}
                </p>
                <p>{job.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="edu-h">
          <h2 id="edu-h">Education</h2>
          <ul className="edu">
            {education.map((e) => (
              <li key={e.school + e.degree}>
                <h3>{e.degree}</h3>
                <p className="company">{e.school}</p>
                <span className="period">{e.years}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
