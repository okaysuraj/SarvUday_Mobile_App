# Chat Logs Directory

This directory contains text file backups of chat sessions alongside the MongoDB storage.

## File Format

Each chat session is saved as a separate text file with the following naming convention:
```
patient_{userId}_session_{conversationId}.txt
```

## File Content Structure

```
Patient ID: {userId}
Session ID: {conversationId}
Date: {ISO timestamp}
Total Messages: {count}
==================================================

Question 1: {user message}
Answer 1: {AI response}

Question 2: {user message}
Answer 2: {AI response}

...
```

## Automatic Saving

- Text files are automatically created/updated after each message exchange
- Files are saved in the background without affecting chat performance
- If text file saving fails, the chat functionality continues normally

## Manual Export

You can also manually export a specific chat session using the API endpoint:
```
POST /api/chat/export-session/{sessionId}
```

## Security Notes

- This directory is excluded from version control (.gitignore)
- Contains sensitive patient data - ensure proper access controls
- Files should be backed up securely and in compliance with data protection regulations

## File Management

- Files accumulate over time and should be archived/cleaned periodically
- Consider implementing retention policies based on your requirements
- Monitor disk space usage as chat volumes grow