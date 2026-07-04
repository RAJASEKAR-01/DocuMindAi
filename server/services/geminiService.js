const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI;
const getClient = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};


// Strips markdown code fences that Gemini sometimes wraps JSON in, then parses safely
const safeJsonParse = (rawText) => {
  const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error("AI returned an unexpected format. Please try analyzing the document again.");
  }
};

const ANALYSIS_PROMPT = (documentText) => `
You are a document intelligence assistant. Analyze the following document text and return ONLY a valid JSON object (no markdown, no preamble, no explanation outside the JSON) with this exact structure:

{
  "documentType": "string - e.g. Rental Agreement, Employment Offer, Loan Contract, NDA, Terms of Service, Other",
  "summary": "string - a clear 4-6 sentence plain-English summary of what this document is and what it commits the reader to",
  "simpleExplanation": "string - explain the document like the reader is 15 years old, using a simple everyday analogy, 3-5 sentences",
  "riskScore": "number between 0 and 100, where 0 is completely safe/standard and 100 is extremely risky/one-sided",
  "riskLevel": "one of: low, medium, high",
  "flaggedClauses": [
    {
      "clauseTitle": "short title of the clause",
      "explanation": "plain-English explanation of what this clause means and why it matters",
      "riskLevel": "one of: low, medium, high"
    }
  ],
  "suggestedQuestions": ["array of 4-6 specific questions the reader should ask before signing, based on THIS document"],
  "recommendations": ["array of 3-5 concrete, actionable recommendations for the reader"]
}

Identify 3-8 of the most important clauses (favor unusual, one-sided, or financially significant ones). Base every field strictly on the document content below - do not invent details that aren't present.

DOCUMENT TEXT:
"""
${documentText.slice(0, 15000)}
"""
`;

const analyzeDocument = async (documentText) => {
  const client = getClient();
  const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });

  const result = await model.generateContent(ANALYSIS_PROMPT(documentText));
  const rawText = result.response.text();
  const parsed = safeJsonParse(rawText);

  return {
    documentType: parsed.documentType || "General Document",
    summary: parsed.summary || "",
    simpleExplanation: parsed.simpleExplanation || "",
    riskScore: typeof parsed.riskScore === "number" ? Math.min(100, Math.max(0, parsed.riskScore)) : 0,
    riskLevel: ["low", "medium", "high"].includes(parsed.riskLevel) ? parsed.riskLevel : "low",
    flaggedClauses: Array.isArray(parsed.flaggedClauses) ? parsed.flaggedClauses : [],
    suggestedQuestions: Array.isArray(parsed.suggestedQuestions) ? parsed.suggestedQuestions : [],
    recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
  };
};

// Chat with a document - grounds every answer in the extracted document text + prior turns
const chatWithDocument = async (documentText, chatHistory, question) => {
  const client = getClient();
  const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });

  const historyText = chatHistory
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  const prompt = `
You are DocuMind AI, an assistant answering questions strictly about the document below.
Rules:
- Only answer using information found in the document text.
- If the answer isn't in the document, say so clearly instead of guessing.
- Keep answers concise and plain-English (max ~150 words) unless asked for more detail.

DOCUMENT TEXT:
"""
${documentText.slice(0, 15000)}
"""

CONVERSATION SO FAR:
${historyText || "(no prior messages)"}

New question from user: ${question}

Respond with plain text only (no JSON, no markdown headers).
`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};

module.exports = { analyzeDocument, chatWithDocument };
