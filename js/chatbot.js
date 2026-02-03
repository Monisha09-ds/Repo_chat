document.addEventListener('DOMContentLoaded', function () {
    // Configuration
    const config = {
        botName: 'Monisha AI',
        typingSpeed: 30, // ms per character
        initialDelay: 600,
        chatHistoryLimit: 50
    };

    // State
    const state = {
        isOpen: false,
        isTyping: false,
        context: {
            lastTopic: null, // e.g., 'projects', 'skills'
            lastEntity: null // e.g., 'nutriguide'
        },
        messageQueue: []
    };

    // Knowledge Base - Structured for better retrieval
    const knowledgeBase = [
        {
            id: 'greetings',
            keywords: ['hello', 'hi', 'hey', 'greetings', 'morning', 'afternoon', 'start'],
            response: "Hi there! I'm <b>Monisha AI</b>. I can tell you everything about Monisha's <b>Skills</b>, <b>Projects</b>, <b>Certifications</b>, <b>Research</b>, and <b>Experience</b>. What would you like to know first?",
            followUpChips: ['Skills', 'Projects', 'Resume']
        },
        {
            id: 'about',
            keywords: ['about', 'who', 'bio', 'introduction', 'myself'],
            response: `👩‍💻 <b>About Monisha:</b><br><br>
            She is a passionate <b>AI Engineer & Research Analyst</b> with over <b>2.5 years of experience</b>. She focuses on building intelligent systems using <b>Generative AI, NLP, and Computer Vision</b>. She loves uncovering hidden data insights and implementing cutting-edge frameworks.<br><br>
            She is currently open to new opportunities!`,
            followUpChips: ['Skills', 'Experience', 'Contact']
        },
        {
            id: 'resume',
            keywords: ['resume', 'cv', 'download', 'pdf', 'profile'],
            response: `📄 <b>Download Monisha's Resume:</b><br><br>
<a href="https://drive.google.com/file/d/1bDMGBARC3MTMIxhA3tY18BAPL4ItNOoG/view?usp=drive_link" target="_blank" style="color:#b4aea2; text-decoration:underline;">📥 Updated Resume (Google Drive)</a><br><br>
<a href="https://drive.google.com/drive/folders/17nutttyZG71Ah-8JYREmNeAULDtokPdK?usp=drive_link" target="_blank" style="color:#b4aea2; text-decoration:underline;">📁 Full CV Folder</a>`,
            followUpChips: ['Experience', 'Projects']
        },
        {
            id: 'skills_core',
            keywords: ['skill', 'tech stack', 'technologies', 'proficient', 'expert', 'stack'],
            response: `💡 <b>Core Skills:</b><br><br>
• <b>Python</b> (Expert)<br>
• <b>Generative AI</b> (OpenAI, Gemini, Llama, Hugging Face)<br>
• <b>Machine Learning</b> (TensorFlow, PyTorch, Scikit-Learn)<br>
• <b>NLP & LLMs</b> (Fine-tuning, RAG, Prompt Engineering)<br>
• <b>Databases</b> (SQL, PostgreSQL, Neo4j, Redis)<br>
• <b>MLOps</b> (Docker, GitHub Actions, AWS)<br><br>
Want to see her <b>Certifications</b> or <b>Projects</b>?`,
            followUpChips: ['Certifications', 'Projects', 'Frameworks']
        },
        {
            id: 'frameworks',
            keywords: ['framework', 'library', 'libraries', 'tool', 'flask', 'django', 'fastapi'],
            response: `🚀 <b>Frameworks & Libraries:</b><br><br>
<b>Backend:</b> Flask, FastAPI, Django, Streamlit<br>
<b>Data Science:</b> Numpy, Pandas, Matplotlib, Scipy, Seaborn, Plotly<br>
<b>ML/DL:</b> Scikit-Learn, TensorFlow, PyTorch, Keras<br>
<b>Gen AI:</b> LangChain, LangGraph, CrewAI, Autogen, Llama-index`,
            followUpChips: ['Projects', 'certifications']
        },
        {
            id: 'projects_list',
            keywords: ['project', 'work', 'portfolio', 'built', 'created', 'app', 'system'],
            response: `🎯 <b>Featured Projects:</b><br><br>
1️⃣ <b>NutriGuide</b> (Diet Planner)<br>
2️⃣ <b>AI Sales Assistance</b> (Agentic Workflow)<br>
3️⃣ <b>Multimodal RAG Chatbot</b> (Voice+Image)<br>
4️⃣ <b>Habit Tracker AI</b> (Productivity)<br>
5️⃣ <b>Smart University Chatbot</b> (Gemini)<br>
6️⃣ <b>Alzheimer's Detection</b> (Research)<br><br>
Click a button below for details!`,
            followUpChips: ['NutriGuide', 'AI Sales Bot', 'Multimodal RAG', 'Research']
        },
        {
            id: 'proj_nutriguide',
            keywords: ['nutriguide', 'diet', 'calorie', 'nutrition', 'food'],
            response: `🥗 <b>NutriGuide: Calorie Tracker</b><br><br>
Identifies nutrition from food images using AI and offers personalized diet plans.<br><br>
📂 <a href="https://github.com/Monisha09-ds/Gemini_Calorie_App.git" target="_blank" style="color:#b4aea2;">GitHub Link</a>`,
            followUpChips: ['Next Project', 'Projects']
        },
        {
            id: 'proj_sales',
            keywords: ['sales', 'agent', 'automation', 'dealership', 'langgraph'],
            response: `🚗 <b>AI Sales Assistance</b><br><br>
Multi-agent system for vehicle dealerships. Automates inventory, FAQs, trade-ins, and scheduling.<br>
<b>Tech:</b> LangGraph, LangChain, RAG.<br><br>
(Ask for <b>Habit Tracker</b> or <b>Multimodal</b> next!)`,
            followUpChips: ['Multimodal RAG', 'Habit Tracker']
        },
        {
            id: 'proj_multimodal',
            keywords: ['multimodal', 'voice', 'image query', 'whisper', 'gemma'],
            response: `🎙️ <b>Multimodal RAG Chatbot</b><br><br>
Handles text, image, and voice queries using Speech-to-Text and Re-ranking models.<br>
<b>Tech:</b> Hugging Face (Gemma, Whisper), LangChain.<br><br>
📂 <a href="https://github.com/Monisha09-ds/multimodal.git" target="_blank" style="color:#b4aea2;">GitHub Link</a>`,
            followUpChips: ['Projects', 'Research']
        },
        {
            id: 'proj_habit',
            keywords: ['habit', 'personality', 'productivity', 'coach'],
            response: `📊 <b>Habit Tracker AI</b><br><br>
Personality-aware productivity coach. Identifies traits and motivates users.<br>
<b>Tech:</b> OpenAI, FastAPI, Render.`,
            followUpChips: ['Projects']
        },
        {
            id: 'research',
            keywords: ['research', 'publication', 'paper', 'alzheimer', 'science', 'detection'],
            response: `🔬 <b>Research Work:</b><br><br>
<b>Alzheimer's Detection using XAI in Capsule Network</b><br>
Presented at Springer Nature conference.<br><br>
📄 <a href="https://doi.org/10.1007/978-3-032-04657-4_2" target="_blank" style="color:#b4aea2;">Read Paper</a><br>
📂 <a href="https://github.com/Monisha09-ds/Early-_AD_Detection.git" target="_blank" style="color:#b4aea2;">GitHub Repo</a>`,
            followUpChips: ['Certifications', 'Projects']
        },
        {
            id: 'certifications',
            keywords: ['certification', 'course', 'certificate', 'learning', 'udemy', 'deeplearning'],
            response: `📜 <b>Certifications:</b><br><br>
• <b>Generative AI Mastery</b> (Udemy)<br>
• <b>Prompt Compression & Optimization</b> (DeepLearning.AI)<br>
• <b>Orchestrating GenAI Workflows</b> (DeepLearning.AI)<br>
• <b>ChatGPT Prompt Engineering</b> (DeepLearning.AI)<br>
• <b>Knowledge Graphs for RAG</b> (DeepLearning.AI)<br>
• <b>Python Bootcamp</b> (Udemy)<br><br>
<a href="https://drive.google.com/file/d/1b2mHhNJQRHVACl8HXrWDoVU3na2cpZeB/view?usp=sharing" target="_blank" style="color:#b4aea2;">View Certificates</a>`,
            followUpChips: ['Experience', 'Skills']
        },
        {
            id: 'experience',
            keywords: ['experience', 'job', 'work history', 'career', 'role'],
            response: `💼 <b>Experience:</b><br><br>
<b>AI Engineer & Research Analyst</b> (2.5+ Years)<br>
• Developed RAG pipelines and Agentic workflows.<br>
• Built scalable ML models and web scrapers.<br>
• Mentored students in AI/ML.<br><br>
Ask about her <b>Research</b> or <b>Projects</b>!`,
            followUpChips: ['Projects', 'Resume']
        },
        {
            id: 'contact',
            keywords: ['contact', 'email', 'phone', 'hire', 'reach', 'linkedin', 'github', 'address'],
            response: `📧 <b>Contact Details:</b><br><br>
<b>Email:</b> <a href="mailto:itmonisha95@gmail.com" style="color:#b4aea2;">itmonisha95@gmail.com</a><br>
<b>LinkedIn:</b> <a href="https://www.linkedin.com/in/sabikun-monisha-0a59aa184" target="_blank" style="color:#b4aea2;">Profile</a><br>
<b>GitHub:</b> <a href="https://github.com/Monisha09-ds" target="_blank" style="color:#b4aea2;">@Monisha09-ds</a><br>
<b>Address:</b> Khilgaon, Dhaka, Bangladesh`,
            followUpChips: ['Resume']
        }
    ];

    // DOM Elements
    const elements = {
        fab: document.getElementById('chat-fab'),
        container: document.getElementById('chat-container'),
        close: document.getElementById('chat-close'),
        messages: document.getElementById('chat-messages'),
        input: document.getElementById('chat-input'),
        send: document.getElementById('chat-send'),
        chipsContainer: document.getElementById('suggestion-chips-container')
    };

    // --- Core Logic: The "Brain" ---

    function tokenize(text) {
        return text.toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
            .split(/\s+/)
            .filter(w => w.length > 2); // Filter out very short words
    }

    function calculateScore(tokens, keywords) {
        let score = 0;
        tokens.forEach(token => {
            if (keywords.includes(token)) score += 10;
            // Simple partial match
            keywords.forEach(k => {
                if (k.includes(token) || token.includes(k)) score += 2;
            });
        });
        return score;
    }

    function findBestMatch(userInput) {
        const tokens = tokenize(userInput);
        let bestMatch = null;
        let highestScore = 0;

        knowledgeBase.forEach(item => {
            const score = calculateScore(tokens, item.keywords);
            if (score > highestScore) {
                highestScore = score;
                bestMatch = item;
            }
        });

        // Threshold for "I don't understand"
        if (highestScore < 4) {
            // Fallback Logic: Check context or return default
            if (state.context.lastTopic === 'projects' && (userInput.includes('more') || userInput.includes('detail'))) {
                return findBestMatch('projects'); // Reset to projects list
            }
            return null;
        }

        return bestMatch;
    }

    // --- Interaction Logic ---

    function toggleChat() {
        state.isOpen = !state.isOpen;
        elements.container.classList.toggle('active', state.isOpen);

        if (state.isOpen && elements.messages.children.length === 0) {
            setTimeout(() => {
                const welcomeMsg = knowledgeBase.find(k => k.id === 'greetings');
                typeOutMessage(welcomeMsg.response, () => {
                    renderChips(welcomeMsg.followUpChips);
                });
            }, 500);
        }
    }

    function handleInput() {
        const text = elements.input.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        elements.input.value = '';

        // Disable input while bot thinks/types
        setInputState(false);

        processBotResponse(text);
    }

    function setInputState(enabled) {
        elements.input.disabled = !enabled;
        elements.send.disabled = !enabled;
    }

    function processBotResponse(userInput) {
        // 1. Show thinking indicator
        showThinking();

        // 2. Artificial delay to mimic API latency (1-2s)
        const delay = config.initialDelay + Math.random() * 800;

        setTimeout(() => {
            removeThinking();

            const match = findBestMatch(userInput);
            let responseText = "";
            let chips = ['Skills', 'Projects', 'Contact']; // Default chips

            if (match) {
                responseText = match.response;
                state.context.lastTopic = match.id;
                if (match.followUpChips) chips = match.followUpChips;
            } else {
                responseText = "I'm not sure about that yet. Try asking about <b>Projects</b>, <b>Skills</b>, or <b>Contact Info</b>. I can also help you find Monisha's <b>Resume</b>.";
            }

            typeOutMessage(responseText, () => {
                renderChips(chips);
            });

        }, delay);
    }


    // --- UI Rendering ---

    function addMessage(html, sender) {
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        div.innerHTML = html; // User messages usually plain text, but keeping innerHTML for flexibility
        elements.messages.appendChild(div);
        scrollToBottom();
        return div;
    }

    // The "Streaming" Effect
    function typeOutMessage(htmlContent, onComplete) {
        state.isTyping = true;
        const div = document.createElement('div');
        div.className = 'message bot';
        elements.messages.appendChild(div);

        // Simple HTML parser to handle tags correctly while typing

        let i = 0;
        let currentHTML = "";

        function typeStep() {
            if (i >= htmlContent.length) {
                state.isTyping = false;
                div.innerHTML = htmlContent; // Ensure final content is clean without cursor
                setInputState(true);
                if (onComplete) onComplete();
                return;
            }

            // Check if we are opening a tag
            if (htmlContent[i] === '<') {
                const closeIndex = htmlContent.indexOf('>', i);
                if (closeIndex !== -1) {
                    currentHTML += htmlContent.substring(i, closeIndex + 1);
                    i = closeIndex + 1;
                    div.innerHTML = currentHTML;
                    scrollToBottom();
                    setTimeout(typeStep, 0); // Fast forward through tags
                    return;
                }
            }

            currentHTML += htmlContent[i];
            div.innerHTML = currentHTML + "▍"; // Add cursor
            i++;

            scrollToBottom();
            setTimeout(typeStep, config.typingSpeed);
        }

        typeStep();
    }

    function renderChips(chips) {
        if (!elements.chipsContainer) return;

        elements.chipsContainer.innerHTML = ''; // Clear existing

        chips.forEach(chipText => {
            const btn = document.createElement('button');
            btn.className = 'suggestion-chip';
            btn.textContent = chipText;
            btn.dataset.query = chipText;

            btn.addEventListener('click', () => {
                addMessage(chipText, 'user');
                processBotResponse(chipText);
            });

            elements.chipsContainer.appendChild(btn);
        });

        // Scroll to start
        elements.chipsContainer.scrollLeft = 0;
    }

    function showThinking() {
        if (document.getElementById('typing-indicator')) return;
        const div = document.createElement('div');
        div.className = 'typing-indicator';
        div.id = 'typing-indicator';
        div.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        elements.messages.appendChild(div);
        scrollToBottom();
    }

    function removeThinking() {
        const el = document.getElementById('typing-indicator');
        if (el) el.remove();
    }

    function scrollToBottom() {
        elements.messages.scrollTop = elements.messages.scrollHeight;
    }

    // --- event Listeners ---

    elements.fab.addEventListener('click', toggleChat);
    elements.close.addEventListener('click', toggleChat);
    elements.send.addEventListener('click', handleInput);
    elements.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleInput();
    });

    // Initial Render of static chips (though we replace them dynamically usually)
    // We can rely on HTML ones being there until first interaction, OR we can clear them.
    // However, the event listeners for static chips are GONE in this version because I removed that block.
    // Instead, I should probably init the chips on load.

    // Initial Setup
    // Use the existing chips in HTML? 
    // The existing HTML has chips, but my new logic renders them dynamically.
    // I need to attach listeners to the EXISTING chips if I want them to work before the first bot response.
    // OR just clearer to rerender them.

    const initialChips = ['Skills', 'Projects', 'Resume', 'Contact'];
    renderChips(initialChips);

});

