// Talks to the server code in the "functions" folder.
async function request(path, options = {}) {
  const res = await fetch(path, {
    credentials: "same-origin",
    ...options,
    headers: { "x-requested-with": "admin-app", ...(options.headers || {}) },
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    const error = new Error((data && data.error) || "Something went wrong.");
    error.status = res.status;
    throw error;
  }
  return data;
}

const jsonOptions = (method, body) => ({
  method,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

export const api = {
  me: () => request("/api/admin/me"),
  login: (password) => request("/api/admin/login", jsonOptions("POST", { password })),
  logout: () => request("/api/admin/logout", { method: "POST" }),
  listNotes: () => request("/api/admin/notes"),
  getNote: (slug) => request(`/api/admin/notes/${slug}`),
  saveNote: (slug, note, isNew) =>
    request(`/api/admin/notes/${slug}${isNew ? "?new=1" : ""}`, jsonOptions("PUT", note)),
  deleteNote: (slug) => request(`/api/admin/notes/${slug}`, { method: "DELETE" }),
};

// Uploads one file and reports progress (0 to 100).
export function uploadFile(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");
    xhr.setRequestHeader("content-type", file.type);
    xhr.setRequestHeader("x-requested-with", "admin-app");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let data = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = null;
      }
      if (xhr.status >= 200 && xhr.status < 300 && data && data.url) resolve(data);
      else reject(new Error((data && data.error) || "The upload did not work."));
    };
    xhr.onerror = () => reject(new Error("The internet connection failed. Please try again."));
    xhr.send(file);
  });
}

// Makes big photos smaller before uploading, so the website stays fast.
export async function shrinkImage(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1.5 * 1024 * 1024) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (blob && blob.size < file.size) return new File([blob], "photo.jpg", { type: "image/jpeg" });
    return file;
  } catch {
    return file;
  }
}
