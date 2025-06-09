#!/bin/bash

# This script installs Ollama and pulls the required embedding model

# Check if Ollama is already installed
if ! command -v ollama &> /dev/null; then
    echo "Installing Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
else
    echo "Ollama is already installed."
fi

# Pull the embedding model
echo "Pulling the nomic-embed-text model..."
ollama pull nomic-embed-text

echo "Setup complete! You can now run the semantic service with Ollama embeddings."