# Portfolio Chatbot Playground 🚀

Welcome to the Portfolio Chatbot Playground! This project features a modular, client-side chatbot integrated into a profession portfolio, built with a clean 4-layer architecture.

## 🏗️ Architecture

The chatbot is built using **Vanilla JavaScript** (no dependencies) following a structured approach:

1.  **Knowledge Base Layer**: Central repository for all chatbot knowledge and intent mappings.
2.  **Intent Detection Layer**: Analyzes user input with keyword matching and fuzzy logic.
3.  **Response Generation Layer**: Extracts content dynamically from the DOM sections of the portfolio.
4.  **UI Rendering Layer**: Manages the chat interface, typing animations, and interactions.

## 📁 Key Files

- `index.html`: The main portfolio page containing the chatbot UI.
- `js/chatbot.js`: The core logic for the chatbot.
- `css/chatbot.css`: Styles for the chat interface.
- `CHATBOT_ARCHITECTURE.md`: Detailed documentation of the internal design.

## 🚀 Getting Started

To run the project locally, you just need a simple HTTP server. 

### Quick Start (Linux/macOS)
```bash
chmod +x start.sh
./start.sh
```

### Manual Start (Python)
If you have Python installed, you can also run:
```bash
python3 -m http.server 8000
```
Then open [http://localhost:8000](http://localhost:8000) in your browser.

## 🛠️ How to Extend

1.  Open `js/chatbot.js`.
2.  Add new intents to `KnowledgeBase.intentMap`.
3.  Add custom extraction logic to `ResponseGenerator` if needed.
4.  The chatbot will automatically use the content from your HTML sections!

---
*Created by Monisha*