import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

export default function Settings() {
  const { user, setUser } = useContext(AuthContext);
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  if (!user) {
    return <div className="p-6 text-gray-600">Please log in to update your settings.</div>;
  }

  const updateProfile = async (e) => {
    e.preventDefault();
    if (!user._id) return setMessage({ type: "error", text: "User ID missing — please re-login." });

    setLoading(true);
    setMessage(null);
    try {
      const res = await API.put(`/auth/update/${user._id}`, { phone, email });
      setUser(res.data.user);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.msg || "Error updating profile" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-gray-900">Settings</h1>
      <p className="text-gray-500 text-sm mb-6">Worker ID: {user.workerId || "—"}</p>

      <form onSubmit={updateProfile} className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? "Updating..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
