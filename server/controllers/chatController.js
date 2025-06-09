const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const Chat = require("../models/chatModel");
const AssessmentResult = require("../models/assessmentResultModel");

const AI_API_URL = "http://10.55.17.30:1234/v1/chat/completions";
const SEMANTIC_SERVICE_URL = "http://localhost:5000/map-response";

// Helper function for error handling
const handleError = (res, error, context) => {
  console.error(`Error in ${context}:`, error);
  res.status(500).json({ 
    success: false, 
    message: `Error ${context}`,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

// Helper function to save chat session to text file
const saveChatToTextFile = async (userId, conversationId) => {
  try {
    // Create chat_logs directory if it doesn't exist
    const chatLogsDir = path.join(__dirname, '..', 'chat_logs');
    if (!fs.existsSync(chatLogsDir)) {
      fs.mkdirSync(chatLogsDir, { recursive: true });
    }

    // Get all chats for this session
    const chats = await Chat.find({
      user: userId,
      conversationId: conversationId,
      message: { $exists: true, $ne: "" },
      response: { $exists: true, $ne: "" }
    }).sort({ createdAt: 1 });

    if (chats.length === 0) {
      return; // No chats to save
    }

    // Create filename with patient ID and session ID
    const filename = `patient_${userId}_session_${conversationId}.txt`;
    const filepath = path.join(chatLogsDir, filename);

    // Format chat content
    let chatContent = `Patient ID: ${userId}\n`;
    chatContent += `Session ID: ${conversationId}\n`;
    chatContent += `Date: ${new Date().toISOString()}\n`;
    chatContent += `Total Messages: ${chats.length}\n`;
    chatContent += `${'='.repeat(50)}\n\n`;

    // Add each question-answer pair
    chats.forEach((chat, index) => {
      chatContent += `Question ${index + 1}: ${chat.message}\n`;
      chatContent += `Answer ${index + 1}: ${chat.response}\n\n`;
    });

    // Write to file
    fs.writeFileSync(filepath, chatContent, 'utf8');
    console.log(`Chat session saved to: ${filepath}`);
    
  } catch (error) {
    console.error('Error saving chat to text file:', error);
    // Don't throw error to avoid breaking the main chat flow
  }
};

const sendMessageController = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.auth._id;

    // Validate input
    if (!message?.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid message is required" 
      });
    }

    const conversationId = sessionId || uuidv4();
    const isNewSession = !sessionId;

    // Get recent chat history with proper filtering
    const pastChats = await Chat.find(
      { 
        user: userId, 
        conversationId,
        message: { $exists: true, $ne: null, $ne: "" },
        response: { $exists: true, $ne: null, $ne: "" }
      },
      { message: 1, response: 1, _id: 0 }
    )
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

    // Prepare message history with validation
    const messageHistory = [
      { role: "system", content: "You are a helpful AI assistant." }
    ];

    // Add past chats with content validation
    pastChats.reverse().forEach(chat => {
      if (chat.message?.trim()) {
        messageHistory.push({ role: "user", content: chat.message.trim() });
      }
      if (chat.response?.trim()) {
        messageHistory.push({ role: "assistant", content: chat.response.trim() });
      }
    });

    // Add current message
    messageHistory.push({ 
      role: "user", 
      content: message.trim() 
    });

    // Validate message history before sending
    const isValidHistory = messageHistory.every(msg => 
      msg.content && typeof msg.content === 'string'
    );

    if (!isValidHistory) {
      console.error("Invalid message history format:", messageHistory);
      return res.status(400).json({
        success: false,
        message: "Invalid chat history format"
      });
    }

    // BACKGROUND PROCESS: Semantic mapping for assessment
    try {
      // Get the last assessment result for this conversation to determine context
      const lastAssessment = await AssessmentResult.findOne({ 
        user: userId, 
        conversationId 
      }).sort({ timestamp: -1 });

      let semanticPayload = {
        message: message.trim(),
        conversationId
      };

      // If we have a previous assessment with a question but no response yet,
      // we're expecting an option response
      if (lastAssessment && (lastAssessment.response === null || lastAssessment.response === undefined)) {
        semanticPayload.mappingType = 'option';
        semanticPayload.category = lastAssessment.category;
        semanticPayload.question = lastAssessment.question;
      } else {
        // Otherwise, we're looking for a new question match
        semanticPayload.mappingType = 'question';
      }

      try {
        // Call semantic service with a longer timeout
        const semanticResponse = await axios.post(
          SEMANTIC_SERVICE_URL, 
          semanticPayload,
          { timeout: 1000000 }
        );

        if (semanticResponse.data && semanticResponse.data.success) {
          if (semanticResponse.data.mappingType === 'question') {
            // Save the mapped question
            await AssessmentResult.create({
              user: userId,
              conversationId,
              category: semanticResponse.data.category,
              question: semanticResponse.data.question,
              // These fields are now optional in the schema
              response: null,
              score: -1,
              timestamp: new Date()
            });
            
            console.log(`Mapped user message to question: ${semanticResponse.data.question} (${semanticResponse.data.category})`);
          } 
          else if (semanticResponse.data.mappingType === 'option') {
            // Check if the confidence is high enough to consider it a valid option match
            const confidenceThreshold = 0.6; // Adjust this threshold as needed
            
            // Get the last assessment to ensure we're matching an option to the correct question
            const lastAssessment = await AssessmentResult.findOne({ 
              user: userId, 
              conversationId,
              response: null,  // Only get questions without responses
              score: -1
            }).sort({ timestamp: -1 });
            
            console.log(`DEBUG: Last assessment question: "${lastAssessment?.question}" (${lastAssessment?.category})`);
            console.log(`DEBUG: Mapped option for question: "${semanticResponse.data.question}" (${semanticResponse.data.category})`);
            console.log(`DEBUG: Option: "${semanticResponse.data.mappedOption}" with confidence: ${semanticResponse.data.confidence}`);
            
            // Strict question matching - only match if the questions are exactly the same
            const questionsMatch = lastAssessment && 
                                  lastAssessment.question === semanticResponse.data.question && 
                                  lastAssessment.category === semanticResponse.data.category;
            
            if (lastAssessment && 
                semanticResponse.data.confidence >= confidenceThreshold &&
                questionsMatch) {
              
              // Update the assessment with the option response
              await AssessmentResult.findByIdAndUpdate(
                lastAssessment._id,
                {
                  response: semanticResponse.data.mappedOption,
                  score: semanticResponse.data.score
                }
              );
              
              console.log(`Mapped user message to option: ${semanticResponse.data.mappedOption} (score: ${semanticResponse.data.score}, confidence: ${semanticResponse.data.confidence})`);
            } else {
              // Either confidence too low or question mismatch, check if it matches a new question instead
              if (!lastAssessment) {
                console.log("No pending assessment question found");
              } else if (semanticResponse.data.confidence < confidenceThreshold) {
                console.log(`Option match confidence too low (${semanticResponse.data.confidence}), checking for question match instead`);
                
                // Mark the previous question as abandoned if option doesn't match well
                await AssessmentResult.findByIdAndUpdate(
                  lastAssessment._id,
                  {
                    response: "Not answered",
                    score: -2  // Special score to indicate abandoned question
                  }
                );
                
                console.log(`Marked question "${lastAssessment.question}" as abandoned due to low option match confidence`);
              } else if (!questionsMatch) {
                console.log(`Question mismatch: Expected "${lastAssessment.question}" (${lastAssessment.category}), got "${semanticResponse.data.question}" (${semanticResponse.data.category})`);
                
                // Mark the previous question as abandoned if option is for a different question
                await AssessmentResult.findByIdAndUpdate(
                  lastAssessment._id,
                  {
                    response: "Not answered",
                    score: -2  // Special score to indicate abandoned question
                  }
                );
                
                console.log(`Marked question "${lastAssessment.question}" as abandoned due to question mismatch`);
              }
              
              // Create a new payload for question mapping
              const questionPayload = {
                message: message.trim(),
                conversationId,
                mappingType: 'question'
              };
              
              // Call semantic service again to check for question match
              const questionResponse = await axios.post(
                SEMANTIC_SERVICE_URL, 
                questionPayload,
                { timeout: 1000000 }
              );
              
              if (questionResponse.data && 
                  questionResponse.data.success && 
                  questionResponse.data.confidence >= 0.6) { // Higher threshold for questions
                
                // Save the new mapped question
                await AssessmentResult.create({
                  user: userId,
                  conversationId,
                  category: questionResponse.data.category,
                  question: questionResponse.data.question,
                  response: null,
                  score: -1,
                  timestamp: new Date()
                });
                
                console.log(`Message mapped to new question instead: ${questionResponse.data.question} (${questionResponse.data.category})`);
              } else {
                console.log("Message doesn't match an option or a new question with sufficient confidence");
              }
            }
          }
        } else {
          console.log("Semantic service returned unsuccessful response:", semanticResponse.data);
        }
      } catch (apiError) {
        console.error("Error calling semantic service API:", apiError.message);
        // Continue with the chat flow even if semantic service fails
      }
    } catch (semanticError) {
      // Log but don't fail the main request
      console.error("Error in semantic mapping:", semanticError);
    }

    // Call AI service (main chat flow continues as normal)
    const aiResponse = await axios.post(AI_API_URL, {
      model: "sarvuday_v2",
      messages: messageHistory,
      max_tokens: 150,
      temperature: 0.8,
      stream: false,
    }, { timeout: 1000000 });

    const responseText = aiResponse?.data?.choices?.[0]?.message?.content?.trim() || 
                       "I couldn't process that request. Please try again.";

    // Save chat
    const newChat = await Chat.create({
      user: userId,
      message: message.trim(),
      response: responseText,
      conversationId,
      ...(isNewSession && { 
        conversationName: message.trim().substring(0, 50) 
      })
    });

    // Save chat session to text file (background process)
    saveChatToTextFile(userId, conversationId).catch(error => {
      console.error('Background text file save failed:', error);
    });

    res.status(200).json({ 
      success: true, 
      chat: newChat, 
      sessionId: conversationId,
      isNewSession
    });

  } catch (error) {
    if (error.response) {
      console.error("AI API Error:", error.response.data);
      return res.status(502).json({
        success: false,
        message: "Error communicating with AI service",
        details: error.response.data.error
      });
    }
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Error processing chat",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get chat history for a session
const getChatHistoryController = async (req, res) => {
  try {
    const userId = req.auth._id;
    const { sessionId } = req.query;

    // Disable caching
    res.setHeader('Cache-Control', 'no-store');

    const chats = await Chat.find({
      user: userId,
      conversationId: sessionId,
      message: { $exists: true, $ne: "" } // Only return actual messages
    }).sort({ createdAt: 1 });

    res.status(200).json({ 
      success: true, 
      chats,
      sessionId
    });
  } catch (error) {
    console.error("History error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching history"
    });
  }
};
// Create new chat session
const createChatSession = async (req, res) => {
  try {
    const userId = req.auth._id;
    const { initialMessage } = req.body; // Get first message if available

    const sessionId = uuidv4();
    
    // Always use the initial message for the conversation name
    // If no initial message is provided, use a timestamp-based name
    const conversationName = initialMessage 
      ? initialMessage.substring(0, 50) 
      : `Chat ${new Date().toLocaleString()}`;
    
    await Chat.create({
      user: userId,
      conversationId: sessionId,
      conversationName: conversationName,
      isSessionHeader: true
    });

    res.status(201).json({
      success: true,
      sessionId,
      conversationName: conversationName
    });
  } catch (error) {
    console.error("Session creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create session"
    });
  }
};

