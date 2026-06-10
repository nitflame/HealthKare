// src/pages/AdminRecords.jsx
import { useTranslation } from "react-i18next";
import React, { useEffect, useState, useContext, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import { Listbox } from "@headlessui/react";
import {
  User,
  Phone,
  Briefcase,
  HeartPulse,
  AlertTriangle,
  FileText,
  Trash2,
  Search,
  Filter,
  Plus,
  Check,
  ChevronDown,
  Sparkles,
  RefreshCw,
} from "lucide-react";


export default function AdminRecords() {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);
  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];


  // Search + Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("");

  // Form state aligned with schema
  const [form, setForm] = useState({
    _id: "",
    workerId: "",
    workerPhone: "",
    patientName: "",
    age: "",
    gender: "",
    bloodGroup: "",
    occupation: "",
    location: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyRelation: "",
    symptoms: "",
    diagnosis: "",
    allergies: "",
    history: "",
    travelHistory: "",
    riskLevel: "Low",
    infectiousDiseases: "",
    notes: "",
  });

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    fetchRecords();
  }, [user]);

  const fetchRecords = async () => {
    try {
      const res = await API.get("/records");
      setRecords(res.data);
    } catch (err) {
      console.error("Admin fetch error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Save (Add / Edit)
  const saveRecord = async (e) => {
    e.preventDefault();
    if (!form.workerId && !form.workerPhone) {
      return alert("Please provide either Worker ID or Worker Phone");
    }
    try {
      if (form._id) {
        await API.put(`/records/${form._id}`, form);
        alert("Record updated successfully");
      } else {
        await API.post("/records", form);
        alert("Record added successfully");
      }
      fetchRecords();
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error("Save record error:", err.response?.data || err.message);
      alert(err.response?.data?.msg || "Error saving record");
    }
  };

  // Delete
  const deleteRecord = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await API.delete(`/records/${id}`);
      alert("Record deleted");
      fetchRecords();
      setViewRecord(null);
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      alert("Error deleting record");
    }
  };

  // AI analyze record
  const analyzeRecord = async (recordId) => {
    setAnalyzingId(recordId);
    setAnalyzeError(null);
    try {
      const res = await API.post("/ai/analyze-record", { recordId });
      // Update record in local state with AI result
      setRecords((prev) =>
        prev.map((r) =>
          r._id === recordId
            ? {
                ...r,
                aiRiskLevel: res.data.riskLevel,
                aiRiskReason: res.data.riskReason,
                aiSymptomSummary: res.data.symptomSummary,
                aiLastAnalyzed: new Date(),
              }
            : r
        )
      );
      if (viewRecord?._id === recordId) {
        setViewRecord((prev) => ({
          ...prev,
          aiRiskLevel: res.data.riskLevel,
          aiRiskReason: res.data.riskReason,
          aiSymptomSummary: res.data.symptomSummary,
        }));
      }
    } catch (err) {
      setAnalyzeError(err.response?.data?.msg || "AI analysis failed");
    } finally {
      setAnalyzingId(null);
    }
  };

  // AI natural language search
  const handleAiSearch = async (query) => {
    setLoading(true);
    try {
      const res = await API.post("/ai/search", { query });
      setRecords(res.data.records);
      setSearchTerm(query);
    } catch (err) {
      console.error("AI search error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      _id: "",
      workerId: "",
      workerPhone: "",
      patientName: "",
      age: "",
      gender: "",
      bloodGroup: "",
      occupation: "",
      location: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyRelation: "",
      symptoms: "",
      diagnosis: "",
      allergies: "",
      history: "",
      travelHistory: "",
      riskLevel: "Low",
      infectiousDiseases: "",
      notes: "",
    });
  };

  const editRecord = (record) => {
    setForm(record);
    setShowForm(true);
  };

  // Filtering Logic
  const filteredRecords = records.filter((r) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      r.patientName?.toLowerCase().includes(term) ||
      r.diagnosis?.toLowerCase().includes(term) ||
      r.workerId?.toLowerCase().includes(term) ||
      r.workerPhone?.toLowerCase().includes(term);

    const matchesRisk = riskFilter ? r.riskLevel === riskFilter : true;

    return matchesSearch && matchesRisk;
  });

  if (!user || user.role !== "admin") {
    return <div className="p-6 text-red-600">❌ Access denied. Admins only.</div>;
  }
  if (loading) return <div className="p-6">Loading all records...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">All Worker Records</h1>
