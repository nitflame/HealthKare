// src/pages/Signup.jsx
import { useTranslation } from "react-i18next";
import React, { useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [workerId, setWorkerId] = useState("");
  const { t } = useTranslation();

  const { setUser, setToken } = useContext(AuthContext);
  const nav = useNavigate();

  // Generate avatar
  const generateAvatar = (name) => {
    if (!name) return { letter: "", bg: "#6b7280" };
    const firstLetter = name.charAt(0).toUpperCase();
    const colors = ["#4f46e5", "#dc2626", "#16a34a", "#9333ea", "#f59e0b"];
    const bg = colors[name.charCodeAt(0) % colors.length];
    return { letter: firstLetter, bg };
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const avatar = generateAvatar(name);
      const res = await API.post("/auth/signup", {
        name,
        phone,
        email,
        password,
        role,
        avatar,
      });

      //localStorage.setItem("token", res.data.token);
      sessionStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);

      setWorkerId(res.data.user.workerId);

      if (res.data.user.role === "admin") nav("/admin");
      else nav("/dashboard");
    } catch (err) {
      alert(err.response?.data?.msg || "Signup error");
    }
  };

  const avatarPreview = generateAvatar(name);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 pt-4 pb-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 border"
      >
        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          {t("signupTitle", "Signup")}
        </h2>
        <p className="text-sm text-center text-gray-500 mb-6">
          {t("signupSubtitle", "Create your account to access health records")}
        </p>

        {/* Avatar Preview */}
        {name && (
          <div className="flex justify-center mb-6">
            <div
              className="w-16 h-16 flex items-center justify-center rounded-full text-white font-bold text-xl shadow"
              style={{ backgroundColor: avatarPreview.bg }}
            >
              {avatarPreview.letter}
            </div>
          </div>
        )}

        {/* Name */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("fullName", "Full Name")}
        </label>
        <input
          className="w-full border rounded-md px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("fullNamePlaceholder", "Enter your full name")}
          required
        />

        {/* Phone */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("phoneNumber", "Phone Number")}
        </label>
        <input
          className="w-full border rounded-md px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t("phoneNumberPlaceholder", "Enter your phone number")}
          required
        />

        {/* Email */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("emailOptional", "Email (optional)")}
        </label>
        <input
          className="w-full border rounded-md px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("emailPlaceholder", "Enter your email")}
        />

        {/* Password */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("password", "Password")}
        </label>
        <input
          type="password"
          className="w-full border rounded-md px-3 py-2 mb-6 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("passwordPlaceholder", "Enter your password")}
          required
        />

        {/* Role */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("role", "Role")}
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border rounded-md px-3 py-2 mb-6 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="user">{t("worker", "Worker")}</option>
          <option value="admin">{t("admin", "Admin")}</option>
        </select>

        {/* Signup button */}
        <button
          type="submit"
          className="w-full py-2.5 rounded-md bg-gray-900 text-white font-medium hover:bg-gray-800 transition"
        >
          {t("signupButton", "Signup")}
        </button>

        {/* Already have account */}
        <p className="text-center text-sm text-gray-600 mt-4">
          {t("alreadyHaveAccount", "Already have an account?")}{" "}
          <Link to="/login" className="text-green-600 hover:underline">
            {t("login", "Login")}
          </Link>
        </p>

        {/* Worker ID info */}
        {workerId && (
          <div className="mt-6 p-3 border rounded-md bg-green-50 text-green-800 text-center text-sm">
            {t("workerIdInfo", "Your Worker ID is")}
            <strong>{workerId}</strong>. {t("keepSafe", "Keep this safe!")}
          </div>
        )}
      </form>
    </div>
  );
}
