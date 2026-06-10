// src/components/Header.jsx
import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X, Heart, Globe, User, LogOut } from "lucide-react";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false); // mobile menu
  const [dropdown, setDropdown] = useState(false); // avatar menu
  const { t, i18n } = useTranslation();
  const nav = useNavigate();

  const changeLanguage = (e) => i18n.changeLanguage(e.target.value);

  const handleLogout = () => {
    logout();
    setDropdown(false);
    nav("/");
  };

  const workerNav = [
    { name: t("Home") || "Home", path: "/" },  // ✅ home goes to "/"
    { name: t("dashboard") || "Dashboard", path: "/dashboard" },
    { name: "Patient Records", path: "/patient-records" },
    { name: "Settings", path: "/settings" },
  ];

  const adminNav = [
    { name: t("Home") || "Home", path: "/" },  // ✅ home goes to "/"
    { name: t("dashboard") || "Dashboard", path: "/admin" },
    { name: "All Records", path: "/admin-records" },
    { name: "Reports", path: "/reports" },
    { name: "Settings", path: "/settings" },
  ];

  const navItems = user?.role === "admin" ? adminNav : workerNav;

  return (
    <header className="bg-white shadow-sm">
      {/* First row */}
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="rounded-full p-1 bg-red-50">
            <Heart className="w-6 h-6 text-red-600" />
          </div>
          <div className="leading-tight">
            <div className="text-lg font-semibold text-gray-800">
              HealthCare Kerala
            </div>
            <div className="text-xs text-gray-500 -mt-1">
              Welcome to Digital Health Records
            </div>
          </div>
        </Link>

        {/* Right side: language + auth + mobile menu */}
        <div className="flex items-center gap-3">
          {/* Language selector with globe */}
          <div className="relative hidden sm:block">
            <Globe className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <select
              onChange={changeLanguage}
              defaultValue={i18n.language || "en"}
              className="pl-7 pr-3 py-1.5 text-sm rounded-md border border-gray-200 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none appearance-none"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="ml">മലയാളം</option>
              <option value="bn">বাংলা</option>
            </select>
          </div>

          {/* Auth links / Avatar */}
          {!user ? (
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                <User className="w-4 h-4" />
                {t("login") || "Login"}
              </Link>
              <Link
                to="/signup"
                className="px-4 py-1.5 text-sm rounded-md bg-gray-900 text-white hover:bg-gray-800"
              >
                {t("signup") || "Signup"}
              </Link>
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center gap-3">
                              <button
                onClick={() => setDropdown((s) => !s)}
                className="w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold ml-2"
                style={{ backgroundColor: user.avatar?.bg || "#4f46e5" }}
              >
                {user.avatar?.letter ||
                  user.name?.charAt(0)?.toUpperCase() ||
                  "U"}
              </button>

                                          <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4" />
                {t("logout") || "Logout"}
              </button>
              </div>

              {dropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white text-black rounded shadow-lg z-20">
                  <div className="p-3 border-b">
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-xs text-gray-600">
                      {user.role === "admin"
                        ? "Admin"
                        : `Worker ID: ${user.workerId || "-"}`}
                    </div>
                  </div>
                  <Link
                    to="/"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setDropdown(false)}
                  >
                    {t("home") || "Home"}
                  </Link>
                  <Link
                    to={user.role === "admin" ? "/admin" : "/dashboard"}
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setDropdown(false)}
                  >
                    {t("dashboard") || "Dashboard"}
                  </Link>

                  <Link
                    to={user.role === "admin" ? "/admin" : "/patient-records"}
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setDropdown(false)}
                  >
                    {t("records") || "/patient-records"}
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setDropdown(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    {t("logout") || "Logout"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setOpen((s) => !s)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Second row: Nav menu (centered) */}
      <nav className="hidden md:flex justify-center space-x-10 px-6 py-3 font-medium bg-white">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `relative pb-2 transition-colors duration-300 ${isActive
                ? "text-green-700 font-semibold"
                : "text-gray-700 hover:text-black"
              }`
            }
          >
            {item.name}
            {/* Underline effect */}
            <span
              className={`absolute left-0 right-0 -bottom-1 h-0.5 bg-green-600 transform transition-transform duration-300 origin-center ${window.location.pathname === item.path
                ? "scale-x-100"
                : "scale-x-0 group-hover:scale-x-100"
                }`}
            />
          </NavLink>
        ))}
      </nav>

      {/* Mobile nav */}
      {open && (
        <div className="md:hidden bg-white px-4 py-4 border-t space-y-3">
          {/* Language selector (mobile) */}
          <div>
            <select
              onChange={changeLanguage}
              defaultValue={i18n.language || "en"}
              className="w-full text-sm rounded px-2 py-2 border border-gray-200"
              aria-label="Select language"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="ml">മലയാളം</option>
              <option value="bn">বাংলা</option>
            </select>
          </div>

          {/* Nav items */}
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `block py-2 px-2 rounded ${isActive
                    ? "text-green-700 font-semibold"
                    : "text-gray-700"
                  }`
                }
                onClick={() => setOpen(false)}
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* Auth for mobile */}
          {!user ? (
            <div className="flex gap-2">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="flex-1 text-center py-2 rounded border"
              >
                {t("login") || "Login"}
              </Link>
              <Link
                to="/signup"
                onClick={() => setOpen(false)}
                className="flex-1 text-center py-2 rounded bg-green-600 text-white"
              >
                {t("signup") || "Signup"}
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="p-2 border rounded">
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-gray-500">
                  {user.role === "admin"
                    ? "Admin"
                    : `Worker ID: ${user.workerId || "-"}`}
                </div>
              </div>
              <Link
                to="/settings"
                onClick={() => setOpen(false)}
                className="block py-2 px-2 rounded hover:bg-gray-100"
              >
                Settings
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="w-full text-left py-2 px-2 text-red-600"
              >
                {t("logout") || "Logout"}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}