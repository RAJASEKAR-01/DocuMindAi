const asyncHandler = require("../utils/asyncHandler");
const Document = require("../models/Document");
const ChatMessage = require("../models/ChatMessage");
const { chatWithDocument } = require("../services/geminiService");

// @route GET /api/chat/:documentId
const getChatHistory = asyncHandler(async (req, res) => {
  const document = await Document.findOne({ _id: req.params.documentId, user: req.user._id });
  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  const messages = await ChatMessage.find({ document: document._id }).sort({ createdAt: 1 });
  res.status(200).json({ messages });
});

// @route POST /api/chat/:documentId
const sendChatMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;

  const document = await Document.findOne({ _id: req.params.documentId, user: req.user._id });
  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  if (!document.rawTextExcerpt) {
    return res.status(400).json({ message: "This document has no extracted text to chat about" });
  }

  const priorMessages = await ChatMessage.find({ document: document._id }).sort({ createdAt: 1 }).limit(20);

  const userMessage = await ChatMessage.create({
    document: document._id,
    user: req.user._id,
    role: "user",
    content: message,
  });

  let aiReply;
  try {
    aiReply = await chatWithDocument(document.rawTextExcerpt, priorMessages, message);
  } catch (error) {
    return res.status(502).json({ message: "AI failed to respond. Please try again.", userMessage });
  }

  const assistantMessage = await ChatMessage.create({
    document: document._id,
    user: req.user._id,
    role: "assistant",
    content: aiReply,
  });

  res.status(201).json({ userMessage, assistantMessage });
});

module.exports = { getChatHistory, sendChatMessage };
