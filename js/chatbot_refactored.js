/**
 * ============================================
 * PORTFOLIO CHATBOT - CLEAN 4-LAYER ARCHITECTURE
 * ============================================
 * 
 * A refactored, modular client-side chatbot system:
 * 1. Knowledge Base Layer - Maps intents to DOM sections
 * 2. Intent Detection Layer - Analyzes user input
 * 3. Response Generation Layer - Extracts and formats content
 * 4. UI Rendering Layer - Manages all UI interactions
 * 
 * Key Improvements:
 * - No long if-else chains (uses object mapping)
 * - Clean separation of concerns
 * - Easy to extend and maintain
 * - Dynamically extracts content from DOM
 */

// ============================================
// LAYER 1: KNOWLEDGE BASE
// ============================================

class KnowledgeBase {
    constructor() {
        // Intent to section mapping - easily extensible
        this.intentMap = {
            greeting: {
                keywords: ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'start'],
                type: 'static',
                sectionId: null
            },
            about: {
                keywords: ['about', 'who are you', 'tell me about', 'background', 'bio', 'introduction', 'yourself'],
                type: 'dynamic',
                sectionId: 'about-section'
            },
            skills: {
                keywords: ['skills', 'technologies', 'tech stack', 'what can you do', 'expertise', 'competencies', 'frameworks', 'tools', 'programming'],
                type: 'dynamic',
                sectionId: 'about-section',
                extractStrategy: 'skills'
            },
            experience: {
                keywords: ['experience', 'work', 'job', 'career', 'employment', 'resume', 'cv', 'history', 'current work', 'workplace', 'years of experience', 'research experience'],
                type: 'dynamic',
                sectionId: 'resume-section',
                extractStrategy: 'experience'
            },
            research: {
                keywords: ['research', 'publications', 'papers', 'publication', 'paper', 'journal', 'conference', 'springer', 'published'],
                type: 'dynamic',
                sectionId: 'resume-section',
                extractStrategy: 'research'
            },
            education: {
                keywords: ['education', 'study', 'degree', 'university', 'college', 'school', 'academic'],
                type: 'dynamic',
                sectionId: 'resume-section',
                extractStrategy: 'education'
            },
            projects: {
                keywords: ['projects', 'portfolio', 'work samples', 'what have you built', 'showcase', 'demos', 'apps'],
                type: 'dynamic',
                sectionId: 'project-section'
            },
            domain: {
                keywords: ['domain', 'domains', 'domain work', 'domain works', 'specialization', 'focus area', 'expertise area', 'field', 'fields'],
                type: 'dynamic',
                sectionId: 'domain-work'
            },
            location: {
                keywords: ['location', 'where', 'live', 'city', 'country', 'place', 'based'],
                type: 'static',
                sectionId: null
            },
            github: {
                keywords: ['github', 'git', 'github link', 'repository', 'repositories', 'code repository'],
                type: 'dynamic',
                sectionId: 'contact-section',
                extractStrategy: 'github'
            },
            certification: {
                keywords: ['certification', 'certificates', 'credentials', 'qualifications', 'courses'],
                type: 'dynamic',
                sectionId: 'Certification'
            },
            contact: {
                keywords: ['contact', 'email', 'reach', 'get in touch', 'connect', 'linkedin', 'social', 'github'],
                type: 'dynamic',
                sectionId: 'contact-section'
            },
            help: {
                keywords: ['help', 'what can you do', 'commands', 'options', 'guide'],
                type: 'static',
                sectionId: null
            }
        };

        // Static responses
        this.staticResponses = {
            greeting: [
                "Hi there! 👋 I'm Monisha's AI assistant. I can tell you about her skills, experience, projects, and more. What would you like to know?",
                "Hello! 😊 I'm here to help you learn about Monisha's background and expertise. Feel free to ask me anything!",
                "Hey! 🌟 Welcome! I can share information about Monisha's skills, projects, experience, and how to get in touch. What interests you?"
            ],
            help: `<strong>Here's what I can help you with:</strong><br><br>
                💡 <strong>Skills & Technologies</strong> - Ask about technical expertise<br>
                💼 <strong>Experience</strong> - Learn about work history<br>
                🎓 <strong>Education</strong> - Academic background<br>
                🚀 <strong>Projects</strong> - Portfolio and completed work<br>
                🏆 <strong>Certifications</strong> - Professional credentials<br>
                🌐 <strong>Domain Work</strong> - Areas of specialization<br>
                📧 <strong>Contact</strong> - Get in touch<br><br>
                Just type your question naturally, and I'll help you out!`,
            fallback: [
                "I'm not sure I understood that. You can ask me about skills, projects, experience, education, certifications, or contact information.",
                "Hmm, I didn't quite catch that. Try asking about Monisha's background, expertise, projects, or how to reach out!",
                "I'm here to help! You can ask me about skills, work experience, projects, education, or contact details. What would you like to know?"
            ],
            location: "📍 Monisha is based in <strong>Dhaka, Bangladesh</strong>. She's available for remote work and collaborations worldwide!"
        };
    }

    getRandomResponse(type) {
        const responses = this.staticResponses[type];
        if (Array.isArray(responses)) {
            return responses[Math.floor(Math.random() * responses.length)];
        }
        return responses;
    }
}

