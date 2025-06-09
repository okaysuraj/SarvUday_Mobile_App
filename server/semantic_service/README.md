# Semantic Assessment Service

This service maps user messages to mental health assessment questions and options using semantic similarity with Ollama embeddings.

## Features

- Maps user messages to questions from PHQ-9, BDI, and HDRS assessments
- Maps user responses to assessment options
- Tracks conversation state to maintain context
- Uses Ollama for high-quality embeddings and semantic matching

## Setup

### 1. Install Ollama

#### Windows
Run the PowerShell script:
```
.\setup_ollama.ps1
```

#### Linux/Mac
Run the bash script:
```
chmod +x setup_ollama.sh
./setup_ollama.sh
```

Or install manually:
```
curl -fsSL https://ollama.com/install.sh | sh
ollama pull nomic-embed-text
```

### 2. Install Python Dependencies

```
pip install flask requests numpy
```

### 3. Start the Service

```
python semantic_service.py
```

The service will run on http://localhost:5000

## Testing

Run the test script to verify the service is working correctly:

```
python test_semantic.py
```

## API Endpoints

### Map Response

**URL:** `/map-response`
**Method:** `POST`

**Request Body:**
```json
{
  "message": "User message text",
  "conversationId": "unique-conversation-id",
  "mappingType": "auto|question|option",
  "category": "PHQ-9|BDI|HDRS",  // Required for option mapping
  "question": "Question text"    // Required for option mapping
}
```

**Response:**
```json
{
  "success": true,
  "mappingType": "question|option",
  "question": "Matched question text",
  "category": "PHQ-9|BDI|HDRS",
  "mappedOption": "Matched option text",  // Only for option mapping
  "score": 0-3,                          // Only for option mapping
  "confidence": 0.0-1.0
}
```

## Integration with Chat System

This service runs in the background during normal chat interactions:
1. When a user sends a message, it's processed by the AI model as usual
2. In the background, the message is mapped to an assessment question
3. The next user message is analyzed:
   - If it matches an option for the previous question with high confidence, it's recorded as a response
   - If it doesn't match any option well, it's checked against assessment questions instead
   - If it matches neither options nor questions well, it's ignored for assessment purposes
4. This allows for natural conversation flow with intermittent assessment

### Confidence Thresholds and Question-Option Matching

The system uses confidence thresholds to determine whether a message should be mapped:
- For option mapping: Confidence must be ≥ 0.6
- For question mapping: Confidence must be ≥ 0.6

Additionally, the system enforces strict question-option matching with question abandonment:
1. When a user message is mapped to a question, it's stored in the database with null response
2. The next message is evaluated as a potential option for that specific question
3. For an option to be matched:
   - It must have sufficient confidence (≥ 0.6)
   - It must be an option for the exact question that was previously mapped
4. If the message doesn't match an option with sufficient confidence:
   - The previous question is marked as "Not answered" in the database
   - The system abandons that question and won't try to match options to it anymore
   - The system checks if the message matches a new question instead
   - If it matches a new question, that question is stored for future option matching
5. This ensures that the system doesn't persist in trying to match options to a question when the conversation has moved on

This approach ensures that:
- Only high-quality matches are recorded
- Options are only matched to their corresponding questions
- The conversation can flow naturally with assessment happening organically