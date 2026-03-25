import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthPage({
  login,
  register,
  loading,
  error,
  clearError,
  initialMode = "login",
  onLoginSuccess,
}) {
  // Remounting the component (via a `key`) keeps initialMode in sync
  // without needing effects to update state.
  const [mode, setMode] = useState(initialMode); // "login" | "register"

  return (
    <div className="min-h-screen bg-[#141336] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <h1 className="font-stencil text-4xl">Hoop Club</h1>
          <p className="text-white/70 mt-2 text-sm">
            Sign in to post and share.
          </p>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => {
              clearError();
              setMode("login");
            }}
            className={`flex-1 rounded-lg border px-4 py-2 text-sm transition ${
              mode === "login"
                ? "bg-white text-black border-white"
                : "bg-transparent border-white/30 text-white hover:bg-white/10"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              clearError();
              setMode("register");
            }}
            className={`flex-1 rounded-lg border px-4 py-2 text-sm transition ${
              mode === "register"
                ? "bg-white text-black border-white"
                : "bg-transparent border-white/30 text-white hover:bg-white/10"
            }`}
          >
            Register
          </button>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {mode === "login" ? (
          <LoginForm
            disabled={loading}
            onSubmit={async (email, password) => login(email, password)}
            onSuccess={onLoginSuccess}
          />
        ) : (
          <RegisterForm
            disabled={loading}
            onSubmit={async (username, email, password) =>
              register(username, email, password)
            }
          />
        )}
      </div>
    </div>
  );
}

