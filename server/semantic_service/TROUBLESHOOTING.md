# Troubleshooting the Semantic Assessment Service

If you're encountering errors with the semantic assessment service, follow these steps to resolve them.

## Common Issues and Solutions

### 1. "AssessmentResult validation failed: response: Path `response` is required"

This error occurs when trying to create an assessment result without a response value. The fix has been applied by:

- Making the `response` and `score` fields optional in the schema
- Adding better error handling in the controller

### 2. Ollama Connection Issues

If you're having trouble connecting to Ollama:

1. Check if Ollama is installed and running:
   ```
   python check_ollama.py
   ```

2. If Ollama is not installed:
   - Download from https://ollama.com/download
   - Install and start the service

3. Pull the required model:
   ```
   ollama pull nomic-embed-text
   ```

### 3. Using the Simple Semantic Service (No Ollama Required)

If you prefer not to use Ollama or are having persistent issues, you can use the simple version:

1. Stop the current semantic service if it's running
2. Start the simple version:
   ```
   python simple_semantic_service.py
   ```

This version uses basic keyword matching instead of embeddings but doesn't require Ollama.

### 4. Timeout Issues

If the semantic service is taking too long to respond:

1. The timeout has been reduced from 500000ms to 10000ms (10 seconds)
2. Error handling has been improved to continue the chat flow even if the semantic service fails

## Checking the Logs

If you're still having issues, check the logs for:

1. "Error in semantic mapping" - This indicates an issue with the assessment process
2. "Error calling semantic service API" - This indicates a problem connecting to the semantic service
3. "Semantic service returned unsuccessful response" - This indicates the service is running but returning errors

## Restarting the Services

Sometimes a simple restart can fix issues:

1. Stop the Node.js server (Ctrl+C)
2. Stop the semantic service (Ctrl+C)
3. Start the semantic service:
   ```
   cd server/semantic_service
   python semantic_service.py
   ```
   or
   ```
   python simple_semantic_service.py
   ```
4. Start the Node.js server:
   ```
   cd server
   npm start
   ```

## Contact Support

If you continue to experience issues, please provide:
1. The exact error message
2. The steps to reproduce the issue
3. The versions of Node.js, Python, and Ollama you're using