<button
  onClick={() => {
    resetForm();
    setShowForm((s) => !s);
  }}
  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
>
  {showForm ? (
    "Close Form"
  ) : (
    <>
      <Plus className="w-5 h-5" /> Add Record
    </>
  )}
</button>

      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-gray-50 p-4 rounded-lg shadow">
        <div className="flex items-center gap-2 w-full md:w-1/2">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, diagnosis, Worker ID, or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded-lg w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="border p-2 rounded-lg"
          >
            <option value="">All Risk Levels</option>
            <option value="Low">Low</option>
            <option value="High">High</option>
            <option value="Highly Infectious">Highly Infectious</option>
          </select>
        </div>
      </div>

      {/* Add / Edit Record Form */}
      {showForm && (
        <form
          onSubmit={saveRecord}
          className="bg-gradient-to-br from-gray-700 to-white 
             p-10 border rounded-2xl shadow-lg 
             ml-20 mr-20 space-y-10"
        >

          {/* Worker Identification */}
          <div className="bg-white rounded-3xl p-6 pb-9">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-black mb-3">
              <Phone className="w-5 h-5" /> Worker Identification
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Worker ID"
                value={form.workerId}
                onChange={(e) => setForm({ ...form, workerId: e.target.value })}
                className="border p-3 text-black rounded-lg focus:ring-2 focus:ring-green-900 w-full"
              />
              <input
                placeholder="Worker Phone"
                value={form.workerPhone}
                onChange={(e) => setForm({ ...form, workerPhone: e.target.value })}
                className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>
          </div>

          {/* Personal Info */}
          <div className="pb-4 bg-white rounded-3xl p-6 pb-9">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-blue-700 mb-3">
              <User className="w-5 h-5" /> Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Full Name"
                value={form.patientName}
                onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
                required
              />
              <input
                placeholder="Age in years"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
              />
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Blood Group
  </label>
  <Listbox
    value={form.bloodGroup}
    onChange={(value) => setForm({ ...form, bloodGroup: value })}
  >
    <div className="relative">
      <Listbox.Button className="w-full border p-3 rounded-lg text-left flex justify-between items-center focus:ring-2 focus:ring-blue-500">
        {form.bloodGroup || "Select Blood Group"}
        <ChevronDown className="w-5 h-5 text-gray-500" />
      </Listbox.Button>
      <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
        {bloodGroups.map((group) => (
          <Listbox.Option
            key={group}
            value={group}
            className={({ active }) =>
              `cursor-pointer p-2 ${
                active ? "bg-blue-100 text-blue-900" : "text-gray-900"
              }`
            }
          >
            {({ selected }) => (
              <span className="flex items-center justify-between">
                {group}
                {selected && <Check className="w-4 h-4 text-blue-600" />}
              </span>
            )}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </div>
  </Listbox>
</div>



            </div>
          </div>

          {/* Work Info */}
          <div className=" pb-4 bg-white rounded-3xl p-6 pb-9">
            <h2 className="flex items-center gap-2 text-lg font-semibold bg-white text-green-700 mb-3">
              <Briefcase className="w-5 h-5" /> Work-related Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Occupation"
                value={form.occupation}
                onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                className="border p-3 rounded-lg focus:ring-2 focus:ring-green-500 w-full"
              />
              <input
                placeholder="Location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="border p-3 rounded-lg focus:ring-2 focus:ring-green-500 w-full"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className=" pb-4 bg-white rounded-3xl p-6 pb-9">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-pink-700 mb-3">
              <Phone className="w-5 h-5" /> Emergency Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                placeholder="Contact Name"
                value={form.emergencyContactName}
                onChange={(e) =>
                  setForm({ ...form, emergencyContactName: e.target.value })
                }
                className="border p-3 rounded-lg focus:ring-2 focus:ring-pink-500 w-full"
              />
              <input
                placeholder="Contact Phone"
                value={form.emergencyContactPhone}
                onChange={(e) =>
                  setForm({ ...form, emergencyContactPhone: e.target.value })
                }
                className="border p-3 rounded-lg focus:ring-2 focus:ring-pink-500 w-full"
              />
              <input
                placeholder="Relation"
                value={form.emergencyRelation}
                onChange={(e) =>
                  setForm({ ...form, emergencyRelation: e.target.value })
                }
                className="border p-3 rounded-lg focus:ring-2 focus:ring-pink-500 w-full"
              />
            </div>
          </div>

          {/* Health Assessment */}
          <div className=" pb-6 bg-white rounded-3xl p-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-red-600 mb-3">
              <HeartPulse className="w-5 h-5" /> Health Assessment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <textarea
                placeholder="Symptoms"
                value={form.symptoms}
                onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
                className="border p-3 rounded-lg focus:ring-2 focus:ring-red-500 w-full"
              />
              <textarea
                placeholder="Diagnosis"
                value={form.diagnosis}
                onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                className="border p-3 rounded-lg focus:ring-2 focus:ring-red-500 w-full"
              />
            </div>
          </div>

          {/* Medical History */}
          <div className=" bg-white p-4 pb-6 rounded-3xl">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-purple-700 mb-3">
              <FileText className="w-5 h-5" /> Medical History
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <textarea
                placeholder="Allergies"
                value={form.allergies}
                onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                className="border p-3 rounded-lg focus:ring-2 focus:ring-purple-500 w-full"
              />
              <textarea
                placeholder="Past History"
                value={form.history}
                onChange={(e) => setForm({ ...form, history: e.target.value })}
                className="border p-3 rounded-lg focus:ring-2 focus:ring-purple-500 w-full"
              />
              <textarea
                placeholder="Travel History"
                value={form.travelHistory}
                onChange={(e) =>
                  setForm({ ...form, travelHistory: e.target.value })
                }
                className="border p-3 rounded-lg focus:ring-2 focus:ring-purple-500 w-full"
              />
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-white p-4 pb-6 rounded-3xl">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-orange-700 mb-3">
              <AlertTriangle className="w-5 h-5" /> Risk Assessment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={form.riskLevel}
                onChange={(e) =>
                  setForm({ ...form, riskLevel: e.target.value })
                }
                className="border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 w-full"
              >
                <option>Low</option>
                <option>High</option>
                <option>Highly Infectious</option>
              </select>
              <input
                placeholder="Infectious Diseases"
                value={form.infectiousDiseases}
                onChange={(e) =>
                  setForm({ ...form, infectiousDiseases: e.target.value })
                }
                className="border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 w-full"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white p-4 pb-6 rounded-3xl">
            <h2 className="text-lg  font-semibold text-gray-700 mb-2">
              Additional Notes
            </h2>
            <textarea
              placeholder="Additional observations..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="border p-3 rounded-lg focus:ring-2 focus:ring-gray-400 w-full"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
            >
              {form._id ? "Update Record" : "Save Record"}
            </button>
          </div>
        </form>
      )}

      {/* Records List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((r) => (
            <div
              key={r._id}
              className="p-4 border rounded-lg shadow bg-white hover:shadow-lg transition cursor-pointer"
              onClick={() => setViewRecord(r)}
            >
              <h3 className="font-semibold text-lg">{r.patientName}</h3>
              <p className="text-sm text-gray-600">
                WorkerID: {r.workerId || "-"} | Phone: {r.workerPhone || "-"}
              </p>
              <p className="text-sm text-gray-600">
                Age: {r.age} | Gender: {r.gender}
              </p>
              <p className="text-sm text-gray-600">Diagnosis: {r.diagnosis}</p>
              <p className="text-sm text-gray-600">Risk: {r.riskLevel}</p>
              <p className="text-xs text-gray-400 mt-2">
                Added by {r.addedBy?.name} on{" "}
                {new Date(r.createdAt).toLocaleDateString()}
              </p>
              {r.aiSymptomSummary && (
                <p className="text-xs text-purple-600 mt-2 italic line-clamp-2">
                  ✦ {r.aiSymptomSummary}
                </p>
              )}
              <div className="flex gap-2 mt-3 flex-wrap">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    editRecord(r);
                  }}
                  className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteRecord(r._id);
                  }}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    analyzeRecord(r._id);
                  }}
                  disabled={analyzingId === r._id}
                  className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {analyzingId === r._id ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  {analyzingId === r._id ? "Analyzing..." : "AI Analyze"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No records found.
          </p>
        )}
      </div>

      {/* View Modal */}
      {viewRecord && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-3xl w-full overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-4">{viewRecord.patientName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <p>
                <b>WorkerID:</b> {viewRecord.workerId}
              </p>
              <p>
                <b>Phone:</b> {viewRecord.workerPhone}
              </p>
              <p>
                <b>Age:</b> {viewRecord.age}
              </p>
              <p>
                <b>Gender:</b> {viewRecord.gender}
              </p>
              <p>
                <b>Blood Group:</b> {viewRecord.bloodGroup}
              </p>
              <p>
                <b>Occupation:</b> {viewRecord.occupation}
              </p>
              <p>
                <b>Location:</b> {viewRecord.location}
              </p>
              <p>
                <b>Emergency:</b> {viewRecord.emergencyContactName} (
                {viewRecord.emergencyRelation}) —{" "}
                {viewRecord.emergencyContactPhone}
              </p>
              <p>
                <b>Symptoms:</b> {viewRecord.symptoms}
              </p>
              <p>
                <b>Diagnosis:</b> {viewRecord.diagnosis}
              </p>
              <p>
                <b>Allergies:</b> {viewRecord.allergies}
              </p>
              <p>
                <b>Past History:</b> {viewRecord.history}
              </p>
              <p>
                <b>Travel History:</b> {viewRecord.travelHistory}
              </p>
              <p>
                <b>Risk:</b> {viewRecord.riskLevel}
              </p>
              <p>
                <b>Infectious Diseases:</b> {viewRecord.infectiousDiseases}
              </p>
              <p>
                <b>Notes:</b> {viewRecord.notes}
              </p>
              <p>
                <b>Added By:</b> {viewRecord.addedBy?.name}
              </p>
              <p>
                <b>Date:</b> {new Date(viewRecord.createdAt).toLocaleString()}
              </p>
            </div>

            {/* AI Analysis section */}
            {viewRecord.aiSymptomSummary && (
              <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-800">AI Analysis</span>
                  {viewRecord.aiRiskLevel && (
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      AI Risk: {viewRecord.aiRiskLevel}
                    </span>
                  )}
                </div>
                <p className="text-sm text-purple-900">{viewRecord.aiSymptomSummary}</p>
                {viewRecord.aiRiskReason && (
                  <p className="text-xs text-purple-600 mt-1 italic">{viewRecord.aiRiskReason}</p>
                )}
              </div>
            )}

            <div className="flex justify-between mt-6">
              <div className="flex gap-2">
                <button
                  onClick={() => deleteRecord(viewRecord._id)}
                  className="px-4 py-2 flex items-center gap-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
                <button
                  onClick={() => analyzeRecord(viewRecord._id)}
                  disabled={analyzingId === viewRecord._id}
                  className="px-4 py-2 flex items-center gap-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {analyzingId === viewRecord._id ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {analyzingId === viewRecord._id ? "Analyzing..." : "AI Analyze"}
                </button>
              </div>
              <button
                onClick={() => setViewRecord(null)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
