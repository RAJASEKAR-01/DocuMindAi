const express = require("express");
const router = express.Router();
const { getChatHistory, sendChatMessage } = require("../controllers/chatController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { chatMessageSchema } = require("../validators/chatValidators");

router.use(protect);

router.get("/:documentId", getChatHistory);
router.post("/:documentId", validate(chatMessageSchema), sendChatMessage);

module.exports = router;