// ============================================
// LAYER 2: INTENT DETECTION
// ============================================

class IntentDetector {
    constructor(knowledgeBase) {
        this.kb = knowledgeBase;
    }

    /**
     * Normalize user input for better matching
     */
    normalizeInput(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[?!.,;:]/g, '') // Remove punctuation
            .replace(/\s+/g, ' '); // Normalize whitespace
    }

    /**
     * Detect intent from user input using keyword matching
     * Returns the best matching intent based on keyword overlap
     */
    detectIntent(userInput) {
        const normalized = this.normalizeInput(userInput);
        let bestMatch = null;
        let highestScore = 0;

        // Score each intent based on keyword matches
        for (const [intentName, intentData] of Object.entries(this.kb.intentMap)) {
            let score = 0;

            for (const keyword of intentData.keywords) {
                const normalizedKeyword = keyword.toLowerCase();

                // Exact phrase match (highest priority)
                if (normalized.includes(normalizedKeyword)) {
                    score += normalizedKeyword.split(' ').length * 10;
                }

                // Individual word matches
                const keywordWords = normalizedKeyword.split(' ');
                const inputWords = normalized.split(' ');

                for (const kw of keywordWords) {
                    if (inputWords.includes(kw) && kw.length > 2) {
                        score += 5;
                    }
                }
            }

            if (score > highestScore) {
                highestScore = score;
                bestMatch = {
                    intent: intentName,
                    confidence: score,
                    data: intentData
                };
            }
        }

        // Return best match or unknown
        if (highestScore > 0) {
            return bestMatch;
        }

        return {
            intent: 'unknown',
            confidence: 0,
            data: null
        };
    }
}

// ============================================
// LAYER 3: RESPONSE GENERATION
// ============================================

class ResponseGenerator {
    constructor(knowledgeBase) {
        this.kb = knowledgeBase;
    }

    /**
     * Generate response based on detected intent
     */
    generateResponse(intentResult) {
        const { intent, data } = intentResult;

        // Handle static responses
        if (data && data.type === 'static') {
            return {
                text: this.kb.getRandomResponse(intent),
                sectionId: null,
                shouldScroll: false
            };
        }

        // Handle unknown intent
        if (intent === 'unknown') {
            return {
                text: this.kb.getRandomResponse('fallback'),
                sectionId: null,
                shouldScroll: false
            };
        }

        // Handle dynamic content extraction
        if (data && data.sectionId) {
            const content = this.extractSectionContent(data.sectionId, data.extractStrategy);
            return {
                text: content,
                sectionId: data.sectionId,
                shouldScroll: true
            };
        }

        // Fallback
        return {
            text: this.kb.getRandomResponse('fallback'),
            sectionId: null,
            shouldScroll: false
        };
    }

    /**
     * Extract content from a DOM section
     */
    extractSectionContent(sectionId, strategy = null) {
        const section = document.getElementById(sectionId);

        if (!section) {
            return "I couldn't find that information right now. Please check the portfolio directly.";
        }

        // Apply specific extraction strategies
        const strategies = {
            'skills': () => this.extractSkills(section),
            'experience': () => this.extractExperience(section),
            'education': () => this.extractEducation(section),
            'research': () => this.extractResearch(section),
            'github': () => this.extractGithub(section)
        };

        if (strategy && strategies[strategy]) {
            return strategies[strategy]();
        }

        // Default extraction
        return this.extractDefault(section, sectionId);
    }

    /**
     * Extract skills specifically
     */
    extractSkills(section) {
        const skillElements = section.querySelectorAll('.skill-mf span:not(.pull-right):not(.title-s)');

        if (skillElements.length > 0) {
            const skills = Array.from(skillElements)
                .map(el => el.textContent.trim())
                .filter(skill => skill && skill !== 'Skills' && skill !== 'Frameworks -- Python and Generative AI');

            if (skills.length > 0) {
                return `<strong>💡 Monisha's Technical Skills:</strong><br><br>
                    ${skills.slice(0, 15).map(s => `• <strong>${s}</strong>`).join('<br>')}<br><br>
                    <em>Check out the Projects section to see these skills in action!</em>`;
            }
        }

        return this.extractDefault(section, 'about-section');
    }

