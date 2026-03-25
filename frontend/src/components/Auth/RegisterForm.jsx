import { useState } from "react";

export default function RegisterForm({ disabled, onSubmit }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [localError, setLocalError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  return (
    <form
      className="rounded-3xl border border-white/20 bg-white/5 backdrop-blur-md p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setLocalError(null);
        setSuccessMsg(null);

        if (!username || !email || !password) {
          setLocalError("Username, email, and password are required.");
          return;
        }

        try {
          await onSubmit(username, email, password);
          // Backend register doesn't return a token, so we instruct the user to login.
          setSuccessMsg(
            "Account created. Please sign in using your email and password."
          );
        } catch (err) {
          setLocalError(err?.message ?? "Registration failed.");
        }
      }}
    >
      <div className="mb-4">
        <label className="block text-sm mb-2">Username</label>
        <input
          className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/50"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={disabled}
          autoComplete="username"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm mb-2">Email</label>
        <input
          className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/50"
          value={email}
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          disabled={disabled}
          autoComplete="email"
          required
        />
      </div>

      <div className="mb-5">
        <label className="block text-sm mb-2">Password</label>
        <input
          className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/50"
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          disabled={disabled}
          autoComplete="new-password"
          required
        />
      </div>

      {localError ? (
        <div className="mb-4 rounded-lg border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {localError}
        </div>
      ) : null}

      {successMsg ? (
        <div className="mb-4 rounded-lg border border-green-500/60 bg-green-500/10 px-4 py-3 text-sm text-green-200">
          {successMsg}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={disabled}
        className="w-full rounded-lg bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90 disabled:opacity-50"
      >
        {disabled ? "Creating..." : "Create account"}
      </button>
    </form>
  );
}

