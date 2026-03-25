import { apiFetch, getApiBaseUrl } from "./apiClient";

export function getMeRequest({ token }) {
  return apiFetch("/users/me", { token });
}

export async function updateMeRequest({
  token,
  bio,
  team,
  position,
  avatarFile,
}) {
  const API_URL = getApiBaseUrl();

  const form = new FormData();
  if (bio !== undefined) form.append("bio", bio);
  if (team !== undefined) form.append("team", team);
  if (position !== undefined) form.append("position", position);
  if (avatarFile) form.append("avatar", avatarFile);

  const res = await fetch(`${API_URL}/users/me`, {
    method: "PUT",
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

