import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    workerId: { type: String, unique: true, sparse: true },
    avatar: {
      letter: { type: String, default: "" },
      bg: { type: String, default: "#6b7280" },
    },
  },
  { timestamps: true }
);

// Auto-generate Worker ID on first save
userSchema.pre("save", function (next) {
  if (!this.workerId && this._id) {
    this.workerId = "MW-" + this._id.toString().slice(-6).toUpperCase();
  }
  next();
});

export default mongoose.model("User", userSchema);
