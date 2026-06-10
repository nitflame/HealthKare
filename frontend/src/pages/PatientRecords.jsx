import { useTranslation } from "react-i18next";
import React, { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function PatientRecords() {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    API.get("/records")
      .then((res) => setRecords(res.data))
      .catch((err) => console.error("Fetch error:", err.response?.data || err))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <div className="p-6">Please log in to see your records.</div>;
  if (loading) return <div className="p-6">Loading records...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Health Records</h1>
      {records.length === 0 ? (
        <p className="text-gray-600">No records found.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {records.map((r) => (
            <li key={r._id} className="border p-4 rounded-lg shadow bg-white">
              <h2 className="font-semibold">{r.patientName}</h2>
              <p className="text-sm text-gray-600">
                Age: {r.age || "N/A"}, Gender: {r.gender || "N/A"}
              </p>
              <p className="mt-1">{r.diagnosis}</p>
              <p className="text-xs text-gray-500 mt-2">
                Added on {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
