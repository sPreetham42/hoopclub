import { apiFetch } from "./apiClient";

export function loginRequest({ email, password }) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function registerRequest({ username, email, password }) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: { username, email, password },
  });
}

