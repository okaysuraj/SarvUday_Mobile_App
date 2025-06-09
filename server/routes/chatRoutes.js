const express = require("express");
const { requireSignIn } = require("../controllers/userController");
const { 
  sendMessageController, 
  getChatHistoryController,
  getChatSessions,
  createChatSession,
  getAssessmentResults,
  exportChatSessionController
} = require("../controllers/chatController");

const router = express.Router();

router.post("/send-message", requireSignIn, sendMessageController);
router.get("/chat-history", requireSignIn, getChatHistoryController);
router.get("/chat-sessions", requireSignIn, getChatSessions);
router.post("/chat-sessions", requireSignIn, createChatSession);
router.get("/assessment-results", requireSignIn, getAssessmentResults);
router.post("/export-session/:sessionId", requireSignIn, exportChatSessionController);

module.exports = router;
