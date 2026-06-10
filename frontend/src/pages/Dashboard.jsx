import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader";
import { Sparkles, FileText, Settings, AlertTriangle, Printer } from "lucide-react";

const RISK_COLORS = {
  Low: { dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50 border-green-200" },
  High: { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  "Highly Infectious": { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50 border-red-200" },
};

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/records")
      .then((res) => setRecords(res.data))
      .catch((err) => console.error("Error fetching records:", err))
      .finally(() => setLoading(false));
  }, []);

  const handlePrintCard = () => {
    const style = document.createElement("style");
    style.id = "print-card-style";
    style.innerHTML = `
      @media print {
        body {
          visibility: hidden !important;
          background: white !important;
        }
        #digital-health-card, #digital-health-card * {
          visibility: visible !important;
        }
        #digital-health-card {
          position: fixed !important;
          left: 50% !important;
          top: 50% !important;
          transform: translate(-50%, -50%) scale(1.3) !important;
          width: 85.6mm !important;
          height: 53.98mm !important;
          background: linear-gradient(135deg, #0f766e, #064e3b) !important;
          box-shadow: none !important;
          border: 1.5px solid #0f766e !important;
          border-radius: 12px !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color: white !important;
        }
      }
    `;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => {
      const el = document.getElementById("print-card-style");
      if (el) el.remove();
    }, 1000);
  };

  if (loading) return <Loader text="Loading your dashboard..." />;

  const latestRecord = records[0];
  const hasAiSummary = latestRecord?.aiSymptomSummary;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Worker ID: {user?.workerId || "—"}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Health summary */}
        <div className="bg-gradient-to-br from-green-600 to-green-800 text-white p-6 rounded-xl shadow relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <FileText className="w-5 h-5" />
            <span className="text-sm uppercase tracking-wide">Health Summary</span>
          </div>
          <p className="text-3xl font-bold">{records.length}</p>
          <p className="text-sm opacity-90 mt-1">health records on file</p>
          <Link
            to="/patient-records"
            className="inline-block mt-4 px-5 py-2 bg-yellow-400 text-black rounded-3xl text-sm font-semibold hover:bg-yellow-500 transition"
          >
            View Records
          </Link>
          <div className="absolute bottom-0 right-0 w-20 h-20 bg-yellow-500 rounded-full opacity-20" />
        </div>

        {/* Recent record */}
        <div className="bg-white border p-6 rounded-xl shadow hover:shadow-md transition">
          <h2 className="text-base font-semibold mb-3">Most Recent</h2>
          {latestRecord ? (
            <div className="space-y-1.5 text-sm">
              <p className="text-gray-700">
                <span className="text-gray-400">Diagnosis:</span>{" "}
                {latestRecord.diagnosis || "—"}
              </p>
              <p className="text-gray-700">
                <span className="text-gray-400">Date:</span>{" "}
                {new Date(latestRecord.createdAt).toLocaleDateString()}
              </p>
              {latestRecord.riskLevel && (
                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-medium mt-1 ${RISK_COLORS[latestRecord.riskLevel]?.bg}`}>
                  <span className={`w-2 h-2 rounded-full ${RISK_COLORS[latestRecord.riskLevel]?.dot}`} />
                  <span className={RISK_COLORS[latestRecord.riskLevel]?.text}>
                    {latestRecord.riskLevel} Risk
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No records yet.</p>
          )}
          <Link
            to="/patient-records"
            className="inline-block mt-4 px-5 py-2 bg-blue-600 text-white rounded-3xl text-sm hover:bg-blue-700 transition"
          >
            View All
          </Link>
        </div>

        {/* Settings shortcut */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white p-6 rounded-xl shadow">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <Settings className="w-5 h-5" />
            <span className="text-sm uppercase tracking-wide">Settings</span>
          </div>
          <p className="text-sm opacity-90">Manage your profile and preferences.</p>
          <Link
            to="/settings"
            className="inline-block mt-4 px-5 py-2 bg-white text-indigo-700 rounded-3xl text-sm font-semibold hover:bg-gray-100 transition"
          >
            Go to Settings
          </Link>
        </div>
      </div>

      {/* Digital Health Card Section */}
      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Digital Health Card</h2>
            <p className="text-xs text-gray-500">Official digital identity card for migrant workers in Kerala</p>
          </div>
          <button
            onClick={handlePrintCard}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Card
          </button>
        </div>

        {/* Card itself */}
        <div
          id="digital-health-card"
          className="max-w-md mx-auto bg-gradient-to-br from-teal-700 via-teal-800 to-emerald-900 text-white rounded-2xl p-6 shadow-xl border border-teal-600 relative overflow-hidden flex flex-col justify-between min-h-[220px]"
        >
          {/* Card background decals */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-500 rounded-full opacity-20 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500 rounded-full opacity-20 blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex justify-between items-start border-b border-teal-500/40 pb-3 mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-teal-200 font-bold">Government of Kerala</p>
              <h3 className="text-sm font-bold text-white tracking-wide">MIGRANT WORKER DIGITAL HEALTH CARD</h3>
            </div>
            <span className="text-[9px] bg-teal-600/60 border border-teal-400/30 px-2 py-0.5 rounded-full text-teal-100 font-semibold">SDG 3 Aligned</span>
          </div>

          {/* Body */}
          <div className="flex justify-between items-center gap-4">
            <div className="space-y-3 flex-1">
              <div>
                <p className="text-[9px] text-teal-200 uppercase tracking-wider">Full Name</p>
                <p className="text-sm font-bold text-white tracking-wide">{user?.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[9px] text-teal-200 uppercase tracking-wider">Worker ID</p>
                  <p className="text-xs font-mono font-bold text-white">{user?.workerId || "—"}</p>
                </div>
                <div>
                  <p className="text-[9px] text-teal-200 uppercase tracking-wider">Phone</p>
                  <p className="text-xs font-bold text-white">{user?.phone || "—"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[9px] text-teal-200 uppercase tracking-wider">Blood Group</p>
                  <p className="text-xs font-bold text-white">{latestRecord?.bloodGroup || "—"}</p>
                </div>
                <div>
                  <p className="text-[9px] text-teal-200 uppercase tracking-wider">Emergency Contact</p>
                  <p className="text-[10px] font-bold text-white">
                    {latestRecord?.emergencyContactPhone ? `${latestRecord.emergencyContactPhone} (${latestRecord.emergencyRelation || 'Contact'})` : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-2 rounded-xl flex items-center justify-center border border-teal-500/30 shadow-md flex-shrink-0">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(user?.workerId || user?.phone || '')}`}
                alt="Worker QR Code"
                className="w-16 h-16"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-2 border-t border-teal-500/30 flex justify-between items-center text-[8px] text-teal-300">
            <span>Powered by HealthKare Kerala Initiative</span>
            <span>Scan to view medical history</span>
          </div>
        </div>
      </div>

      {/* AI symptom summary (if available on latest record) */}
      {hasAiSummary && (
        <div className="bg-white border border-purple-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h2 className="text-base font-semibold">AI Health Summary</h2>
            <span className="text-xs text-gray-400 ml-auto">
              Last analyzed {new Date(latestRecord.aiLastAnalyzed).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{latestRecord.aiSymptomSummary}</p>
          {latestRecord.aiRiskLevel && latestRecord.aiRiskLevel !== latestRecord.riskLevel && (
            <div className="mt-3 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>AI suggests risk level: <strong>{latestRecord.aiRiskLevel}</strong> — {latestRecord.aiRiskReason}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
