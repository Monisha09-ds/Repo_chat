/**
 * ============================================
 * PORTFOLIO CHATBOT - HYBRID VERSION
 * ============================================
 * 
 * Combines the best features from both versions:
 * - Clean 4-layer architecture (from refactored)
 * - Conversation tracking (from original)
 * - Character-by-character typing (from original)
 * - Fuzzy matching (from original)
 * - Clickable links for research, GitHub, resume, portfolios
 * - Dynamic follow-up chips
 */

// ============================================
// CONVERSATION MANAGER
// ============================================

class ConversationManager {
    constructor() {
        this.history = []; // Stores conversation turns
        this.context = {
            currentTopic: null,
            lastEntity: null,
            awaitingFollowUp: false,
            lastResponse: null
        };
    }

    addTurn(role, content, intent = null) {
        this.history.push({ role, content, intent, timestamp: Date.now() });
        if (this.history.length > 10) this.history.shift();

        if (intent && role === 'bot') {
            this.context.currentTopic = intent;
        }
    }

    getLastUserMessage() {
        const userTurns = this.history.filter(t => t.role === 'user');
        return userTurns.length > 0 ? userTurns[userTurns.length - 1] : null;
    }

    getContext() {
        return this.context;
    }

    updateContext(key, value) {
        this.context[key] = value;
    }
}

// ============================================
// LAYER 1: KNOWLEDGE BASE
// ============================================

class KnowledgeBase {
    constructor() {
        // Intent to section mapping
        this.intentMap = {
            greeting: {
                keywords: ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'start', 'sup', 'yo'],
                type: 'static',
                sectionId: null
            },
            gratitude: {
                keywords: ['thanks', 'thank', 'cool', 'awesome', 'good job', 'great', 'appreciate', 'helpful'],
                type: 'static',
                sectionId: null
            },
            farewell: {
                keywords: ['bye', 'goodbye', 'see you', 'see ya', 'later', 'exit', 'close', 'quit'],
                type: 'static',
                sectionId: null
            },
            currentWorkplace: {
                keywords: ['current workplace', 'current work', 'current job', 'where does she work', 'where is she working', 'present job', 'current position', 'current company'],
                type: 'dynamic',
                sectionId: 'resume-section',
                extractStrategy: 'currentWorkplace'
            },
            joke: {
                keywords: ['joke', 'funny', 'make me laugh', 'tell me a joke', 'humor', 'something funny'],
                type: 'static',
                sectionId: null
            },
            time: {
                keywords: ['time', 'what time', 'current time', 'clock', 'what\'s the time'],
                type: 'static',
                sectionId: null
            },
            weather: {
                keywords: ['weather', 'temperature', 'forecast', 'raining', 'sunny', 'climate'],
                type: 'static',
                sectionId: null
            },
            creator: {
                keywords: ['who made you', 'who created you', 'who built you', 'your creator', 'who are you', 'what are you'],
                type: 'static',
                sectionId: null
            },
            capabilities: {
                keywords: ['what can you do', 'your capabilities', 'what do you know', 'can you help', 'how can you help'],
                type: 'static',
                sectionId: null
            },
            about: {
                keywords: ['about', 'about monisha', 'tell me about', 'background', 'bio', 'introduction', 'yourself'],
                type: 'dynamic',
                sectionId: 'about-section'
            },
            skills: {
                keywords: ['skills', 'technologies', 'tech stack', 'what can you do', 'expertise', 'competencies', 'frameworks', 'tools', 'programming', 'go', 'golang', 'n8n', 'mcp', 'redis', 'celery', 'litellm', 'crewai'],
                type: 'dynamic',
                sectionId: 'technical-section',
                extractStrategy: 'skills'
            },
            experience: {
                keywords: ['experience', 'work', 'job', 'career', 'employment', 'history', 'current work', 'workplace', 'years of experience'],
                type: 'dynamic',
                sectionId: 'resume-section',
                extractStrategy: 'experience'
            },
            research: {
                keywords: ['research', 'publications', 'papers', 'publication', 'paper', 'journal', 'conference', 'springer', 'published', 'research experience'],
                type: 'dynamic',
                sectionId: 'section-counter',
                extractStrategy: 'research'
            },
            achievements: {
                keywords: ['achievements', 'achievement', 'awards', 'award', 'winner', 'competition', 'innovation', 'showcase', 'recognition', 'honor', 'prize'],
                type: 'dynamic',
                sectionId: 'section-counter',
                extractStrategy: 'achievements'
            },
            education: {
                keywords: ['education', 'study', 'degree', 'university', 'college', 'school', 'academic'],
                type: 'dynamic',
                sectionId: 'resume-section',
                extractStrategy: 'education'
            },
            currentProject: {
                keywords: ['current project', 'current projects', 'what are you working on', 'recent work', 'recent project', 'latest work', 'active work', 'golang', 'n8n', 'mcp', 'deep agents', 'litellm', 'claude code'],
                type: 'static',
                sectionId: null
            },
            projects: {
                keywords: ['projects', 'portfolio', 'work samples', 'what have you built', 'showcase', 'demos', 'apps', 'completed projects'],
                type: 'dynamic',
                sectionId: 'project-section',
                extractStrategy: 'projects'
            },
            domain: {
                keywords: ['domain', 'domains', 'domain work', 'domain works', 'specialization', 'focus area', 'expertise area', 'field', 'fields'],
                type: 'dynamic',
                sectionId: 'domain-work'
            },
            certification: {
                keywords: ['certification', 'certificates', 'credentials', 'qualifications', 'courses'],
                type: 'dynamic',
                sectionId: 'Certification',
                extractStrategy: 'certifications'
            },
            contact: {
                keywords: ['contact', 'email', 'reach', 'get in touch', 'connect', 'linkedin', 'social'],
                type: 'dynamic',
                sectionId: 'contact-section',
                extractStrategy: 'contact'
            },
            github: {
                keywords: ['github', 'git', 'github link', 'repository', 'repositories', 'code repository', 'github profile'],
                type: 'dynamic',
                sectionId: 'domain-work',
                extractStrategy: 'github'
            },
            resumeDownload: {
                keywords: ['resume download', 'cv download', 'download resume', 'download cv', 'pdf', 'resume', 'cv', 'download'],
                type: 'dynamic',
                sectionId: 'home-section',
                extractStrategy: 'resumeDownload'
            },
            careerObjective: {
                keywords: ['career objective', 'objective', 'career goal', 'goal', 'aspiration', 'ambition', 'mission', 'vision', 'what does she want', 'career plan'],
                type: 'dynamic',
                sectionId: 'career-section',
                extractStrategy: 'careerObjective'
            },
            location: {
                keywords: ['location', 'where', 'live', 'city', 'country', 'place', 'based'],
                type: 'static',
                sectionId: null
            },
            help: {
                keywords: ['help', 'commands', 'options', 'guide'],
                type: 'static',
                sectionId: null
            }
        };

