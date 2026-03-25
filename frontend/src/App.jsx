import { useCallback, useEffect, useState } from "react";
import { AuthConsumer, AuthProvider } from "./auth/AuthProvider";
import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import AuthPage from "./components/Auth/AuthPage";
import Dashboard from "./components/Dashboard/Dashboard";
import MyProfile from "./components/Profile/MyProfile";

function normalizePathname(pathname) {
  const cleaned = pathname.trim().replace(/\/+$/, "");
  return cleaned === "" ? "/" : cleaned;
}

function AppRoutes() {
  const [path, setPath] = useState(() =>
    normalizePathname(window.location.pathname)
  );

  useEffect(() => {
    const onPop = () =>
      setPath(normalizePathname(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback((to) => {
    const next = normalizePathname(to);
    window.history.pushState({}, "", next);
    setPath(next);
  }, []);

  return (
    <AuthConsumer>
      {(auth) => {
        const isAuthenticated = auth.isAuthenticated;

        let view = "home"; // home | auth | dashboard | profile
        let authMode = "login"; // login | register

        if (path === "/signin") {
          view = "auth";
          authMode = "login";
        } else if (path === "/register") {
          view = "auth";
          authMode = "register";
        } else if (path === "/dashboard") {
          view = "dashboard";
        } else if (path === "/profile") {
          view = isAuthenticated ? "profile" : "home";
        } else {
          // Default landing page (original homepage)
          view = "home";
        }

        // Redirect authenticated users away from auth pages.
        // (Doing it in render would cause loops, so keep it effect-based.)
        return (
          <>
            <Navbar
              isAuthenticated={isAuthenticated}
              onNavigate={navigate}
              onLogout={() => {
                auth.logout();
                navigate("/");
              }}
            />

            {view === "home" ? <Hero /> : null}

            {view === "auth" ? (
              <AuthPage
                key={path}
                login={auth.login}
                register={auth.register}
                loading={auth.loading}
                error={auth.error}
                clearError={auth.clearError}
                initialMode={authMode}
                onLoginSuccess={() => {
                  // After successful auth, take the user to the posts dashboard.
                  navigate("/dashboard");
                }}
              />
            ) : null}

            {view === "dashboard" ? (
              <Dashboard
                user={auth.user}
                token={auth.token}
              />
            ) : null}

            {view === "profile" ? (
              <MyProfile user={auth.user} updateProfile={auth.updateProfile} />
            ) : null}
          </>
        );
      }}
    </AuthConsumer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}