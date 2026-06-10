import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";
import Record from "../models/Record.js";

const router = express.Router();

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

// ── Helper: call Claude ────────────────────────────────────────────────────────
async function callClaude(prompt, maxTokens = 400) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "mock" || apiKey === "undefined") {
    console.log("Using Mock AI Response as ANTHROPIC_API_KEY is not configured.");
    
    if (prompt.includes("riskLevel")) {
      const isHighlyInfectious = prompt.toLowerCase().includes("malaria") || prompt.toLowerCase().includes("tb") || prompt.toLowerCase().includes("tuberculosis") || prompt.toLowerCase().includes("infectious");
      const isHigh = prompt.toLowerCase().includes("fever") || prompt.toLowerCase().includes("severe") || prompt.toLowerCase().includes("chest pain") || prompt.toLowerCase().includes("shortness of breath");
      const riskLevel = isHighlyInfectious ? "Highly Infectious" : (isHigh ? "High" : "Low");
      const riskReason = isHighlyInfectious 
        ? "Patient reports symptoms/history of a highly infectious disease, requiring immediate isolation." 
        : (isHigh ? "Patient has high-risk symptoms or critical vital signs requiring urgent consultation." : "Patient has minor or routine symptoms that can be managed standardly.");
      const symptomSummary = isHighlyInfectious
        ? "The patient shows signs of a contagious condition. Please refer them for immediate isolation and testing."
        : (isHigh ? "The patient's condition is serious and requires prompt medical attention. Avoid self-treatment." : "The patient has minor health issues. Resting and keeping hydrated is recommended.");
      return JSON.stringify({ riskLevel, riskReason, symptomSummary });
    }
    
    if (prompt.includes("insights")) {
      return JSON.stringify({
        overview: "The population health data shows mostly low-risk cases with a few isolated high-risk reports. Primary concerns are dust exposure and heat-related issues.",
        topConcerns: [
          "Occupational hazards related to construction work (dust, muscle strain)",
          "Occasional high-risk cases of infectious diseases like malaria or dengue",
          "Language barriers preventing effective healthcare access"
        ],
        recommendations: [
          "Provide personal protective equipment (masks, gloves) at work sites",
          "Establish translation services or multi-lingual health guides",
          "Organize regular mobile medical camps in migrant worker residential hubs"
        ],
        riskAlert: "Keep a watch on travel history records to preempt vector-borne disease imports."
      });
    }
    
    if (prompt.includes("Convert this natural language search query")) {
      // Very basic parser
      const match = prompt.match(/Query: "([^"]+)"/);
      const q = match ? match[1].toLowerCase() : "";
      let riskLevel = null;
      if (q.includes("low")) riskLevel = "Low";
      else if (q.includes("highly infectious") || q.includes("infectious")) riskLevel = "Highly Infectious";
      else if (q.includes("high")) riskLevel = "High";

      let hasSymptom = null;
      if (q.includes("fever")) hasSymptom = "fever";
      else if (q.includes("cough")) hasSymptom = "cough";

      let hasDiagnosis = null;
      if (q.includes("malaria")) hasDiagnosis = "malaria";
      else if (q.includes("covid")) hasDiagnosis = "covid";
      
      const keywords = q.split(/\s+/).filter(w => w.length > 3 && w !== "find" && w !== "show" && w !== "with" && w !== "risk");

      return JSON.stringify({
        keywords,
        riskLevel,
        hasSymptom,
        hasDiagnosis,
        location: null
      });
    }
    throw new Error("ANTHROPIC_API_KEY not configured and prompt type not recognized for mock");
  }

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Claude API error ${res.status}`);
  }

  const data = await res.json();
  return data.content[0]?.text || "";
}

// ── POST /api/ai/analyze-record ────────────────────────────────────────────────
// Admin only — predicts risk level + generates symptom summary for a record
router.post("/analyze-record", authMiddleware, adminMiddleware, async (req, res) => {
  const { recordId } = req.body;
  if (!recordId) return res.status(400).json({ msg: "recordId required" });

  try {
    const record = await Record.findById(recordId);
    if (!record) return res.status(404).json({ msg: "Record not found" });

    const prompt = `You are a medical assistant AI helping health workers assess migrant workers in Kerala, India.

Patient information:
- Name: ${record.patientName}
- Age: ${record.age || "Unknown"}
- Gender: ${record.gender || "Unknown"}
- Occupation: ${record.occupation || "Unknown"}
- Location: ${record.location || "Unknown"}
- Symptoms: ${record.symptoms || "None reported"}
- Diagnosis: ${record.diagnosis || "None"}
- Medical History: ${record.history || "None"}
- Allergies: ${record.allergies || "None"}
- Travel History: ${record.travelHistory || "None"}
- Infectious Diseases: ${record.infectiousDiseases || "None"}

Based ONLY on the above, respond in this exact JSON format (no extra text):
{
  "riskLevel": "Low" | "High" | "Highly Infectious",
  "riskReason": "One concise sentence explaining the risk assessment",
  "symptomSummary": "2-3 sentence plain-language health summary suitable for a non-medical reader"
}