// Get all chat sessions for user
const getChatSessions = async (req, res) => {
  try {
    const userId = req.auth._id;

    // First, get all session IDs and basic info
    const sessions = await Chat.aggregate([
      { 
        $match: { 
          user: new mongoose.Types.ObjectId(userId),
          $or: [
            { isSessionHeader: true },
            { conversationName: { $exists: true } }
          ]
        } 
      },
      {
        $group: {
          _id: "$conversationId",
          sessionName: { $first: "$conversationName" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $max: "$createdAt" }
        }
      },
      { $sort: { updatedAt: -1 } }
    ]);

    // For each session, find the first user message
    const sessionsWithFirstMessage = await Promise.all(
      sessions.map(async (session) => {
        // Find the first message in this conversation
        const firstMessage = await Chat.findOne({
          user: userId,
          conversationId: session._id,
          message: { $exists: true, $ne: "" }
        }).sort({ createdAt: 1 }).lean();

        return {
          _id: session._id,
          // Use the first message as the session name if available
          sessionName: firstMessage?.message || session.sessionName || `Chat ${new Date(session.createdAt).toLocaleString()}`,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          // Include the first message for reference
          firstMessage: firstMessage?.message || null
        };
      })
    );

    res.status(200).json({ 
      success: true, 
      sessions: sessionsWithFirstMessage
    });

  } catch (error) {
    handleError(res, error, "fetching chat sessions");
  }
};

