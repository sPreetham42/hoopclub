import { apiFetch, getApiBaseUrl } from "./apiClient";

export function getPostsRequest({ token }) {
  return apiFetch("/posts", { token });
}

export function createPostRequest({ token, title, content }) {
  return apiFetch("/posts", {
    method: "POST",
    token,
    body: { title, content },
  });
}

export async function createPostWithMediaRequest({
  token,
  title,
  content,
  mediaFiles = [],
}) {
  const API_URL = getApiBaseUrl();

  const form = new FormData();
  form.append("title", title);
  form.append("content", content);

  for (const file of mediaFiles) {
    if (!file) continue;
    form.append("media", file);
  }

  const res = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  const text = await res.text();
  const data = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Request failed with status ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function addCommentRequest({ token, postId, content }) {
  return apiFetch(`/posts/${postId}/comments`, {
    method: "POST",
    token,
    body: { content },
  });
}

export function likePostRequest({ token, postId }) {
  return apiFetch(`/posts/${postId}/like`, {
    method: "POST",
    token,
  });
}

export function unlikePostRequest({ token, postId }) {
  return apiFetch(`/posts/${postId}/like`, {
    method: "DELETE",
    token,
  });
}

