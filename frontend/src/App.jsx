import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Settings from "./pages/Settings";
import PatientRecords from "./pages/PatientRecords";
import AdminRecords from "./pages/AdminRecords";
import Reports from "./pages/Reports";

export default function App() {
  return (
    <AuthProvider>
      <Header />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Worker routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patient-records" element={<PatientRecords />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Admin routes */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin-records" element={<AdminRecords />} />
          <Route path="/reports" element={<Reports />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