// Get assessment results for a user
const getAssessmentResults = async (req, res) => {
  try {
    const userId = req.auth._id;
    const { sessionId, category } = req.query;
    
    const query = { user: userId };
    
    // Add filters if provided
    if (sessionId) query.conversationId = sessionId;
    if (category) query.category = category;
    
    // Only get completed assessments (with both question and response)
    // If we want to include pending assessments (questions without responses), remove these filters
    query.response = { $ne: null };
    query.score = { $ne: -1 };
    
    const results = await AssessmentResult.find(query)
      .sort({ timestamp: -1 })
      .lean();
      
    // Group by conversation and category
    const groupedResults = {};
    
    results.forEach(result => {
      const convId = result.conversationId;
      const cat = result.category;
      
      if (!groupedResults[convId]) {
        groupedResults[convId] = {};
      }
      
      if (!groupedResults[convId][cat]) {
        groupedResults[convId][cat] = {
          totalScore: 0,
          responses: []
        };
      }
      
      groupedResults[convId][cat].responses.push({
        question: result.question,
        response: result.response,
        score: result.score,
        timestamp: result.timestamp
      });
      
      groupedResults[convId][cat].totalScore += result.score;
    });
    
    res.status(200).json({
      success: true,
      results: groupedResults
    });
    
  } catch (error) {
    handleError(res, error, "fetching assessment results");
  }
};

// Export chat session to text file
const exportChatSessionController = async (req, res) => {
  try {
    const userId = req.auth._id;
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required"
      });
    }

    // Verify the session belongs to the user
    const sessionExists = await Chat.findOne({
      user: userId,
      conversationId: sessionId
    });

    if (!sessionExists) {
      return res.status(404).json({
        success: false,
        message: "Chat session not found"
      });
    }

    // Save to text file
    await saveChatToTextFile(userId, sessionId);

    res.status(200).json({
      success: true,
      message: "Chat session exported to text file successfully",
      filename: `patient_${userId}_session_${sessionId}.txt`
    });

  } catch (error) {
    handleError(res, error, "exporting chat session");
  }
};

module.exports = {
  sendMessageController,
  getChatHistoryController,
  getChatSessions,
  createChatSession,
  getAssessmentResults,
  exportChatSessionController
};