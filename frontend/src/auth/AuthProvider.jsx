import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginRequest, registerRequest } from "../api/authApi";
import { getMeRequest, updateMeRequest } from "../api/usersApi";

const AuthContext = createContext(null);

const TOKEN_KEY = "hoopclub_token";
const USER_KEY = "hoopclub_user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Keep localStorage in sync if state changes.
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);

    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [token, user]);

  const value = useMemo(() => {
    const isAuthenticated = Boolean(token && user);

    return {
      token,
      user,
      isAuthenticated,
      loading,
      error,
      async login(email, password) {
        setLoading(true);
        setError(null);
        try {
          const result = await loginRequest({ email, password });
          setUser(result.user);
          setToken(result.token);
        } catch (e) {
          setError(e?.message ?? "Login failed");
          setUser(null);
          setToken(null);
          throw e;
        } finally {
          setLoading(false);
        }
      },
      async register(username, email, password) {
        setLoading(true);
        setError(null);
        try {
          const result = await registerRequest({ username, email, password });
          // Your backend currently returns the created user only.
          // We keep this simple: after register, user can log in.
          setUser(result.user);
          // Optionally you can also implement token return on backend later.
          setToken(null);
        } catch (e) {
          setError(e?.message ?? "Registration failed");
          setUser(null);
          setToken(null);
          throw e;
        } finally {
          setLoading(false);
        }
      },
      logout() {
        setUser(null);
        setToken(null);
        setError(null);
      },
      async refreshMe() {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
          const result = await getMeRequest({ token });
          setUser(result);
        } catch (e) {
          setError(e?.message ?? "Failed to refresh profile");
          throw e;
        } finally {
          setLoading(false);
        }
      },
      async updateProfile({ bio, team, position, avatarFile }) {
        if (!token) throw new Error("Not authenticated");
        setLoading(true);
        setError(null);
        try {
          const updated = await updateMeRequest({
            token,
            bio,
            team,
            position,
            avatarFile,
          });
          setUser(updated);
          return updated;
        } catch (e) {
          setError(e?.message ?? "Failed to update profile");
          throw e;
        } finally {
          setLoading(false);
        }
      },
      clearError() {
        setError(null);
      },
    };
  }, [error, loading, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthConsumer({ children }) {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthConsumer must be used within AuthProvider");
  return children(ctx);
}

