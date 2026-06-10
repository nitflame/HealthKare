import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader";
import { Search, Sparkles, Plus, BarChart2, ClipboardList } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ total: 0, recent: [], riskBreakdown: [] });
  const [loadingStats, setLoadingStats] = useState(true);
  const [search, setSearch] = useState("");
  const [aiSearchMode, setAiSearchMode] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    API.get("/records/stats")
      .then((r) => setStats(r.data))
      .catch((err) => console.error("Stats error:", err.response?.data || err.message))
      .finally(() => setLoadingStats(false));
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    if (aiSearchMode) {
      nav(`/admin-records?aiSearch=${encodeURIComponent(search)}`);
    } else {
      nav(`/admin-records?search=${encodeURIComponent(search)}`);
    }
  };

  if (loadingStats) return <Loader text="Loading records stats..." />;

  const riskColors = { Low: "text-green-600 bg-green-50", High: "text-amber-600 bg-amber-50", "Highly Infectious": "text-red-600 bg-red-50" };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* Search bar with AI toggle */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          {aiSearchMode
            ? <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500" />
            : <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          }
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={aiSearchMode
              ? "Ask anything — e.g. workers with fever and travel history"
              : "Search by Worker ID, Phone, or Name"}
            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none focus:ring-2 transition ${
              aiSearchMode
                ? "border-purple-300 focus:ring-purple-400 bg-purple-50"
                : "border-gray-300 focus:ring-blue-400"
            }`}
          />
        </div>
        <button
          type="button"
          onClick={() => setAiSearchMode((v) => !v)}
          className={`px-3 py-2 rounded-lg text-sm border transition font-medium ${
            aiSearchMode
              ? "bg-purple-600 text-white border-purple-600"
              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
          }`}
          title="Toggle AI search"
        >
          <Sparkles className="w-4 h-4" />
        </button>
        <button
          type="submit"
          className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition"
        >
          Search
        </button>
      </form>

      {aiSearchMode && (
        <p className="text-xs text-purple-600 -mt-3">
          AI search is active — try natural language queries like "high risk workers in Kochi"
        </p>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white p-6 rounded-xl shadow">
          <div className="flex items-center gap-2 mb-1 opacity-80">
            <ClipboardList className="w-5 h-5" />
            <span className="text-sm uppercase tracking-wide">Total Records</span>
          </div>
          <p className="text-4xl font-bold">{stats.total}</p>
          <Link
            to="/admin-records"
            className="inline-block mt-4 px-4 py-2 bg-white text-purple-700 rounded-lg text-sm font-semibold hover:bg-gray-100 transition"
          >
            View All Records
          </Link>
        </div>

        <div className="bg-white border p-6 rounded-xl shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Plus className="w-5 h-5 text-blue-500" />
              <h2 className="text-base font-semibold">Add New Record</h2>
            </div>
            <p className="text-sm text-gray-500">Create a health record for any registered worker.</p>
          </div>
          <button
            onClick={() => nav("/admin-records?openForm=true")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition"
          >
            Add Record
          </button>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white p-6 rounded-xl shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1 opacity-80">
              <BarChart2 className="w-5 h-5" />
              <span className="text-sm uppercase tracking-wide">Analytics</span>
            </div>
            <p className="text-sm opacity-90">View AI-powered health insights and risk charts.</p>
          </div>
          <button
            onClick={() => nav("/reports")}
            className="mt-4 px-4 py-2 bg-white text-indigo-700 rounded-lg hover:bg-gray-100 text-sm font-semibold transition"
          >
            Go to Reports
          </button>
        </div>
      </div>

      {/* Risk breakdown */}
      {stats.riskBreakdown?.length > 0 && (
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-semibold mb-3">Risk Overview</h2>
          <div className="flex gap-3 flex-wrap">
            {stats.riskBreakdown.map((r) => (
              <div
                key={r._id}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${riskColors[r._id] || "text-gray-600 bg-gray-50"}`}
              >
                {r._id}: <span className="font-bold">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent records */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-semibold mb-3">Recent Records</h2>
        <div className="space-y-2">
          {stats.recent.map((r) => (
            <div key={r._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 text-sm">
              <span className="font-medium text-gray-800">
                {r.linkedUser?.name} ({r.linkedUser?.workerId || r.linkedUser?.phone})
              </span>
              <span className="text-gray-500 truncate max-w-[200px]">{r.diagnosis || "No diagnosis"}</span>
            </div>
          ))}
        </div>
        <Link to="/admin-records" className="inline-block mt-4 text-sm text-blue-600 hover:underline">
          View all records →
        </Link>
      </div>
    </div>
  );
}
