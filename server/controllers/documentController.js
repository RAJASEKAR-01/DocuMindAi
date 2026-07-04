const asyncHandler = require("../utils/asyncHandler");
const { Readable } = require("stream");
const Document = require("../models/Document");
const cloudinary = require("../config/cloudinary");
const { extractTextFromPdf } = require("../services/pdfService");
const { analyzeDocument } = require("../services/geminiService");
const { sendAnalysisReadyEmail } = require("../services/emailService");

// Uploads a buffer to Cloudinary using an upload_stream (no temp files on disk)
const uploadBufferToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "raw", folder: "documind-ai", public_id: `${Date.now()}-${filename}` },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
};

// @route POST /api/documents/upload
const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded. Please attach a PDF." });
  }

  let extractedText;
  try {
    extractedText = await extractTextFromPdf(req.file.buffer);
  } catch (error) {
    return res.status(422).json({ message: error.message });
  }

  let cloudinaryResult = { secure_url: "", public_id: "" };
  try {
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      cloudinaryResult = await uploadBufferToCloudinary(req.file.buffer, req.file.originalname);
    }
  } catch (error) {
    console.error("Cloudinary upload failed (continuing without stored file):", error.message);
  }

  const document = await Document.create({
    user: req.user._id,
    originalFileName: req.file.originalname,
    fileUrl: cloudinaryResult.secure_url || "",
    cloudinaryPublicId: cloudinaryResult.public_id || "",
    rawTextExcerpt: extractedText.slice(0, 15000),
    status: "processing",
  });

  // Run AI analysis synchronously so the client gets a final result in one round trip.
  // (For a heavier production system this would move to a queue/worker.)
  try {
    const analysis = await analyzeDocument(extractedText);

    document.documentType = analysis.documentType;
    document.summary = analysis.summary;
    document.simpleExplanation = analysis.simpleExplanation;
    document.riskScore = analysis.riskScore;
    document.riskLevel = analysis.riskLevel;
    document.flaggedClauses = analysis.flaggedClauses;
    document.suggestedQuestions = analysis.suggestedQuestions;
    document.recommendations = analysis.recommendations;
    document.status = "completed";
    await document.save();

    sendAnalysisReadyEmail(req.user.email, req.user.name, document.originalFileName);
  } catch (error) {
    document.status = "failed";
    document.failureReason = error.message;
    await document.save();
    return res.status(502).json({
      message: "Document uploaded, but AI analysis failed. You can retry analysis from the document page.",
      document,
    });
  }

  res.status(201).json({ document });
});

// @route GET /api/documents
const getDocuments = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const skip = (page - 1) * limit;

  const [documents, total] = await Promise.all([
    Document.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-rawTextExcerpt"),
    Document.countDocuments({ user: req.user._id }),
  ]);

  res.status(200).json({
    documents,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @route GET /api/documents/:id
const getDocumentById = asyncHandler(async (req, res) => {
  const document = await Document.findOne({ _id: req.params.id, user: req.user._id });

  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  res.status(200).json({ document });
});

// @route DELETE /api/documents/:id
const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findOne({ _id: req.params.id, user: req.user._id });

  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  if (document.cloudinaryPublicId) {
    try {
      await cloudinary.uploader.destroy(document.cloudinaryPublicId, { resource_type: "raw" });
    } catch (error) {
      console.error("Cloudinary delete failed (continuing):", error.message);
    }
  }

  await document.deleteOne();
  res.status(200).json({ message: "Document deleted successfully" });
});

// @route GET /api/documents/:id/report
const downloadReport = asyncHandler(async (req, res) => {
  const document = await Document.findOne({ _id: req.params.id, user: req.user._id });

  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  const reportText = `
DOCUMIND AI - ANALYSIS REPORT
==============================
Document: ${document.originalFileName}
Type: ${document.documentType}
Analyzed: ${document.createdAt.toISOString()}

SUMMARY
-------
${document.summary}

EXPLAIN LIKE I'M 15
--------------------
${document.simpleExplanation}

RISK SCORE: ${document.riskScore}/100 (${document.riskLevel.toUpperCase()})

FLAGGED CLAUSES
----------------
${document.flaggedClauses
  .map((c, i) => `${i + 1}. [${c.riskLevel.toUpperCase()}] ${c.clauseTitle}\n   ${c.explanation}`)
  .join("\n\n")}

QUESTIONS TO ASK
-----------------
${document.suggestedQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

RECOMMENDATIONS
----------------
${document.recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}
`.trim();

  res.setHeader("Content-Type", "text/plain");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${document.originalFileName.replace(/\.pdf$/i, "")}-report.txt"`
  );
  res.status(200).send(reportText);
});

module.exports = { uploadDocument, getDocuments, getDocumentById, deleteDocument, downloadReport };
