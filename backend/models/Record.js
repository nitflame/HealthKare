import mongoose from "mongoose";

const recordSchema = new mongoose.Schema(
  {
    linkedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Personal Information
    patientName: { type: String, required: true, trim: true },
    age: Number,
    gender: String,
    phone: String,
    bloodGroup: String,

    // Work-related Information
    workerId: { type: String },
    workerPhone: { type: String },
    occupation: String,
    location: String,

    // Contact & Emergency Information
    emergencyContactName: String,
    emergencyContactPhone: String,
    emergencyRelation: String,

    // Health Assessment
    symptoms: String,
    diagnosis: String,

    // Medical / History
    allergies: String,
    history: String,
    travelHistory: String,

    // Risk Assessment
    riskLevel: {
      type: String,
      enum: ["Low", "High", "Highly Infectious"],
      default: "Low",
    },
    infectiousDiseases: String,

    // Additional Notes
    notes: String,

    // ── AI-generated fields ──────────────────────────────────────────────────
    aiRiskLevel: {
      type: String,
      enum: ["Low", "High", "Highly Infectious"],
    },
    aiRiskReason: String,
    aiSymptomSummary: String,
    aiLastAnalyzed: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Record", recordSchema);
