import express from "express";
import Record from "../models/Record.js";
import User from "../models/User.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── GET /api/records ───────────────────────────────────────────────────────────
// Workers see their own; admins see all (with optional search)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (req.user.role === "user") {
      query.linkedUser = req.user._id;
    }

    let records = await Record.find(query)
      .populate("linkedUser", "name phone workerId")
      .populate("addedBy", "name email role")
      .sort({ createdAt: -1 });

    // Apply search for admins
    if (search && req.user.role === "admin") {
      const term = search.toLowerCase();
      records = records.filter(
        (r) =>
          r.patientName?.toLowerCase().includes(term) ||
          r.linkedUser?.name?.toLowerCase().includes(term) ||
          r.linkedUser?.workerId?.toLowerCase().includes(term) ||
          r.linkedUser?.phone?.includes(term) ||
          r.diagnosis?.toLowerCase().includes(term) ||
          r.symptoms?.toLowerCase().includes(term) ||
          r.location?.toLowerCase().includes(term)
      );
    }

    res.json(records);
  } catch (err) {
    console.error("Fetch records error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ── GET /api/records/stats ─────────────────────────────────────────────────────
// Admin only — enhanced for AI insights dashboard
router.get("/stats", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const total = await Record.countDocuments();

    const [riskBreakdown, recent, recentByMonth] = await Promise.all([
      Record.aggregate([
        { $group: { _id: "$riskLevel", count: { $sum: 1 } } },
      ]),
      Record.find()
        .populate("linkedUser", "name phone workerId")
        .populate("addedBy", "name email role")
        .sort({ createdAt: -1 })
        .limit(5),
      Record.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 6 },
      ]),
    ]);

    res.json({ total, recent, riskBreakdown, recentByMonth });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ── POST /api/records ──────────────────────────────────────────────────────────
// Admin only
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  const { workerId, workerPhone, patientName, ...rest } = req.body;

  if (!workerId && !workerPhone)
    return res.status(400).json({ msg: "Worker ID or Phone is required" });
  if (!patientName)
    return res.status(400).json({ msg: "Patient name is required" });

  try {
    const user = await User.findOne({
      $or: [
        workerId ? { workerId } : null,
        workerPhone ? { phone: workerPhone } : null,
      ].filter(Boolean),
    });

    if (!user) return res.status(404).json({ msg: "Worker not found" });

    const record = await Record.create({
      linkedUser: user._id,
      addedBy: req.user._id,
      patientName,
      workerId: user.workerId,
      workerPhone: user.phone,
      ...rest,
    });

    res.status(201).json(record);
  } catch (err) {
    console.error("Create record error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ── PUT /api/records/:id ───────────────────────────────────────────────────────
// Admin only
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updated = await Record.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ msg: "Record not found" });
    res.json(updated);
  } catch (err) {
    console.error("Update record error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ── DELETE /api/records/:id ────────────────────────────────────────────────────
// Admin only
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const deleted = await Record.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Record not found" });
    res.json({ msg: "Record deleted successfully" });
  } catch (err) {
    console.error("Delete record error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