        // Static responses
        this.staticResponses = {
            greeting: this.getTimeBasedGreeting(),
            gratitude: [
                "You're welcome! 😊 Anything else you'd like to know about Monisha?",
                "Happy to help! Feel free to ask more questions about her work or background.",
                "Glad I could help! What else would you like to explore?"
            ],
            farewell: [
                "Goodbye! 👋 Feel free to come back anytime if you have more questions!",
                "See you later! Don't hesitate to reach out if you need anything else.",
                "Take care! Come back soon if you want to learn more about Monisha! 😊"
            ],
            currentProject: `⚡ <b>Monisha's Active Focus Areas:</b><br><br>
                1. <b>Scalable System Architecture & Backend Optimization</b><br>
                Refactoring monolith systems to microservices with <i>Go (Golang)</i>, Redis caching, and Celery task queues.<br><br>
                2. <b>Autonomous Multi-Agent Systems & Production RAG</b><br>
                Building multi-agent networks with <i>CrewAI / Deep Agents</i>, LiteLLM Gateway for token management, and LLM evaluation pipelines.<br><br>
                3. <b>Workflow Automation & Tool Interoperability</b><br>
                Engineering <i>n8n</i> ETL pipelines and custom <i>MCP servers</i> using Claude Code for LLM-environment integration.<br><br>
                <i>Ask about "completed projects" to see her finished work!</i>`,
            resumeDownload: `📄 <b>Download Monisha's Resume:</b><br><br>
                <a href="https://drive.google.com/file/d/1bDMGBARC3MTMIxhA3tY18BAPL4ItNOoG/view?usp=drive_link" target="_blank" style="color:#b4aea2; text-decoration:underline;">📥 Updated Resume (Google Drive)</a><br><br>
                <a href="https://drive.google.com/drive/folders/17nutttyZG71Ah-8JYREmNeAULDtokPdK?usp=drive_link" target="_blank" style="color:#b4aea2; text-decoration:underline;">📁 Full CV Folder</a>`,
            location: "📍 Monisha is based in <strong>Dhaka, Bangladesh</strong>. She's available for remote work and collaborations worldwide!",
            help: `<strong>Here's what I can help you with:</strong><br><br>
                💡 <strong>Skills & Technologies</strong> - Ask about technical expertise<br>
                💼 <strong>Experience</strong> - Learn about work history<br>
                🎓 <strong>Education</strong> - Academic background<br>
                🚀 <strong>Projects</strong> - Portfolio and completed work<br>
                🔬 <strong>Research</strong> - Publications and papers<br>
                🏆 <strong>Certifications</strong> - Professional credentials<br>
                🌐 <strong>Domain Work</strong> - Areas of specialization<br>
                📧 <strong>Contact</strong> - Get in touch<br>
                💻 <strong>GitHub</strong> - Code repositories<br>
                📄 <strong>Resume</strong> - Download CV<br><br>
                Just type your question naturally, and I'll help you out!`,

            // General conversational responses
            joke: [
                "😄 Why do programmers prefer dark mode? Because light attracts bugs! 🐛<br><br>Now, would you like to know about Monisha's debugging skills? Ask me about her projects!",
                "🤓 Why did the developer go broke? Because he used up all his cache! 💸<br><br>Speaking of which, want to see Monisha's impressive project portfolio?",
                "😂 How many programmers does it take to change a light bulb? None, that's a hardware problem! 💡<br><br>But Monisha can solve your software problems! Check out her skills!"
            ],
            time: [
                "⏰ I don't have access to real-time data, but I can tell you about Monisha's <strong>timely delivery</strong> of projects! Want to see her work?",
                "🕐 Time flies when you're coding! Speaking of which, Monisha has years of experience in AI and ML. Want to learn more?"
            ],
            weather: [
                "🌤️ I can't check the weather, but I can tell you about Monisha's <strong>sunny disposition</strong> and excellent teamwork! Want to know more about her experience?",
                "☀️ No weather forecast here, but I can forecast that Monisha would be a great addition to your team! Check out her skills and projects!"
            ],
            creator: [
                "🤖 I was created to help you learn about <strong>Monisha</strong>, a talented AI/ML engineer! I'm powered by JavaScript and built with care.<br><br>What would you like to know about her?",
                "💻 I'm Monisha's AI assistant, built to showcase her amazing skills and experience. Think of me as a digital portfolio guide! What interests you?"
            ],
            capabilities: [
                "🎯 I'm specialized in telling you all about <strong>Monisha's professional background</strong>! I can share details about her:<br><br>• Technical skills & expertise<br>• Work experience & projects<br>• Education & certifications<br>• Research work<br>• Contact information<br><br>What would you like to explore?",
                "✨ I'm here to be your guide to Monisha's portfolio! I can answer questions about her skills, projects, experience, and more. I'm like a knowledgeable friend who knows everything about her professional journey! 😊"
            ],

            // Smooth fallbacks
            fallback: [
                "That's an interesting question! 🤔 While I'm specifically designed to help with information about <strong>Monisha's professional background</strong>, I'd love to tell you about her skills, projects, or experience instead. What interests you?",
                "I appreciate your curiosity! 😊 I'm focused on sharing Monisha's professional story - her skills, projects, research, and achievements. What aspect would you like to explore?",
                "Great question! While that's outside my expertise, I'm really good at talking about <strong>Monisha's work in AI/ML</strong>! Want to hear about her impressive projects or technical skills?",
                "Hmm, I'm not sure about that one! 🤷 But I <em>do</em> know a lot about Monisha's background in AI, machine learning, and data engineering. Shall we talk about that instead?"
            ],
            general: [
                "That's a good question! While I'm specifically designed to showcase <strong>Monisha's portfolio</strong>, I'm happy to chat! Is there anything about her work, skills, or experience you'd like to know?",
                "Interesting! 😊 I'm Monisha's AI assistant, so I'm best at discussing her professional background. But I'm here to help! What would you like to learn about her?"
            ]
        };