    /**
     * Extract work experience
     */
    extractExperience(section) {
        const experienceBlocks = section.querySelectorAll('.resume-wrap');
        let expHTML = '<strong>💼 Work Experience:</strong><br><br>';
        let count = 0;

        experienceBlocks.forEach(block => {
            const position = block.querySelector('.position');
            const date = block.querySelector('.date');
            const company = block.querySelector('h3 a');

            if (position && date && count < 3) { // Limit to 3 most recent
                count++;
                expHTML += `<strong>${count}. ${position.textContent}</strong><br>`;
                if (company) expHTML += `📍 ${company.textContent}<br>`;
                expHTML += `📅 ${date.textContent}<br><br>`;
            }
        });

        if (count === 0) {
            return this.extractDefault(section, 'resume-section');
        }

        return expHTML + '<em>Scroll down to the Resume section for complete details.</em>';
    }

    /**
     * Extract education information
     */
    extractEducation(section) {
        const educationBlocks = section.querySelectorAll('.resume-wrap');
        let eduHTML = '<strong>🎓 Education:</strong><br><br>';
        let found = false;

        educationBlocks.forEach(block => {
            const heading = block.querySelector('h3');
            const institution = block.querySelector('.position');
            const result = block.querySelector('p');

            if (heading && (heading.textContent.includes('Science') || heading.textContent.includes('HSC') || heading.textContent.includes('SSC'))) {
                found = true;
                eduHTML += `• <strong>${heading.textContent}</strong><br>`;
                if (institution) eduHTML += `&nbsp;&nbsp;🏫 ${institution.textContent}<br>`;
                if (result && result.textContent.includes('GPA')) {
                    eduHTML += `&nbsp;&nbsp;🏆 ${result.textContent}<br>`;
                }
                eduHTML += '<br>';
            }
        });

        if (!found) {
            return "Monisha completed her BSc (Hons) from IIT, Jahangirnagar University with a CGPA of 3.47.";
        }

        return eduHTML;
    }

    /**
     * Extract research and publications
     */
    extractResearch(section) {
        let researchHTML = '<strong>🔬 Research & Publications:</strong><br><br>';

        // Look for research-related content in resume section
        const allBlocks = section.querySelectorAll('.resume-wrap');
        let found = false;

        allBlocks.forEach(block => {
            const heading = block.querySelector('h2, h3');
            if (heading && (heading.textContent.includes('Research') || heading.textContent.includes('Mentorship'))) {
                found = true;
                const description = block.querySelector('p');
                if (description) {
                    researchHTML += description.textContent.substring(0, 300) + '...<br><br>';
                }
            }
        });

        if (!found) {
            researchHTML = '<strong>🔬 Research Work:</strong><br><br>';
            researchHTML += 'Monisha has experience in research work including:<br><br>';
            researchHTML += '• Comparative analysis of LLM models<br>';
            researchHTML += '• Transformer Architecture research<br>';
            researchHTML += '• Applied AI projects and experimental model development<br><br>';
            researchHTML += '<em>Check the Resume section for complete research details.</em>';
        }

        return researchHTML;
    }

    /**
     * Extract GitHub link from contact section
     */
    extractGithub(section) {
        // Look for GitHub links in the contact section
        const links = section.querySelectorAll('a[href*="github.com"]');

        if (links.length > 0) {
            const githubUrl = links[0].href;
            return `<strong>💻 GitHub Profile:</strong><br><br>
                <a href="${githubUrl}" target="_blank" style="color:#b4aea2; text-decoration:underline;">
                    ${githubUrl}
                </a><br><br>
                <em>Check out Monisha's repositories and code samples!</em>`;
        }

        // Fallback if GitHub link not found
        return '<strong>💻 GitHub:</strong><br><br>Visit Monisha\'s GitHub profile to see code samples and projects. You can find the link in the Contact section below.';
    }

    /**
     * Default content extraction
     */
    extractDefault(section, sectionId) {
        const text = section.innerText.trim();

        // Limit response length for better UX
        if (text.length > 600) {
            const preview = text.substring(0, 500) + '...';
            return `${this.formatContent(preview)}<br><br>
                <em>This is a preview. Scroll down to the ${this.getSectionName(sectionId)} section for complete details.</em>`;
        }

        return this.formatContent(text.substring(0, 800));
    }

    /**
     * Format content for display
     */
    formatContent(text) {
        return text
            .replace(/\n{3,}/g, '\n\n')
            .replace(/\n/g, '<br>');
    }