Rules:
- "Highly Infectious" only if there are confirmed or strongly suspected infectious diseases
- "High" if symptoms are severe, history is complex, or multiple risk factors
- "Low" for routine or minor concerns
- Keep language clear and non-alarmist`;

    const raw = await callClaude(prompt, 500);

    // Parse JSON from response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse AI response");

    const aiResult = JSON.parse(jsonMatch[0]);

    // Persist AI fields back to the record
    record.aiRiskLevel = aiResult.riskLevel;
    record.aiRiskReason = aiResult.riskReason;
    record.aiSymptomSummary = aiResult.symptomSummary;
    record.aiLastAnalyzed = new Date();
    await record.save();

    res.json({
      recordId,
      riskLevel: aiResult.riskLevel,
      riskReason: aiResult.riskReason,
      symptomSummary: aiResult.symptomSummary,
    });
  } catch (err) {
    console.error("AI analyze error:", err.message);
    res.status(500).json({ msg: err.message || "AI analysis failed" });
  }
});

// ── POST /api/ai/insights ──────────────────────────────────────────────────────
// Admin only — generate health insights summary from all records
router.post("/insights", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const records = await Record.find().lean();
    if (records.length === 0) return res.json({ insights: "No records available yet." });

    // Build a statistical summary to send (don't send PII)
    const total = records.length;
    const riskCounts = { Low: 0, High: 0, "Highly Infectious": 0 };
    const diagnosisList = [];
    const symptomList = [];
    const locationSet = new Set();
    const occupationSet = new Set();

    for (const r of records) {
      if (r.riskLevel) riskCounts[r.riskLevel] = (riskCounts[r.riskLevel] || 0) + 1;
      if (r.diagnosis) diagnosisList.push(r.diagnosis);
      if (r.symptoms) symptomList.push(r.symptoms);
      if (r.location) locationSet.add(r.location);
      if (r.occupation) occupationSet.add(r.occupation);
    }

    const prompt = `You are a public health analyst. Analyze this anonymized health data for migrant workers in Kerala, India and provide actionable insights for health administrators.

Data summary:
- Total records: ${total}
- Risk distribution: Low=${riskCounts.Low}, High=${riskCounts.High}, Highly Infectious=${riskCounts["Highly Infectious"]}
- Common diagnoses (sample): ${diagnosisList.slice(0, 15).join("; ")}
- Common symptoms (sample): ${symptomList.slice(0, 15).join("; ")}
- Locations represented: ${[...locationSet].slice(0, 10).join(", ")}
- Occupations: ${[...occupationSet].slice(0, 10).join(", ")}

Provide a structured health insights report in this exact JSON format:
{
  "overview": "2-3 sentence overview of the population's health status",
  "topConcerns": ["concern 1", "concern 2", "concern 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "riskAlert": "One sentence highlighting the most urgent risk if any, or null if no urgent risk"
}`;

    const raw = await callClaude(prompt, 800);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse AI response");

    const insights = JSON.parse(jsonMatch[0]);
    res.json({ insights, generatedAt: new Date() });
  } catch (err) {
    console.error("AI insights error:", err.message);
    res.status(500).json({ msg: err.message || "AI insights failed" });
  }
});

// ── POST /api/ai/search ────────────────────────────────────────────────────────
// Admin only — natural language search across records
router.post("/search", authMiddleware, adminMiddleware, async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ msg: "query required" });

  try {
    // Use Claude to extract search intent
    const intentPrompt = `Convert this natural language search query into search parameters for a health records database.
Query: "${query}"

Respond ONLY with JSON (no extra text):
{
  "keywords": ["keyword1", "keyword2"],
  "riskLevel": "Low" | "High" | "Highly Infectious" | null,
  "hasSymptom": "symptom keyword or null",
  "hasDiagnosis": "diagnosis keyword or null",
  "location": "location or null"
}`;

    const raw = await callClaude(intentPrompt, 200);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse search intent");

    const intent = JSON.parse(jsonMatch[0]);

    // Build MongoDB query from intent
    const orClauses = [];
    if (intent.keywords?.length) {
      const kwRegexes = intent.keywords.map((k) => new RegExp(k, "i"));
      orClauses.push(
        ...kwRegexes.flatMap((r) => [
          { patientName: r },
          { symptoms: r },
          { diagnosis: r },
          { location: r },
          { occupation: r },
          { notes: r },
        ])
      );
    }
    if (intent.hasSymptom) orClauses.push({ symptoms: new RegExp(intent.hasSymptom, "i") });
    if (intent.hasDiagnosis) orClauses.push({ diagnosis: new RegExp(intent.hasDiagnosis, "i") });
    if (intent.location) orClauses.push({ location: new RegExp(intent.location, "i") });

    const mongoQuery = {};
    if (orClauses.length) mongoQuery.$or = orClauses;
    if (intent.riskLevel) mongoQuery.riskLevel = intent.riskLevel;

    const records = await Record.find(mongoQuery)
      .populate("linkedUser", "name phone workerId")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ records, intent, total: records.length });
  } catch (err) {
    console.error("AI search error:", err.message);
    res.status(500).json({ msg: err.message || "AI search failed" });
  }
});

export default router;
