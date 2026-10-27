import { json } from "./http.js";

const enc = new TextEncoder();
const COOKIE = "__Host-session";
const SESSION_SECONDS = 60 * 60 * 24 * 7; // stay logged in for 7 days
const MAX_FAILS = 5; // wrong passwords allowed...
const LOCK_SECONDS = 15 * 60; // ...before waiting 15 minutes

function toB64url(buf) {
  let s = "";
  for (const x of new Uint8Array(buf)) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(str) {
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function hmacKey(secret, usages) {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, usages);
}

// Compares two texts without leaking where they differ.
export async function safeEqual(a, b) {
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(a)),
    crypto.subtle.digest("SHA-256", enc.encode(b)),
  ]);
  const x = new Uint8Array(ha);
  const y = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

export function configured(env) {
  return Boolean(
    env.ADMIN_PASSWORD && env.SESSION_SECRET && String(env.SESSION_SECRET).length >= 16 && env.NOTES
  );
}

export async function makeSession(env) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const nonce = toB64url(crypto.getRandomValues(new Uint8Array(12)));
  const payload = `${exp}.${nonce}`;
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(env.SESSION_SECRET, ["sign"]), enc.encode(payload));
  return `${payload}.${toB64url(sig)}`;
}

async function checkSession(token, env) {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [exp, nonce, sig] = parts;
  if (!/^\d+$/.test(exp) || Number(exp) < Math.floor(Date.now() / 1000)) return false;
  try {
    return await crypto.subtle.verify(
      "HMAC",
      await hmacKey(env.SESSION_SECRET, ["verify"]),
      fromB64url(sig),
      enc.encode(`${exp}.${nonce}`)
    );
  } catch {
    return false;
  }
}

function readCookie(request, name) {
  const header = request.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i > -1 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return "";
}

export const sessionCookie = (token) =>
  `${COOKIE}=${token}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Strict`;
export const clearCookie = () => `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;

// Blocks requests that come from other websites.
export function sameSiteOnly(request) {
  if (request.headers.get("x-requested-with") !== "admin-app") return false;
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return false;
  return true;
}

// Returns null when the visitor is the logged-in admin, otherwise an error answer.
export async function requireAdmin(request, env) {
  if (!configured(env)) return json({ error: "not-configured" }, 503);
  if (request.method !== "GET" && request.method !== "HEAD" && !sameSiteOnly(request)) {
    return json({ error: "Blocked request" }, 403);
  }
  const token = readCookie(request, COOKIE);
  if (!token || !(await checkSession(token, env))) return json({ error: "Please log in" }, 401);
  return null;
}

export async function checkLogin(request, env, password) {
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const key = `rl:${ip}`;
  const fails = Number(await env.NOTES.get(key)) || 0;
  if (fails >= MAX_FAILS) return "locked";
  if (typeof password === "string" && password.length <= 200 && (await safeEqual(password, env.ADMIN_PASSWORD))) {
    if (fails) await env.NOTES.delete(key);
    return "ok";
  }
  await env.NOTES.put(key, String(fails + 1), { expirationTtl: LOCK_SECONDS });
  return "bad";
}