    /**
     * Get human-readable section name
     */
    getSectionName(sectionId) {
        const names = {
            'about-section': 'About',
            'resume-section': 'Resume',
            'project-section': 'Projects',
            'domain-work': 'Domain Work',
            'Certification': 'Certification',
            'contact-section': 'Contact'
        };
        return names[sectionId] || 'relevant';
    }
}

// ============================================
// LAYER 4: UI RENDERING
// ============================================

class ChatUI {
    constructor() {
        this.elements = {
            container: document.getElementById('chat-container'),
            messages: document.getElementById('chat-messages'),
            input: document.getElementById('chat-input'),
            send: document.getElementById('chat-send'),
            fab: document.getElementById('chat-fab'),
            close: document.getElementById('chat-close'),
            suggestionChips: document.querySelectorAll('.suggestion-chip')
        };

        this.isOpen = false;
        this.isTyping = false;
    }

    /**
     * Initialize event listeners
     */
    init() {
        // FAB click to open chat
        this.elements.fab?.addEventListener('click', () => this.toggleChat());

        // Close button
        this.elements.close?.addEventListener('click', () => this.toggleChat());

        // Send button
        this.elements.send?.addEventListener('click', () => this.handleSend());

        // Enter key to send
        this.elements.input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });

        // Suggestion chips
        this.elements.suggestionChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const query = chip.getAttribute('data-query');
                this.elements.input.value = query;
                this.handleSend();
            });
        });

        // Show welcome message
        this.showWelcomeMessage();
    }

    /**
     * Toggle chat visibility
     */
    toggleChat() {
        this.isOpen = !this.isOpen;

        if (this.isOpen) {
            this.elements.container.classList.add('active');
            this.elements.fab.style.display = 'none';
            this.elements.input.focus();
        } else {
            this.elements.container.classList.remove('active');
            this.elements.fab.style.display = 'flex';
        }
    }

    /**
     * Show welcome message
     */
    showWelcomeMessage() {
        const welcomeMsg = "Hi! 👋 I'm Monisha's AI assistant. I can help you learn about her skills, experience, projects, and more. What would you like to know?";
        this.addBotMessage(welcomeMsg, false);
    }

    /**
     * Handle send action
     */
    handleSend() {
        const message = this.elements.input.value.trim();

        if (!message || this.isTyping) return;

        // Add user message
        this.addUserMessage(message);

        // Clear input
        this.elements.input.value = '';

        // Process message
        if (window.portfolioChatbot) {
            window.portfolioChatbot.processMessage(message);
        }
    }

    /**
     * Add user message to chat
     */
    addUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user';
        messageDiv.textContent = text;

        this.elements.messages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    /**
     * Add bot message with typing animation
     */
    addBotMessage(text, withTyping = true) {
        if (withTyping) {
            this.showTypingIndicator();

            setTimeout(() => {
                this.hideTypingIndicator();
                this.renderBotMessage(text);
            }, 800 + Math.random() * 400);
        } else {
            this.renderBotMessage(text);
        }
    }

    /**
     * Render bot message
     */
    renderBotMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        messageDiv.innerHTML = text;

        this.elements.messages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        this.isTyping = true;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;

        this.elements.messages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        this.isTyping = false;
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    /**
     * Scroll chat to bottom
     */
    scrollToBottom() {
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }

    /**
     * Smooth scroll to section
     */
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// ============================================
// MAIN CHATBOT CONTROLLER
// ============================================

class PortfolioChatbot {
    constructor() {
        this.kb = new KnowledgeBase();
        this.intentDetector = new IntentDetector(this.kb);
        this.responseGenerator = new ResponseGenerator(this.kb);
        this.ui = new ChatUI();
    }

    /**
     * Initialize the chatbot
     */
    init() {
        this.ui.init();
        console.log('✅ Portfolio Chatbot initialized successfully!');
        console.log('📚 Architecture: 4-Layer (Knowledge Base → Intent Detection → Response Generation → UI Rendering)');
    }

    /**
     * Process user message
     */
    processMessage(message) {
        // 1. Detect intent
        const intentResult = this.intentDetector.detectIntent(message);
        console.log('🎯 Detected Intent:', intentResult.intent, 'Confidence:', intentResult.confidence);

        // 2. Generate response
        const response = this.responseGenerator.generateResponse(intentResult);

        // 3. Display response
        this.ui.addBotMessage(response.text);

        // 4. Optionally scroll to section
        if (response.shouldScroll && response.sectionId) {
            setTimeout(() => {
                this.ui.scrollToSection(response.sectionId);
            }, 1500);
        }
    }
}

// ============================================
// INITIALIZATION
// ============================================

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioChatbot = new PortfolioChatbot();
    window.portfolioChatbot.init();
});
