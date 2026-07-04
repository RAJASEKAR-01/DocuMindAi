const mongoose = require("mongoose");

const clauseSchema = new mongoose.Schema(
  {
    clauseTitle: String,
    explanation: String,
    riskLevel: { type: String, enum: ["low", "medium", "high"], default: "low" },
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    originalFileName: { type: String, required: true },
    fileUrl: { type: String, default: "" },
    cloudinaryPublicId: { type: String, default: "" },
    documentType: { type: String, default: "General Document" },

    summary: { type: String, default: "" },
    simpleExplanation: { type: String, default: "" }, // "Explain Like I'm 15"
    riskScore: { type: Number, min: 0, max: 100, default: 0 },
    riskLevel: { type: String, enum: ["low", "medium", "high"], default: "low" },
    flaggedClauses: [clauseSchema],
    suggestedQuestions: [String],
    recommendations: [String],

    rawTextExcerpt: { type: String, default: "" },
    status: { type: String, enum: ["processing", "completed", "failed"], default: "processing" },
    failureReason: { type: String, default: "" },
  },
  { timestamps: true }
);

documentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Document", documentSchema);