        // Follow-up chips mapping
        this.followUpChips = {
            greeting: ['Skills', 'Projects', 'Resume'],
            gratitude: ['Projects', 'Contact'],
            farewell: ['Come Back Soon!'],
            joke: ['Projects', 'Skills'],
            time: ['Experience', 'Projects'],
            weather: ['Skills', 'Contact'],
            creator: ['About Monisha', 'Skills'],
            capabilities: ['Skills', 'Projects', 'Experience'],
            currentWorkplace: ['Experience', 'Projects', 'Skills'],
            skills: ['Projects', 'Certifications', 'Experience'],
            currentProject: ['Skills', 'Projects', 'Contact'],
            projects: ['Skills', 'Contact'],
            experience: ['Projects', 'Education'],
            research: ['Achievements', 'Projects'],
            achievements: ['Research', 'Projects'],
            education: ['Experience', 'Skills'],
            contact: ['Projects', 'Resume'],
            github: ['Projects', 'Contact'],
            resumeDownload: ['Experience', 'Projects'],
            careerObjective: ['Skills', 'Projects'],
            certifications: ['Skills', 'Projects'],
            domain: ['Projects', 'Skills'],
            help: ['Skills', 'Projects', 'Contact']
        };
    }

    /**
     * Get time-based greeting
     */
    getTimeBasedGreeting() {
        const hour = new Date().getHours();
        let timeGreeting = '';

        if (hour >= 5 && hour < 12) {
            timeGreeting = 'Good morning! ☀️';
        } else if (hour >= 12 && hour < 17) {
            timeGreeting = 'Good afternoon! 🌤️';
        } else if (hour >= 17 && hour < 22) {
            timeGreeting = 'Good evening! 🌆';
        } else {
            timeGreeting = 'Hello! 🌙';
        }

        return [
            `${timeGreeting} I'm <b>Monisha's AI assistant</b>. I can tell you about her skills, experience, projects, research, and more. What would you like to know?`,
            `${timeGreeting} I'm here to help you learn about Monisha's background and expertise. Feel free to ask me anything!`,
            `${timeGreeting} Welcome! I can share information about Monisha's skills, projects, experience, and how to get in touch. What interests you?`
        ];
    }

    getRandomResponse(type) {
        const responses = this.staticResponses[type];
        if (Array.isArray(responses)) {
            return responses[Math.floor(Math.random() * responses.length)];
        }
        return responses;
    }

    getFollowUpChips(intent) {
        return this.followUpChips[intent] || [];
    }
}

// ============================================
// LAYER 2: INTENT DETECTION (with Fuzzy Matching)
// ============================================

class IntentDetector {
    constructor(knowledgeBase) {
        this.kb = knowledgeBase;
        // Synonyms mapping for robust parsing
        this.synonyms = {
            'cv': ['resume', 'cv', 'biodata', 'profile', 'history'],
            'resume': ['resume', 'cv', 'biodata', 'profile', 'history'],
            'experience': ['experience', 'work', 'job', 'career', 'employment', 'history', 'role', 'roles', 'workplace'],
            'work': ['experience', 'work', 'job', 'career', 'employment', 'history', 'role', 'roles', 'workplace'],
            'skills': ['skills', 'technologies', 'tech stack', 'expertise', 'competencies', 'frameworks', 'tools', 'programming'],
            'projects': ['projects', 'portfolio', 'work samples', 'built', 'demos', 'apps', 'system', 'systems'],
            'contact': ['contact', 'email', 'reach', 'connect', 'linkedin', 'social', 'address', 'mail', 'phone', 'number']
        };
    }

