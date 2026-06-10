import React, { useEffect, useState, useContext, useCallback } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Sparkles, RefreshCw, AlertTriangle, TrendingUp, ClipboardList } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const RISK_COLORS = { Low: "#22c55e", High: "#f59e0b", "Highly Infectious": "#ef4444" };

export default function Reports() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState(null);

  // Map state
  const [mapRecords, setMapRecords] = useState([]);
  const [loadingMap, setLoadingMap] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    
    // Fetch stats
    API.get("/records/stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Stats error:", err.response?.data || err.message))
      .finally(() => setLoading(false));

    // Fetch all records for the map
    API.get("/records")
      .then((res) => setMapRecords(res.data))
      .catch((err) => console.error("Map records fetch error:", err))
      .finally(() => setLoadingMap(false));
  }, [user]);

  // Leaflet map initialization
  useEffect(() => {
    if (loadingMap || mapRecords.length === 0) return;

    const container = L.DomUtil.get("hotspot-map");
    if (container != null) {
      container._leaflet_id = null; // Reset Leaflet container association
    }

    const map = L.map("hotspot-map", {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([10.2, 76.4], 7.5); // Center on Kerala

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Coordinate mapping for Kerala districts/towns
    const KERALA_COORDINATES = {
      "kochi": [9.9312, 76.2673],
      "ernakulam": [9.9816, 76.2998],
      "trivandrum": [8.5241, 76.9366],
      "thiruvananthapuram": [8.5241, 76.9366],
      "calicut": [11.2588, 75.7804],
      "kozhikode": [11.2588, 75.7804],
      "thrissur": [10.5276, 76.2144],
      "kollam": [8.8932, 76.6141],
      "alappuzha": [9.4981, 76.3388],
      "kottayam": [9.5916, 76.5222],
      "palakkad": [10.7867, 76.6548],
      "malappuram": [11.0510, 76.0711],
      "kannur": [11.8745, 75.3704],
      "kasaragod": [12.4996, 74.9869],
      "wayanad": [11.6854, 76.1320],
      "idukki": [9.9189, 77.1025],
      "pathanamthitta": [9.2648, 76.7870]
    };

    const renderedCoords = [];

    mapRecords.forEach((rec) => {
      const locStr = (rec.location || "").toLowerCase().trim();
      let coords = null;

      // Find district coordinate match
      for (const [city, latLng] of Object.entries(KERALA_COORDINATES)) {
        if (locStr.includes(city)) {
          coords = [...latLng];
          break;
        }
      }

      // Default: Kochi with small random jitter
      if (!coords) {
        coords = [9.9312 + (Math.random() - 0.5) * 0.4, 76.2673 + (Math.random() - 0.5) * 0.4];
      }

      // Avoid exact overlapping markers using small jitter
      while (renderedCoords.some(([lat, lng]) => Math.abs(lat - coords[0]) < 0.01 && Math.abs(lng - coords[1]) < 0.01)) {
        coords[0] += (Math.random() - 0.5) * 0.012;
        coords[1] += (Math.random() - 0.5) * 0.012;
      }
      renderedCoords.push(coords);

      // Styles based on risk level
      const dotColor = rec.riskLevel === "Highly Infectious" 
        ? "bg-red-600" 
        : (rec.riskLevel === "High" ? "bg-amber-500" : "bg-green-500");
        
      const pulseHtml = rec.riskLevel === "Highly Infectious" 
        ? `<div class="absolute w-4.5 h-4.5 rounded-full bg-red-500 opacity-60 animate-ping"></div>`
        : "";

      const customIcon = L.divIcon({
        className: "custom-map-marker",
        html: `
          <div class="relative flex items-center justify-center w-6 h-6">
            ${pulseHtml}
            <div class="relative w-3.5 h-3.5 rounded-full ${dotColor} border-2 border-white shadow-md"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 150px; padding: 2px;">
          <h4 style="margin: 0 0 4px; font-weight: 700; font-size: 13px; color: #1f2937;">${rec.patientName}</h4>
          <p style="margin: 0 0 2px; font-size: 11px; color: #4b5563;">ID: ${rec.linkedUser?.workerId || rec.workerId || "—"}</p>
          <p style="margin: 0 0 2px; font-size: 11px; color: #4b5563;"><strong>Diagnosis:</strong> ${rec.diagnosis || "None"}</p>
          <p style="margin: 0 0 2px; font-size: 11px; color: #4b5563;"><strong>Location:</strong> ${rec.location || "—"}</p>
          <div style="margin-top: 6px; display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; 
            background-color: ${rec.riskLevel === "Highly Infectious" ? "#fee2e2" : (rec.riskLevel === "High" ? "#fef3c7" : "#d1fae5")};
            color: ${rec.riskLevel === "Highly Infectious" ? "#991b1b" : (rec.riskLevel === "High" ? "#92400e" : "#065f46")};">
            ${rec.riskLevel} Risk
          </div>
        </div>
      `;

      L.marker(coords, { icon: customIcon })
        .bindPopup(popupContent)
        .addTo(map);
    });

    return () => {
      map.remove();
    };
  }, [loadingMap, mapRecords]);

  const loadInsights = useCallback(async () => {
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const res = await API.post("/ai/insights");
      setInsights(res.data);
    } catch (err) {
      setInsightsError(err.response?.data?.msg || "Failed to generate insights");
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  if (!user || user.role !== "admin")
    return <div className="p-6 text-red-600 font-medium">Access denied. Admins only.</div>;
  if (loading) return <Loader text="Loading Reports..." />;
  if (!stats) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center font-medium">
          Failed to load reports and statistics. Please check your network connection and try again.
        </div>
      </div>
    );
  }

  const riskPieData = (stats?.riskBreakdown || []).map((r) => ({
    name: r._id || "Unknown",
    value: r.count,
  }));

  const monthlyData = (stats?.recentByMonth || []).map((m) => ({
    name: m._id ? `${m._id.year}-${String(m._id.month).padStart(2, "0")}` : "Unknown",
    records: m.count,
  }));

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-xl shadow">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="w-5 h-5" />
            <h2 className="text-sm font-medium uppercase tracking-wide opacity-80">Total Records</h2>
          </div>
          <p className="text-4xl font-bold">{stats.total}</p>
        </div>
        {(stats.riskBreakdown || []).map((r) => (
          <div
            key={r._id}
            className="p-6 rounded-xl shadow border-l-4"
            style={{ borderColor: RISK_COLORS[r._id] || "#6b7280" }}
          >
            <h2 className="text-sm text-gray-500 font-medium mb-1">{r._id || "Unknown"} Risk</h2>
            <p className="text-3xl font-bold" style={{ color: RISK_COLORS[r._id] || "#6b7280" }}>
              {r.count}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly trend */}
        {monthlyData.length > 0 && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Records Over Time
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="records" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Risk distribution */}
        {riskPieData.length > 0 && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Risk Distribution
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={riskPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                  {riskPieData.map((entry, idx) => (
                    <Cell key={idx} fill={RISK_COLORS[entry.name] || "#6b7280"} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Disease Hotspot Map */}
      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            Kerala Disease Hotspot Map
          </h2>
          <p className="text-xs text-gray-500">Real-time geo-spatial analysis of patient locations and infectious risk distributions</p>
        </div>

        <div className="relative overflow-hidden rounded-xl border bg-gray-50">
          <div id="hotspot-map" className="h-96 w-full z-0"></div>
          
          {/* Legend Overlay */}
          <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm border p-3 rounded-lg shadow-md z-[1000] text-xs space-y-1.5 font-medium">
            <p className="font-bold border-b pb-1 mb-1 text-[10px] uppercase tracking-wider text-gray-500">Risk Level Legend</p>
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center w-4 h-4">
                <span className="w-3.5 h-3.5 rounded-full bg-red-500 opacity-60 animate-ping absolute"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-white"></span>
              </div>
              <span>Highly Infectious (Pulsing)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 border border-white"></span>
              <span>High Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 border border-white"></span>
              <span>Low Risk</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Health Insights */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Health Insights
          </h2>
          <button
            onClick={loadInsights}
            disabled={insightsLoading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${insightsLoading ? "animate-spin" : ""}`} />
            {insightsLoading ? "Analyzing..." : insights ? "Refresh" : "Generate Insights"}
          </button>
        </div>

        {insightsError && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{insightsError}</div>
        )}

        {!insights && !insightsLoading && !insightsError && (
          <p className="text-gray-500 text-sm">
            Click "Generate Insights" to get an AI-powered analysis of your population health data.
          </p>
        )}

        {insights && (
          <div className="space-y-4">
            <p className="text-gray-700">{insights.insights.overview}</p>

            {insights.insights.riskAlert && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700 font-medium">{insights.insights.riskAlert}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Top Health Concerns</h3>
                <ul className="space-y-1">
                  {insights.insights.topConcerns?.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-amber-500 font-bold mt-0.5">•</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Recommendations</h3>
                <ul className="space-y-1">
                  {insights.insights.recommendations?.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-500 font-bold mt-0.5">✓</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              Generated at {new Date(insights.generatedAt).toLocaleString()} · AI-assisted analysis, not a substitute for medical judgment.
            </p>
          </div>
        )}
      </div>

      {/* Recent records */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Recent Records</h2>
        <div className="space-y-2">
          {(stats?.recent || []).map((r) => (
            <div key={r._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 text-sm">
              <span className="font-medium text-gray-800">{r.linkedUser?.name || r.patientName}</span>
              <span className="text-gray-500">{r.diagnosis || "No diagnosis"}</span>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${RISK_COLORS[r.riskLevel]}20`,
                  color: RISK_COLORS[r.riskLevel],
                }}
              >
                {r.riskLevel}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
