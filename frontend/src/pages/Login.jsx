// src/pages/Login.jsx
import { useTranslation } from "react-i18next";
import React, { useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const { setUser, setToken } = useContext(AuthContext);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { phone, password });
      //localStorage.setItem("token", res.data.token);
      sessionStorage.setItem("token", res.data.token);

      setToken(res.data.token);
      setUser(res.data.user);

      if (res.data.user.role === "admin") nav("/admin");
      else nav("/dashboard");
    } catch (err) {
      alert(err.response?.data?.msg || "Login error");
    }
  };

  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-white px-10 mt-[-60px]">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 border"
      >
        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          {t("loginTitle", "Login")}
        </h2>
        <p className="text-sm text-center text-gray-500 mb-6">
          {t("loginSubtitle", "Access your health records")}
        </p>

        {/* Phone field */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("phoneNumber", "Phone Number")}
        </label>
        <input
          type="text"
          className="w-full border rounded-md px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t("phoneNumberPlaceholder", "Enter your phone number")}
          required
        />

        {/* Password field */}
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

        {/* Login button */}
        <button
          type="submit"
          className="w-full py-2.5 rounded-md bg-gray-900 text-white font-medium hover:bg-gray-800 transition"
        >
          {t("loginButton", "Login")}
        </button>

        {/* Signup link */}
        <p className="text-center text-sm text-gray-600 mt-4">
          {t("dontHaveAccount", "Don’t have an account?")}{" "}
          <Link to="/signup" className="text-green-600 hover:underline">
            {t("signup", "Sign up")}
          </Link>
        </p>
      </form>
    </div>
  );
}
