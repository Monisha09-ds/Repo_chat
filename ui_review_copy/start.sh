#!/bin/bash

echo "🚀 Starting Portfolio Chatbot Playground..."
echo "📍 Access your portfolio at http://localhost:8000"
echo "Press Ctrl+C to stop the server."

# Check if python3 is installed
if command -v python3 &>/dev/null; then
    python3 -m http.server 8000
else
    echo "❌ Error: Python 3 is not installed. Please install it or use another HTTP server."
    exit 1
fi