    normalizeInput(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[?!.,;:]/g, '')
            .replace(/\s+/g, ' ');
    }

    /**
     * Levenshtein Distance for fuzzy matching
     */
    getLevenshteinDistance(a, b) {
        const matrix = [];

        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[b.length][a.length];
    }

    /**
     * Detect intent with fuzzy matching support
     */
    detectIntent(userInput) {
        const normalized = this.normalizeInput(userInput);
        const inputWords = normalized.split(' ');
        let bestMatch = null;
        let highestScore = 0;

        for (const [intentName, intentData] of Object.entries(this.kb.intentMap)) {
            let score = 0;

            for (const keyword of intentData.keywords) {
                const normalizedKeyword = keyword.toLowerCase();

                // 1. Exact phrase match (highest priority)
                if (normalized.includes(normalizedKeyword)) {
                    score += normalizedKeyword.split(' ').length * 15;
                }

                // 2. Token overlap and synonym matching
                const keywordWords = normalizedKeyword.split(' ');
                for (const kw of keywordWords) {
                    if (kw.length <= 2) continue;

                    // Fetch synonyms if any
                    const kwSyns = this.synonyms[kw] || [kw];

                    for (const inputWord of inputWords) {
                        if (inputWord.length <= 2) continue;

                        if (inputWord === kw || kwSyns.includes(inputWord)) {
                            score += 8;
                        } else {
                            // Fuzzy matching for typos
                            const distance = this.getLevenshteinDistance(inputWord, kw);
                            if (distance <= 1 && kw.length > 3) {
                                score += 4; // Partial credit for close matches
                            }
                        }
                    }
                }
            }

            // Jaccard similarity-like overlap boost
            const kwSet = new Set(intentData.keywords.flatMap(k => k.toLowerCase().split(' ')));
            const inputSet = new Set(inputWords);
            const intersection = new Set([...kwSet].filter(x => inputSet.has(x)));
            if (intersection.size > 0) {
                const jaccard = intersection.size / (kwSet.size + inputSet.size - intersection.size);
                score += jaccard * 10;
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

        if (highestScore > 5) { // Minimum confidence threshold to filter noise
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
// LAYER 3: RESPONSE GENERATION (with Clickable Links)
// ============================================

class ResponseGenerator {
    constructor(knowledgeBase) {
        this.kb = knowledgeBase;
    }

    generateResponse(intentResult, message = '') {
        const { intent, data } = intentResult;

        // If intent is projects or unknown, scan for specific project keywords in user message
        if ((intent === 'projects' || intent === 'unknown') && message) {
            const matchingCard = this.findMatchingProjectCard(message);
            if (matchingCard) {
                const details = this.extractProjectDetails(matchingCard);
                if (details) {
                    return {
                        text: details,
                        sectionId: 'project-section',
                        shouldScroll: true,
                        followUpChips: ['Skills', 'Contact', 'Projects']
                    };
                }
            }
        }

        // Handle static responses
        if (data && data.type === 'static') {
            return {
                text: this.kb.getRandomResponse(intent),
                sectionId: null,
                shouldScroll: false,
                followUpChips: this.kb.getFollowUpChips(intent)
            };
        }

        // Handle unknown intent
        if (intent === 'unknown') {
            return {
                text: this.kb.getRandomResponse('fallback'),
                sectionId: null,
                shouldScroll: false,
                followUpChips: ['Skills', 'Projects', 'Contact']
            };
        }

        // Handle dynamic content extraction
        if (data && data.sectionId) {
            const content = this.extractSectionContent(data.sectionId, data.extractStrategy);
            return {
                text: content,
                sectionId: data.sectionId,
                shouldScroll: true,
                followUpChips: this.kb.getFollowUpChips(intent)
            };
        }

        // Fallback
        return {
            text: this.kb.getRandomResponse('fallback'),
            sectionId: null,
            shouldScroll: false,
            followUpChips: []
        };
    }

    extractSectionContent(sectionId, strategy = null) {
        const section = document.getElementById(sectionId);

        if (!section) {
            return "I couldn't find that information right now. Please check the portfolio directly.";
        }

        const strategies = {
            'skills': () => this.extractSkills(section),
            'experience': () => this.extractExperience(section),
            'education': () => this.extractEducation(section),
            'research': () => this.extractResearch(section),
            'achievements': () => this.extractAchievements(section),
            'projects': () => this.extractProjects(section),
            'currentProject': () => this.extractCurrentProject(section),
            'certifications': () => this.extractCertifications(section),
            'github': () => this.extractGithub(section),
            'contact': () => this.extractContact(section),
            'currentWorkplace': () => this.extractCurrentWorkplace(section),
            'resumeDownload': () => this.extractResumeDownload(section),
            'careerObjective': () => this.extractCareerObjective(section)
        };

        if (strategy && strategies[strategy]) {
            return strategies[strategy]();
        }

        return this.extractDefault(section, sectionId);
    }

    /* Date Parsing Utilities for Dynamic Experience Calculator */
    parseSingleDate(dateStr) {
        dateStr = dateStr.trim().toLowerCase();
        if (dateStr === 'present' || dateStr.includes('present')) {
            return new Date();
        }
        
        const months = {
            jan: 0, january: 0,
            feb: 1, february: 1,
            mar: 2, march: 2,
            apr: 3, april: 3,
            may: 4,
            jun: 5, june: 5,
            jul: 6, july: 6,
            aug: 7, august: 7,
            sep: 8, september: 8, sept: 8,
            oct: 9, october: 9,
            nov: 10, november: 10,
            dec: 11, december: 11
        };

        const yearMatch = dateStr.match(/\b(20\d{2}|19\d{2})\b/);
        const year = yearMatch ? parseInt(yearMatch[0], 10) : new Date().getFullYear();

        let month = 0;
        for (const [mName, mVal] of Object.entries(months)) {
            if (dateStr.includes(mName)) {
                month = mVal;
                break;
            }
        }

        return new Date(year, month, 1);
    }

    calculateTotalExperience(section) {
        const wraps = section.querySelectorAll('.resume-wrap');
        const intervals = [];

        wraps.forEach(wrap => {
            const dateEl = wrap.querySelector('.date');
            const text = wrap.textContent.toLowerCase();
            // Exclude education wraps
            if (dateEl && !text.includes('bachelor') && !text.includes('hsc') && !text.includes('ssc') && !text.includes('school') && !text.includes('college')) {
                const dateText = dateEl.textContent.trim();
                const parts = dateText.split(/[-–—]/);
                if (parts.length >= 2) {
                    const start = this.parseSingleDate(parts[0]);
                    const end = this.parseSingleDate(parts[1]);
                    intervals.push({ start, end });
                }
            }
        });

        if (intervals.length === 0) return 0;

        // Sort by start date
        intervals.sort((a, b) => a.start - b.start);

        // Merge intervals (union)
        const merged = [intervals[0]];
        for (let i = 1; i < intervals.length; i++) {
            const last = merged[merged.length - 1];
            const curr = intervals[i];
            if (curr.start <= last.end) {
                last.end = new Date(Math.max(last.end, curr.end));
            } else {
                merged.push(curr);
            }
        }

        // Sum non-overlapping duration
        let totalMonths = 0;
        merged.forEach(interval => {
            const yearDiff = interval.end.getFullYear() - interval.start.getFullYear();
            const monthDiff = interval.end.getMonth() - interval.start.getMonth();
            totalMonths += yearDiff * 12 + monthDiff + 1; // inclusive of start month
        });

        return totalMonths;
    }

    /* Dynamic Project Detailer Helpers */
    findMatchingProjectCard(message) {
        const completedCards = document.querySelectorAll('.completed-project-card');
        const currentCards = document.querySelectorAll('.current-project-card');
        const resumeWraps = document.querySelectorAll('.resume-wrap');
        const allCards = [...completedCards, ...currentCards, ...resumeWraps];
        
        const cleanMsg = message.toLowerCase();
        let bestMatch = null;
        let maxOverlap = 0;
        
        allCards.forEach(card => {
            const titleEl = card.querySelector('h3, h2, .position');
            if (titleEl) {
                const title = titleEl.textContent.toLowerCase();
                const titleWords = title.split(/\s+/).filter(w => w.length > 3 && w !== 'with' && w !== 'using' && w !== 'system' && w !== 'chatbot');
                let overlap = 0;
                titleWords.forEach(word => {
                    if (cleanMsg.includes(word)) {
                        overlap++;
                    }
                });

                if (cleanMsg.includes(title) || title.includes(cleanMsg)) {
                    overlap += 5;
                }

                if (overlap > maxOverlap) {
                    maxOverlap = overlap;
                    bestMatch = card;
                }
            }
        });
        
        return maxOverlap >= 1 ? bestMatch : null;
    }

    extractProjectDetails(card) {
        const titleEl = card.querySelector('h3, h2, .position');
        if (!titleEl) return null;
        
        const title = titleEl.textContent.trim();
        const badge = card.querySelector('.completed-card-badge') || card.querySelector('.current-project-card::after');
        const techLine = card.querySelector('.completed-project-tech-line') || card.querySelector('.project-tech-wrapper');
        const descEl = card.querySelector('p');
        const bullets = Array.from(card.querySelectorAll('.completed-project-bullets li, ul li'));
        const link = card.querySelector('a');
        
        let html = `🔎 <b>Project Details: ${title}</b>`;
        if (badge) {
            html += ` <span style="font-size: 11px; padding: 2px 6px; border-radius: 10px; background: rgba(180, 174, 162, 0.15); color: #b4aea2;">Active</span>`;
        }
        html += `<br><br>`;
        
        if (descEl) {
            html += `${descEl.textContent.trim()}<br><br>`;
        }
        
        if (bullets.length > 0) {
            html += `<b>Key Highlights:</b><br>`;
            bullets.slice(0, 4).forEach(bullet => {
                html += `• ${bullet.textContent.trim()}<br>`;
            });
            html += `<br>`;
        }
        
        if (techLine) {
            const techText = techLine.textContent.replace('Technologies:', '').replace('Active', '').trim();
            html += `🛠️ <b>Technologies:</b> <i>${techText}</i><br><br>`;
        }
        
        if (link) {
            html += `📂 <a href="${link.href}" target="_blank" style="color:#b4aea2; text-decoration:underline;">View Project Code / Link</a><br><br>`;
        }
        
        return html;
    }

    /**
     * Extract skills
     */
    extractSkills(section) {
        const skillCards = section.querySelectorAll('.skill-card');
        
        if (skillCards.length > 0) {
            let responseHTML = `<strong>💡 Monisha's Technical Skills & Expertise (Section-Wise):</strong><br><br>`;
            
            skillCards.forEach(card => {
                const headingEl = card.querySelector('h4');
                if (headingEl) {
                    const tagElements = card.querySelectorAll('.skill-tag');
                    const tagsList = [];
                    
                    tagElements.forEach(t => {
                        let text = t.textContent.trim();
                        // If it's a learning/new stack, highlight it!
                        if (t.classList.contains('learning')) {
                            // Strip "— Learning" or similar if present to keep it clean, or keep it and add emoji
                            const cleanText = text.replace(/-\s*learning/i, '').replace(/—\s*learning/i, '').trim();
                            tagsList.push(`<strong>${cleanText} (New 🚀)</strong>`);
                        } else {
                            tagsList.push(text);
                        }
                    });
                    
                    if (tagsList.length > 0) {
                        responseHTML += `<b>${headingEl.textContent.trim()}</b>:<br>`;
                        responseHTML += `${tagsList.join(', ')}<br><br>`;
                    }
                }
            });
            
            responseHTML += `<em>Check out the Completed Projects and Current Projects sections to see these in action!</em>`;
            return responseHTML;
        }

        const skillElements = section.querySelectorAll('.skill-tag');
        if (skillElements.length > 0) {
            const skills = Array.from(skillElements).map(el => el.textContent.trim());
            return `<strong>💡 Monisha's Technical Skills:</strong><br><br>
                ${skills.slice(0, 20).map(s => `• ${s}`).join('<br>')}`;
        }

        return this.extractDefault(section, 'technical-section');
    }

    /**
     * Extract current project details
     */
    extractCurrentProject(section) {
        const projectCards = section.querySelectorAll('.current-project-card');
        let responseHTML = '<strong>⚡ Monisha\'s Current Active Projects (Last 1.5 Months):</strong><br><br>';
        let count = 0;

        if (projectCards.length > 0) {
            projectCards.forEach(card => {
                const titleEl = card.querySelector('h3');
                const descEl = card.querySelector('p');
                const techTags = Array.from(card.querySelectorAll('.project-tech')).map(t => t.textContent.trim());

                if (titleEl) {
                    count++;
                    responseHTML += `<strong>${count}. ${titleEl.textContent.trim()}</strong><br>`;
                    if (descEl) {
                        responseHTML += `${descEl.textContent.trim()}<br>`;
                    }
                    if (techTags.length > 0) {
                        responseHTML += `🛠️ <i>Technologies: ${techTags.join(', ')}</i><br>`;
                    }
                    responseHTML += '<br>';
                }
            });
        }

        if (count === 0) {
            // Fallback content in case section is not fully loaded in DOM
            responseHTML += `1. <strong>Go Backend System Architecture</strong>: Monolith to Microservice refactoring, Redis caching, Celery task queues.<br><br>`;
            responseHTML += `2. <strong>Autonomous Multi-Agent Systems & Production RAG</strong>: Multi-agent networks with CrewAI/Deep Agents, LiteLLM gateway, LLM evaluations.<br><br>`;
            responseHTML += `3. <strong>Workflow Automation & Tool Integration</strong>: n8n ETL pipelines, MCP servers with Claude Code.`;
        }

        return responseHTML + '<em>Scroll to the "Current Project" section in the portfolio for more details!</em>';
    }

    /**
     * Extract work experience
     */
    extractExperience(section) {
        const totalMonths = this.calculateTotalExperience(section);
        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;
        let totalExpStr = '';
        if (years > 0) {
            totalExpStr += `${years} year${years > 1 ? 's' : ''}`;
        }
        if (months > 0) {
            if (totalExpStr) totalExpStr += ' and ';
            totalExpStr += `${months} month${months > 1 ? 's' : ''}`;
        }

        const wraps = section.querySelectorAll('.resume-wrap');
        const experienceBlocks = [];
        wraps.forEach(wrap => {
            const text = wrap.textContent.toLowerCase();
            if (!text.includes('bachelor') && !text.includes('hsc') && !text.includes('ssc') && !text.includes('school') && !text.includes('college')) {
                experienceBlocks.push(wrap);
            }
        });

        let expHTML = `<strong>💼 Work Experience:</strong> (Total Duration: ~${totalExpStr})<br><br>`;
        let count = 0;

        experienceBlocks.forEach(block => {
            const position = block.querySelector('.position');
            const date = block.querySelector('.date');
            const company = block.querySelector('h3 a, h3');

            if (position && date && count < 4) {
                count++;
                expHTML += `<strong>${count}. ${position.textContent.trim()}</strong><br>`;
                if (company) {
                    const companyName = company.textContent.replace('Company Name :', '').trim();
                    expHTML += `📍 ${companyName}<br>`;
                }
                expHTML += `📅 ${date.textContent.trim()}<br><br>`;
            }
        });

        if (count === 0) {
            return this.extractDefault(section, 'resume-section');
        }

        return expHTML + '<em>Scroll down to the Resume section for complete details.</em>';
    }

    /**
     * Extract current workplace (intelligent detection)
     */
    extractCurrentWorkplace(section) {
        const experienceBlocks = section.querySelectorAll('.resume-wrap');
        let currentJobs = [];

        experienceBlocks.forEach(block => {
            const dateEl = block.querySelector('.date');
            const position = block.querySelector('.position, h2');
            const company = block.querySelector('h3 a, h3 b');

            // Check if this is a current job (contains "Present")
            if (dateEl && dateEl.textContent.toLowerCase().includes('present')) {
                const jobInfo = {
                    position: position ? position.textContent.trim() : 'Position',
                    company: company ? company.textContent.replace('Company Name :', '').replace('Website Name :', '').trim() : 'Company',
                    date: dateEl.textContent.trim()
                };
                currentJobs.push(jobInfo);
            }
        });

        if (currentJobs.length === 0) {
            return '<strong>💼 Current Workplace:</strong><br><br>Monisha is currently seeking new opportunities! Check out her skills and projects to see what she can bring to your team.<br><br><em>View the Resume section for her complete work history.</em>';
        }

        let currentHTML = '<strong>💼 Current Workplace:</strong><br><br>';

        if (currentJobs.length === 1) {
            const job = currentJobs[0];
            currentHTML += `Monisha is currently working as a <strong>${job.position}</strong> at <strong>${job.company}</strong>.<br><br>`;
            currentHTML += `📅 ${job.date}<br><br>`;
        } else {
            currentHTML += `Monisha is currently working in <strong>${currentJobs.length} positions</strong>:<br><br>`;
            currentJobs.forEach((job, index) => {
                currentHTML += `${index + 1}. <strong>${job.position}</strong> at <strong>${job.company}</strong><br>`;
                currentHTML += `&nbsp;&nbsp;&nbsp;📅 ${job.date}<br><br>`;
            });
        }

        currentHTML += '<em>Ask about "experience" to see her full work history!</em>';

        return currentHTML;
    }

    /**
     * Extract education
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
     * Extract research from #section-counter block (Research Experience)
     */
    extractResearch(section) {
        let researchHTML = '<strong>🔬 Research Experience:</strong><br><br>';
        let foundContent = false;

        // Find the block-18 that contains h2 "Research Experience"
        const allBlocks = section.querySelectorAll('.block-18');

        allBlocks.forEach(block => {
            const heading = block.querySelector('h2');
            if (heading && heading.textContent.trim().toLowerCase().includes('research experience')) {
                foundContent = true;

                // Extract paper title(s) from the ordered list
                const paperItems = block.querySelectorAll('ol li');
                paperItems.forEach((item, idx) => {
                    const title = item.querySelector('h5') ? item.querySelector('h5').textContent.trim() : item.textContent.trim();
                    researchHTML += `<strong>${idx + 1}. ${title}</strong><br><br>`;
                });

                // Extract all links within the block
                const links = block.querySelectorAll('a');
                links.forEach(link => {
                    const text = link.textContent.trim();
                    const href = link.href;

                    if (href.includes('doi.org') || href.includes('springer')) {
                        researchHTML += `📖 <a href="${href}" target="_blank" style="color:#b4aea2; text-decoration:underline;">Springer Nature Link</a><br>`;
                    } else if (href.includes('drive.google.com') && text.toLowerCase().includes('certificate')) {
                        researchHTML += `🏅 <a href="${href}" target="_blank" style="color:#b4aea2; text-decoration:underline;">Certificate of Presentation</a><br>`;
                    } else if (href.includes('github.com')) {
                        researchHTML += `<br> <a href="${href}" target="_blank" style="color:#b4aea2; text-decoration:underline;">View on GitHub</a><br>`;
                    }
                });
            }
        });

        // Fallback: also surface SafeNet AI research project from resume section
        const resumeSection = document.getElementById('resume-section');
        if (resumeSection) {
            const safenetLink = resumeSection.querySelector('a[href*="safenetai"]');
            if (safenetLink) {
                foundContent = true;
                researchHTML += `<br><strong>Research Project:</strong><br>`;
                researchHTML += `🌐 <a href="${safenetLink.href}" target="_blank" style="color:#b4aea2; text-decoration:underline;">SafeNet AI – Sentiment Analysis Research</a><br>`;
            }
        }

        if (!foundContent) {
            researchHTML += '• Comparative analysis of LLM models<br>';
            researchHTML += '• Transformer Architecture research<br>';
            researchHTML += '• Sentiment Analysis on Bengali Social Media<br>';
            researchHTML += '<br><em>Check the Resume section for full research experience details.</em>';
        } else {
            researchHTML += '<br><em>Ask about "achievements" to see Monisha\'s competition wins!</em>';
        }

        return researchHTML;
    }

    /**
     * Extract achievements from #section-counter block
     */
    extractAchievements(section) {
        let html = '<strong>🏆 Achievements:</strong><br><br>';
        let found = false;

        const allBlocks = section.querySelectorAll('.block-18');

        allBlocks.forEach(block => {
            const heading = block.querySelector('h2');
            if (heading && heading.textContent.trim().toLowerCase().includes('achievement')) {
                found = true;

                // Extract position & event details from <p> tags
                const paragraphs = block.querySelectorAll('p');
                paragraphs.forEach(p => {
                    const spans = p.querySelectorAll('span, b');
                    if (spans.length > 0) {
                        spans.forEach(span => {
                            const text = span.textContent.trim();
                            if (text) html += `${text}<br>`;
                        });
                    } else {
                        const text = p.textContent.trim();
                        if (text) html += `${text}<br>`;
                    }
                });

                // Extract project link button
                const links = block.querySelectorAll('a');
                links.forEach(link => {
                    const href = link.href;
                    const text = link.textContent.trim();
                    if (href && href.includes('github.com')) {
                        html += `<br>🔗 <a href="${href}" target="_blank" style="color:#b4aea2; text-decoration:underline;">Project Link – ${text}</a><br>`;
                    }
                });

                html += '<br>';
            }
        });

        if (!found) {
            html += '🥉 <strong>2nd Runner Up</strong> – INNOVATION SHOWCASING: Smart Jahangirnagar University<br>';
            html += 'Project: Local Chatbot and QA system using Google Gemini<br>';
        }

        html += '<em>Ask about "research" to explore Monisha\'s published work!</em>';
        return html;
    }

    /**
     * Extract completed projects - reads the new .completed-project-card structure
     */
    extractProjects(section) {
        const completedCards = section.querySelectorAll('.completed-project-card');
        let projectHTML = '<strong>🚀 Completed Projects:</strong><br><br>';
        let count = 0;

        if (completedCards.length > 0) {
            completedCards.forEach(card => {
                const titleEl = card.querySelector('h3');
                const techLine = card.querySelector('.completed-project-tech-line');
                const bullets = Array.from(card.querySelectorAll('.completed-project-bullets li')).slice(0, 2);
                const githubLink = card.querySelector('.completed-project-link a');

                if (titleEl && count < 4) {
                    count++;
                    const title = titleEl.textContent.replace(/^[🤖🔊🏃🕷️\s]+/, '').trim();
                    projectHTML += `${count}. <strong>${title}</strong><br>`;
                    if (techLine) projectHTML += `<em>${techLine.textContent.trim()}</em><br>`;
                    if (bullets.length > 0) {
                        projectHTML += `• ${bullets.map(b => b.textContent.trim()).join('<br>• ')}<br>`;
                    }
                    if (githubLink) {
                        projectHTML += `📂 <a href="${githubLink.href}" target="_blank" style="color:#b4aea2; text-decoration:underline;">View on GitHub</a><br>`;
                    }
                    projectHTML += '<br>';
                }
            });

            if (count > 0) {
                return projectHTML + '<em>Explore the completed projects section for full details!</em>';
            }
        }

        return "I couldn't find any completed projects right now. Please check the Completed Projects section in the portfolio.";
    }

    /**
     * Extract certifications with clickable links
     */
    extractCertifications(section) {
        const certRows = section.querySelectorAll('table tbody tr');
        let certHTML = '<strong>📜 Certifications:</strong><br><br>';
        let foundCerts = false;

        certRows.forEach(row => {
            const cols = row.querySelectorAll('td');
            if (cols.length >= 3) {
                const name = cols[0].textContent;
                const provider = cols[1].textContent;
                const linkEl = cols[2].querySelector('a');
                const href = linkEl ? linkEl.href : null;

                if (name && name !== 'N/A') {
                    foundCerts = true;
                    if (href) {
                        certHTML += `• <strong>${name}</strong> (${provider}) <a href="${href}" target="_blank" style="color:#b4aea2; text-decoration:underline;">[View Certificate]</a><br>`;
                    } else {
                        certHTML += `• <strong>${name}</strong> (${provider})<br>`;
                    }
                }
            }
        });

        if (!foundCerts) {
            certHTML += 'Multiple professional certifications in AI, Machine Learning, and Data Science.<br><br>';
            certHTML += '<em>Check the Certification section for complete details.</em>';
        }

        return certHTML;
    }

    /**
     * Extract GitHub link — searches domain-work section and falls back to document-wide search
     */
    extractGithub(section) {
        // First look in the passed section (domain-work)
        let githubLink = section.querySelector('a[href*="github.com"]');

        // Fallback: search the whole document for a GitHub profile link
        if (!githubLink) {
            const allLinks = document.querySelectorAll('a[href*="github.com"]');
            for (const link of allLinks) {
                const href = link.href;
                if (!githubLink || href.split('/').length <= githubLink.href.split('/').length) {
                    githubLink = link;
                }
            }
        }

        if (githubLink) {
            const githubUrl = githubLink.href;
            return `<strong>💻 GitHub Profile:</strong><br><br>
                <a href="${githubUrl}" target="_blank" style="color:#b4aea2; text-decoration:underline; font-size:15px;">${githubUrl}</a><br><br>
                <em>Explore Monisha's repositories and open-source code!</em>`;
        }

        return `<strong>💻 GitHub Profile:</strong><br><br>
            <a href="https://github.com/Monisha09-ds" target="_blank" style="color:#b4aea2; text-decoration:underline; font-size:15px;">https://github.com/Monisha09-ds</a><br><br>
            <em>Explore Monisha's repositories and open-source code!</em>`;
    }

    /**
     * Extract resume download link from home-section
     */
    extractResumeDownload(section) {
        let html = '<strong>📄 Monisha\'s Resume:</strong><br><br>';

        const resumeLink = section.querySelector('a[href*="drive.google.com"]');
        if (resumeLink) {
            html += `📥 <a href="${resumeLink.href}" target="_blank" style="color:#b4aea2; text-decoration:underline;">Download Updated Resume (Google Drive)</a><br><br>`;
        } else {
            html += `📥 <a href="https://drive.google.com/file/d/1bDMGBARC3MTMIxhA3tY18BAPL4ItNOoG/view?usp=drive_link" target="_blank" style="color:#b4aea2; text-decoration:underline;">Download Updated Resume (Google Drive)</a><br><br>`;
        }

        html += '<em>Ask about "experience" to see her full work history!</em>';
        return html;
    }

    /**
     * Extract Career Objective from career-section
     */
    extractCareerObjective(section) {
        const objectiveEl = section.querySelector('.career-objective-text');
        const heading = section.querySelector('h2');

        let html = '<strong>🎯 Career Objective:</strong><br><br>';

        if (objectiveEl) {
            html += objectiveEl.innerText.trim() + '<br><br>';
        } else if (heading) {
            html += section.innerText.replace(heading.innerText, '').trim() + '<br><br>';
        } else {
            html += '<strong>Applied AI Engineer</strong> with strong backend and DevOps orientation, focused on designing, deploying, and scaling production-grade AI systems. Passionate about building automated, reliable, and maintainable AI-driven backend platforms that integrate <strong>Generative AI</strong> and <strong>cloud-native DevOps practices</strong>.<br><br>';
        }

        html += '<em>Ask about "skills" or "projects" to see this in action!</em>';
        return html;
    }

    /**
     * Extract contact information with clickable links
     */
    extractContact(section) {
        let contactHTML = '<strong>📧 Contact Information:</strong><br><br>';

        // Extract email
        const emailLinks = section.querySelectorAll('a[href^="mailto:"]');
        if (emailLinks.length > 0) {
            const email = emailLinks[0].href.replace('mailto:', '');
            contactHTML += `📧 Email: <a href="mailto:${email}" style="color:#b4aea2; text-decoration:underline;">${email}</a><br><br>`;
        }

        // Extract social links
        const socialLinks = section.querySelectorAll('a[href*="linkedin"], a[href*="github"]');
        if (socialLinks.length > 0) {
            contactHTML += '<strong>Social Links:</strong><br>';
            socialLinks.forEach(link => {
                const platform = link.href.includes('linkedin') ? '💼 LinkedIn' : '💻 GitHub';
                contactHTML += `${platform}: <a href="${link.href}" target="_blank" style="color:#b4aea2; text-decoration:underline;">${link.href}</a><br>`;
            });
        }

        contactHTML += '<br><em>Feel free to reach out for collaborations or opportunities!</em>';

        return contactHTML;
    }

    /**
     * Default extraction
     */
    extractDefault(section, sectionId) {
        const text = section.innerText.trim();

        if (text.length > 600) {
            const preview = text.substring(0, 500) + '...';
            return `${this.formatContent(preview)}<br><br>
                <em>This is a preview. Scroll down to the ${this.getSectionName(sectionId)} section for complete details.</em>`;
        }

        return this.formatContent(text.substring(0, 800));
    }

    formatContent(text) {
        return text
            .replace(/\n{3,}/g, '\n\n')
            .replace(/\n/g, '<br>');
    }

    getSectionName(sectionId) {
        const names = {
            'about-section': 'About',
            'resume-section': 'Resume',
            'project-section': 'Projects',
            'domain-work': 'Domain Work',
            'Certification': 'Certification',
            'contact-section': 'Contact',
            'technical-section': 'Technical Skills'
        };
        return names[sectionId] || 'relevant';
    }
}

// ============================================
// LAYER 4: UI RENDERING (with Character Typing)
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
            chipsContainer: document.getElementById('suggestion-chips-container')
        };

        this.isOpen = false;
        this.isTyping = false;
        this.typingSpeed = 15; // ms per character
    }

    init() {
        this.elements.fab?.addEventListener('click', () => this.toggleChat());
        this.elements.close?.addEventListener('click', () => this.toggleChat());
        this.elements.send?.addEventListener('click', () => this.handleSend());

        this.elements.input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });

        this.showWelcomeMessage();
    }

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

    showWelcomeMessage() {
        const welcomeMsg = "Hi! 👋 I'm <b>Monisha's AI assistant</b>. I can help you learn about her skills, experience, projects, research, and more. What would you like to know?";
        this.addBotMessage(welcomeMsg, false, ['Skills', 'Projects', 'Resume']);
    }

    handleSend() {
        const message = this.elements.input.value.trim();

        if (!message || this.isTyping) return;

        this.addUserMessage(message);
        this.elements.input.value = '';

        if (window.portfolioChatbot) {
            window.portfolioChatbot.processMessage(message);
        }
    }

    addUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user';
        messageDiv.textContent = text;

        this.elements.messages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    /**
     * Add bot message with character-by-character typing animation
     */
    addBotMessage(htmlContent, withTyping = true, chips = []) {
        if (withTyping) {
            this.showThinkingIndicator();

            setTimeout(() => {
                this.hideThinkingIndicator();
                this.typeOutMessage(htmlContent, () => {
                    if (chips && chips.length > 0) {
                        this.renderChips(chips);
                    }
                });
            }, 600);
        } else {
            this.renderBotMessage(htmlContent);
            if (chips && chips.length > 0) {
                this.renderChips(chips);
            }
        }
    }

    /**
     * Character-by-character typing effect
     */
    typeOutMessage(htmlContent, onComplete) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        this.elements.messages.appendChild(messageDiv);

        // Create a temporary div to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        let charIndex = 0;
        const textContent = tempDiv.textContent;

        const typeStep = () => {
            if (charIndex < textContent.length) {
                // For simplicity, we'll show the full HTML at once but with a delay
                // A more sophisticated approach would parse and type HTML nodes
                charIndex++;
                this.scrollToBottom();
                setTimeout(typeStep, this.typingSpeed);
            } else {
                // Show full HTML content
                messageDiv.innerHTML = htmlContent;
                this.scrollToBottom();
                if (onComplete) onComplete();
            }
        };

        // Start with empty and gradually reveal
        messageDiv.textContent = '';

        // For better UX, show full HTML after a brief delay
        setTimeout(() => {
            messageDiv.innerHTML = htmlContent;
            this.scrollToBottom();
            if (onComplete) onComplete();
        }, Math.min(textContent.length * this.typingSpeed, 2000));
    }

    renderBotMessage(htmlContent) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        messageDiv.innerHTML = htmlContent;

        this.elements.messages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showThinkingIndicator() {
        this.isTyping = true;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'thinking-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;

        this.elements.messages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideThinkingIndicator() {
        this.isTyping = false;
        const indicator = document.getElementById('thinking-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    /**
     * Render dynamic follow-up chips
     */
    renderChips(chips) {
        if (!this.elements.chipsContainer) return;

        this.elements.chipsContainer.innerHTML = '';

        chips.forEach(chipText => {
            const chip = document.createElement('button');
            chip.className = 'suggestion-chip';
            chip.textContent = chipText;
            chip.setAttribute('data-query', chipText.toLowerCase());

            chip.addEventListener('click', () => {
                this.elements.input.value = chipText.toLowerCase();
                this.handleSend();
            });

            this.elements.chipsContainer.appendChild(chip);
        });
    }

    scrollToBottom() {
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            setTimeout(() => {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 500);
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
        this.convoManager = new ConversationManager();
    }

    init() {
        this.ui.init();
        console.log('✅ Portfolio Chatbot (Hybrid) initialized successfully!');
        console.log('🎯 Features: 4-Layer Architecture + Conversation Tracking + Fuzzy Matching + Clickable Links + Context Resolution');
    }

    processMessage(message) {
        // Add user turn to conversation history
        this.convoManager.addTurn('user', message);

        // Detect current intent
        let intentResult = this.intentDetector.detectIntent(message);
        console.log('🎯 Detected Intent:', intentResult.intent, 'Confidence:', intentResult.confidence);

        // Context-aware query resolution
        const lastBotTurn = this.convoManager.history.slice(0, -1).reverse().find(t => t.role === 'bot');
        const lastIntent = lastBotTurn ? lastBotTurn.intent : null;
        
        const pronounCheck = this.isPronounFollowUp(message);
        if (pronounCheck && lastIntent && (intentResult.intent === 'unknown' || intentResult.confidence < 15)) {
            console.log('🔄 Pronoun follow-up detected. Resolving context from previous intent:', lastIntent);
            intentResult = this.resolveFollowUpIntent(message, lastIntent, intentResult);
        }

        // Generate response
        const response = this.responseGenerator.generateResponse(intentResult, message);

        // Add bot turn to conversation history
        this.convoManager.addTurn('bot', response.text, intentResult.intent);

        // Display response with typing animation and follow-up chips
        this.ui.addBotMessage(response.text, true, response.followUpChips || []);

        // Optionally scroll to section
        if (response.shouldScroll && response.sectionId) {
            this.ui.scrollToSection(response.sectionId);
        }
    }

    isPronounFollowUp(message) {
        const normalized = message.toLowerCase().trim();
        const pronouns = ['it', 'its', 'them', 'they', 'those', 'that', 'this', 'there', 'link', 'github', 'code', 'tech', 'technologies', 'tools', 'languages', 'details', 'more', 'explain', 'show me'];
        
        const words = normalized.split(/\s+/);
        if (words.length <= 8) {
            return words.some(w => pronouns.includes(w)) || normalized.includes('show me') || normalized.includes('explain more') || normalized.includes('tell me more');
        }
        return false;
    }

    resolveFollowUpIntent(message, lastIntent, currentIntentResult) {
        const normalized = message.toLowerCase().trim();
        
        if (lastIntent === 'projects' || lastIntent === 'currentProject') {
            if (normalized.includes('code') || normalized.includes('github') || normalized.includes('link') || normalized.includes('repo')) {
                return {
                    intent: 'github',
                    confidence: 20,
                    data: this.kb.intentMap.github
                };
            }
            if (normalized.includes('tech') || normalized.includes('tool') || normalized.includes('language') || normalized.includes('use')) {
                return {
                    intent: 'skills',
                    confidence: 20,
                    data: this.kb.intentMap.skills
                };
            }
            return {
                intent: 'projects',
                confidence: 20,
                data: this.kb.intentMap.projects
            };
        }
        
        if (lastIntent === 'experience') {
            if (normalized.includes('tech') || normalized.includes('tool') || normalized.includes('language') || normalized.includes('use')) {
                return {
                    intent: 'skills',
                    confidence: 20,
                    data: this.kb.intentMap.skills
                };
            }
        }

        return currentIntentResult;
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    window.portfolioChatbot = new PortfolioChatbot();
    window.portfolioChatbot.init();
});
