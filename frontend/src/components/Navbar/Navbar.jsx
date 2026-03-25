import { useState } from "react";
import logo from "../../assets/logo1.svg";
import arrowDown from "../../assets/arrow-down.svg";

export default function Navbar({
  isAuthenticated,
  onNavigate,
  onLogout,
}) {
  const [openWho, setOpenWho] = useState(false);

  return (
    <nav className="bg-black text-white border-b border-white/20 px-6 md:px-16 py-4 flex items-center justify-between relative z-50">
      {/* Logo */}
      <div className="flex items-center">
        <img src={logo} alt="Logo" className="h-12 md:h-14" />
      </div>

      {/* Menu */}
      <div className="flex items-center gap-8 text-sm uppercase tracking-wider">
        {/* Who We Are */}
        <div className="relative">
          <button
            onClick={() => {
              setOpenWho((v) => !v);
            }}
            className="flex items-center gap-2 hover:text-gray-300"
          >
            Who We Are
            <img
              src={arrowDown}
              alt=""
              className={`w-3 h-3 transition-transform duration-200 ${
                openWho ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown */}
          <div
            className={`absolute top-full left-0 mt-2 w-44 rounded-lg border border-white/20 bg-[#141336] shadow-lg
            transition-all duration-200 origin-top
            ${
              openWho
                ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
            }`}
          >
            <a href="#" className="block px-4 py-2 hover:bg-white/10">
              About Us
            </a>
            <a href="#" className="block px-4 py-2 hover:bg-white/10">
              Our Team
            </a>
            <a href="#" className="block px-4 py-2 hover:bg-white/10">
              Vision
            </a>
          </div>
        </div>

        {/* Top-right links */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.("/");
          }}
          className="hover:text-gray-300"
        >
          Home
        </a>

        {/* Auth links (top-right) */}
        {!isAuthenticated ? (
          <>
            <a
              href="/signin"
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.("/signin");
              }}
              className="hover:text-gray-300"
            >
              Sign in
            </a>
            <a
              href="/register"
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.("/register");
              }}
              className="hover:text-gray-300"
            >
              Register
            </a>
          </>
        ) : (
          <>
            <a
              href="/dashboard"
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.("/dashboard");
              }}
              className="hover:text-gray-300"
            >
              Dashboard
            </a>
            <a
              href="/profile"
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.("/profile");
              }}
              className="hover:text-gray-300"
            >
              Profile
            </a>
            <button
              type="button"
              onClick={() => onLogout?.()}
              className="hover:text-gray-300"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}