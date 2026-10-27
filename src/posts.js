// Each note is a small object. To add a new one, copy a block, change the
// slug (letters, numbers and dashes only), title, summary and paragraphs.
export const posts = [
  {
    slug: "naturopath-to-founder",
    title: "Why a naturopath ended up building technology companies",
    summary: "I did not picture myself running technology companies. Here is how it happened.",
    paragraphs: [
      "When I was studying naturopathy, I did not picture myself running technology companies. I wanted to do something useful for people, and naturopathy let me do that in a different way from the regular medical route.",
      "The first step into technology was a practical one. My husband, Ayyappa, started a software company. I helped with production while he looked after the technology, and in the meantime I taught yoga and practised naturopathy at home.",
      "Then came a brainstorming session, and an idea: a t-shirt that shows whatever you type. Ayyappa pointed out that women have plenty of ways to show their fashion sense while men have far fewer. That thought turned into an LED panel inside a t-shirt, and that became Broadcast Wear.",
      "I still start with the root of a problem before I look for a solution. It is a habit from my earliest jobs in healthcare, and it has been useful in every company since.",
    ],
  },
  {
    slug: "patience-and-people",
    title: "What yoga and naturopathy taught me about managing people",
    summary: "Most of managing people is patience and perseverance. I learned both before I learned business.",
    paragraphs: [
      "Managing people is mostly patience and perseverance. I learned both from yoga and naturopathy long before I learned them from business.",
      "My father was a businessman, so I grew up watching how a business runs. Later I got to practise it. As an operations manager I was responsible for practically everything, from a binder clip to deciding whom to hire. Later, as COO of Possibillion, a team of 30 reported to me.",
      "Before that I worked as an HR manager, handling recruitment, attendance, salaries, training and travel for the staff. I also learned which part of the job I liked least, which was letting people go.",
      "Working alongside my husband taught me one more thing. People do not always take you seriously when you build a company together. Having a partner who backs you up, and holding your head high, makes the difference.",
    ],
  },
  {
    slug: "idli-by-machine",
    title: "Teaching a machine to make idli",
    summary: "An idli vending machine, a seven-inch screen and a plate in under a minute.",
    paragraphs: [
      "At Possibillion Technologies we built an idli vending machine. You choose your order on a seven-inch screen, pay by UPI or by scanning a QR code, and a plate of idlis arrives in under a minute with chutney and sambar. In the video The Better India made about it, a plate cost Rs 35.",
      "One press feature compared it to instant coffee: if coffee can be instant, so can idli. Idli is a good first dish for automating food because it is a filling meal that people eat every day.",
      "The company described it as the first idli vending machine of its kind in the world. For me it also shows what I enjoy most, taking something familiar and asking what happens when you add a little technology.",
    ],
  },
];

// Notes made in the admin have "blocks"; the starter notes above have "paragraphs".
export function blocksOf(note) {
  return note.blocks ?? note.paragraphs.map((text) => ({ type: "p", text }));
}

export function readingTime(note) {
  const words = blocksOf(note)
    .filter((b) => b.type === "p" || b.type === "h")
    .map((b) => b.text)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(date) {
  if (!date) return "";
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// Turns a starter note into the shape the admin saves.
export function toSavedNote(post, date) {
  return {
    slug: post.slug,
    title: post.title,
    summary: post.summary,
    date,
    published: true,
    blocks: blocksOf(post),
  };
}
