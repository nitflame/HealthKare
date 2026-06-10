// src/pages/LandingPage.jsx
import { useTranslation } from "react-i18next";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Heart, Phone } from "lucide-react";

export default function LandingPage() {
  const { t } = useTranslation();
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-100 via-sky-50 to-white">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-grow text-center px-6 py-12">

        {/* Kerala Government Logo (new) */}
        <div className="flex flex-col items-center mb-4">
          <img
            src="/kerala.jpg"
            alt="Government of Kerala Logo"
            className="w-24 h-24 mb-2 drop-shadow-lg"
            style={{ objectFit: "contain" }}
          />
          {/* Logo icon */}
          <div className="rounded-full p-3 bg-red-50 shadow">
            <Heart className="w-10 h-10 text-red-600" />
          </div>
        </div>

        {/* Main headline */}
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">
          {t("mainHeadline", "Digital Health Record Management System")}
        </h1>

        {/* Buttons */}
        {!user ? (
          <div className="flex flex-wrap gap-4 justify-center mt-6 mb-4">
            <Link
              to="/signup"
              className="px-7 py-3 rounded-2xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition"
            >
              {t("getStarted", "Get Started")}
            </Link>
            <a
              href="tel:108"
              className="ml-8 flex items-center justify-center text-gray-600 text-sm hover:text-red-600 transition"
            >
              <Phone className="w-4 h-4 mr-2" />
              {t("emergency", "Emergency")}: 108
            </a>
          </div>
        ) : (
          <div className="flex gap-9 justify-center mt-6 mb-6">
            {user.role === "admin" ? (
              <Link
                to="/admin-records"
                className="px-6 py-3 rounded-2xl bg-black text-white font-medium hover:bg-green-700 transition"
              >
                {t("createRecords", "Create Records")}
              </Link>
            ) : (
              <Link
                to="/patient-records"
                className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
              >
                {t("accessRecords", "Access Records")}
              </Link>
            )}

            <a
              href="tel:108"
              className="flex items-center justify-center text-gray-700 text-sm hover:text-red-600 transition"
            >
              <Phone className="w-4 h-4 mr-2" />
              {t("emergency", "Emergency")}: 108
            </a>
          </div>
        )}

        {/* Tagline */}
        <p className="text-base md:text-md text-gray-700 max-w-2xl mb-8">
          {t("tagline", "A comprehensive health record management system aligned with UN Sustainable Development Goals, ensuring equal access to healthcare for all migrant workers.")}
        </p>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-green-900 mb-4 flex items-center justify-center gap-2">
          {t("subtitle", "for Migrant Workers in")}
          <img
            src="/kerala.png"
            alt="Kerala Icon"
            className="w-20 h-20 md:w-20 rounded-r-4xl md:h-7"
          />
        </p>
      </section>

      {/* Features Section */}
      {/* Features Section */}
      <section className="bg-white py-14 border-t">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-gray-800">
          {t("whyUsePlatform", "Why Use Our Platform?")}
        </h2>

        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 max-w-6xl mx-auto px-6 text-center">
          {/* Secure & Private */}
          <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
            <div className="flex justify-center mb-3">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 2l7 4v6c0 5-3.5 9.74-7 10-3.5-.26-7-5-7-10V6l7-4z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">{t("securePrivate", "Secure & Private")}</h3>
            <p className="text-sm text-gray-600">
              {t("securePrivateDesc", "Your health data is encrypted and protected with the highest security standards.")}
            </p>
          </div>

          {/* Multi-Language Support */}
          <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
            <div className="flex justify-center mb-3">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
                <path d="M2 12h20M12 2c3 4 3 16 0 20M12 2c-3 4-3 16 0 20" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">{t("multiLanguageSupport", "Multi-Language Support")}</h3>
            <p className="text-sm text-gray-600">
              {t("multiLanguageSupportDesc", "Available in English, Malayalam, Hindi, and Bengali for better accessibility.")}
            </p>
          </div>

          {/* For All Workers */}
          <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
            <div className="flex justify-center mb-3">
              <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M16 21v-2a4 4 0 00-8 0v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">{t("forAllWorkers", "For All Workers")}</h3>
            <p className="text-sm text-gray-600">
              {t("forAllWorkersDesc", "Designed specifically for migrant workers with an easy-to-use interface.")}
            </p>
          </div>

          {/* Digital Records */}
          <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
            <div className="flex justify-center mb-3">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M7 2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2z" />
                <path d="M9 8h6M9 12h6M9 16h6" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">{t("digitalRecords", "Digital Records")}</h3>
            <p className="text-sm text-gray-600">
              {t("digitalRecordsDesc", "Keep all your health records digital and accessible for easy management.")}
            </p>
          </div>

          {/* 24/7 Emergency */}
          <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
            <div className="flex justify-center mb-3">
              <Heart className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{t("emergency247", "24/7 Emergency")}</h3>
            <p className="text-sm text-gray-600">
              {t("emergency247Desc", "Round-the-clock emergency services and healthcare provider access.")}
            </p>
          </div>

          {/* SDG Aligned */}
          <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
            <div className="flex justify-center mb-3">
              <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 2l9.5 5v10L12 22 2.5 17V7L12 2z" />
                <path d="M12 22V12" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">{t("sdgAligned", "SDG Aligned")}</h3>
            <p className="text-sm text-gray-600">
              {t("sdgAlignedDesc", "Built to support UN Sustainable Development Goals for health equality.")}
            </p>
          </div>
        </div>
      </section>


      {/* SDG Section */}
      <section className="bg-gradient-to-r from-blue-500 to-green-500 rounded-3xl text-white py-15 mx-6 md:mx-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-17">
          {t("sdgSectionTitle", "Aligned with UN Sustainable Development Goals")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center max-w-6xl mx-auto">
          <div>
            <h3 className="text-xl font-bold">{t("sdg3", "SDG 3")}</h3>
            <p className="text-sm">{t("sdg3Desc", "Good Health and Well-being")}</p>
          </div>
          <div>
            <h3 className="text-xl font-bold">{t("sdg8", "SDG 8")}</h3>
            <p className="text-sm">{t("sdg8Desc", "Decent Work and Economic Growth")}</p>
          </div>
          <div>
            <h3 className="text-xl font-bold">{t("sdg10", "SDG 10")}</h3>
            <p className="text-sm">{t("sdg10Desc", "Reduced Inequalities")}</p>
          </div>
          <div>
            <h3 className="text-xl font-bold">{t("sdg16", "SDG 16")}</h3>
            <p className="text-sm">{t("sdg16Desc", "Peace, Justice and Strong Institutions")}</p>
          </div>
        </div>
      </section>


      {/* Stats Section */}
      <section className="py-12 bg-gray-50 ">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-gray-800">
          {t("makingHealthcareAccessible", "Making Healthcare Accessible")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center max-w-5xl mx-auto px-6">
          <div>
            <h3 className="text-3xl font-bold text-blue-600">1000+</h3>
            <p className="text-sm text-gray-600">{t("migrantWorkersRegistered", "Migrant Workers Registered")}</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-green-600">150+</h3>
            <p className="text-sm text-gray-600">{t("healthcareProviders", "Healthcare Providers")}</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-purple-600">24/7</h3>
            <p className="text-sm text-gray-600">{t("emergencySupport", "Emergency Support")}</p>
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-gray-100 text-center py-5 text-sm text-gray-600 border-t">
  © {new Date().getFullYear()} HealthCare Kerala. {t("footerRights", "All rights reserved Nitin.")}
      </footer>
    </div>
  );
}
