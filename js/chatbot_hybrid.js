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
            awaitingFollowUp: false
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
                keywords: ['github', 'git', 'github link', 'repository', 'repositories', 'code repository'],
                type: 'dynamic',
                sectionId: 'contact-section',
                extractStrategy: 'github'
            },
            resumeDownload: {
                keywords: ['resume download', 'cv download', 'download resume', 'download cv', 'pdf'],
                type: 'static',
                sectionId: null
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
            skills: ['Projects', 'Certifications'],
            projects: ['Skills', 'Contact'],
            experience: ['Projects', 'Education'],
            research: ['Projects', 'Publications'],
            education: ['Experience', 'Skills'],
            contact: ['Projects', 'Resume'],
            github: ['Projects', 'Contact'],
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

                // Exact phrase match (highest priority)
                if (normalized.includes(normalizedKeyword)) {
                    score += normalizedKeyword.split(' ').length * 10;
                }

                // Individual word matches
                const keywordWords = normalizedKeyword.split(' ');

                for (const kw of keywordWords) {
                    if (kw.length <= 2) continue;

                    for (const inputWord of inputWords) {
                        if (inputWord === kw) {
                            score += 5;
                        } else {
                            // Fuzzy matching for typos
                            const distance = this.getLevenshteinDistance(inputWord, kw);
                            if (distance <= 1 && kw.length > 3) {
                                score += 3; // Partial credit for close matches
                            }
                        }
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
// LAYER 3: RESPONSE GENERATION (with Clickable Links)
// ============================================

class ResponseGenerator {
    constructor(knowledgeBase) {
        this.kb = knowledgeBase;
    }

    generateResponse(intentResult) {
        const { intent, data } = intentResult;

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
            'projects': () => this.extractProjects(section),
            'certifications': () => this.extractCertifications(section),
            'github': () => this.extractGithub(section),
            'contact': () => this.extractContact(section),
            'currentWorkplace': () => this.extractCurrentWorkplace(section)
        };

        if (strategy && strategies[strategy]) {
            return strategies[strategy]();
        }

        return this.extractDefault(section, sectionId);
    }

    /**
     * Extract skills
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

            if (position && date && count < 3) {
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
     * Extract research with clickable paper links
     */
    extractResearch(section) {
        // Look for SafeNet AI link
        const safenetLink = section.querySelector('a[href*="safenetai"]');

        let researchHTML = '<strong>🔬 Research & Publications:</strong><br><br>';

        // Check for actual research papers/publications in the HTML
        const allBlocks = section.querySelectorAll('.resume-wrap');
        let foundPapers = false;

        allBlocks.forEach(block => {
            const heading = block.querySelector('h2, h3');

            // Look for research-related headings
            if (heading && (heading.textContent.includes('Research') || heading.textContent.includes('Mentorship'))) {
                const description = block.querySelector('p');
                if (description) {
                    researchHTML += description.textContent.trim() + '<br><br>';
                }

                // Look for any paper links
                const links = block.querySelectorAll('a');
                links.forEach(link => {
                    if (link.href && (link.href.includes('springer') || link.href.includes('doi') || link.href.includes('arxiv') || link.href.includes('paper'))) {
                        foundPapers = true;
                        researchHTML += `📄 <a href="${link.href}" target="_blank" style="color:#b4aea2; text-decoration:underline; font-size:14px;">${link.textContent || 'View Paper'}</a><br><br>`;
                    }
                });
            }
        });

        // If SafeNet AI link exists, add it
        if (safenetLink) {
            researchHTML += `<strong>Research Project:</strong><br>`;
            researchHTML += `🌐 <a href="${safenetLink.href}" target="_blank" style="color:#b4aea2; text-decoration:underline; font-size:14px;">SafeNet AI - Sentiment Analysis Research</a><br><br>`;
        }

        // Add research areas
        researchHTML += '<strong>Research Areas:</strong><br>';
        researchHTML += '• Comparative analysis of LLM models<br>';
        researchHTML += '• Transformer Architecture research<br>';
        researchHTML += '• Sentiment Analysis on Bengali Social Media<br>';
        researchHTML += '• Applied AI and experimental model development<br><br>';

        if (!foundPapers) {
            researchHTML += '<em>Publications coming soon! Check the Resume section for research experience details.</em>';
        }

        return researchHTML;
    }

    /**
     * Extract projects with clickable GitHub links
     */
    extractProjects(section) {
        const projectItems = section.querySelectorAll('ul li');
        let projectHTML = '<strong>🚀 Featured Projects:</strong><br><br>';
        let count = 0;

        projectItems.forEach((item, index) => {
            const titleEl = item.querySelector('h3');
            const linkEl = item.querySelector('a');
            const descEl = item.querySelector('p');

            if (titleEl && count < 5) {
                count++;
                const title = titleEl.textContent.replace(/^\d+\s*[.]\s*/, '').trim();
                const gitLink = linkEl ? linkEl.href : null;
                const desc = descEl ? descEl.textContent.substring(0, 100) + '...' : '';

                projectHTML += `${count}. <strong>${title}</strong><br>`;
                projectHTML += `${desc}<br>`;

                if (gitLink) {
                    projectHTML += `📂 <a href="${gitLink}" target="_blank" style="color:#b4aea2; text-decoration:underline;">View on GitHub</a><br>`;
                }
                projectHTML += '<br>';
            }
        });

        if (count === 0) {
            return this.extractDefault(section, 'project-section');
        }

        return projectHTML + '<em>Click the links to explore the code!</em>';
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
     * Extract GitHub link
     */
    extractGithub(section) {
        const links = section.querySelectorAll('a[href*="github.com"]');

        if (links.length > 0) {
            const githubUrl = links[0].href;
            return `<strong>💻 GitHub Profile:</strong><br><br>
                <a href="${githubUrl}" target="_blank" style="color:#b4aea2; text-decoration:underline; font-size:16px;">
                    ${githubUrl}
                </a><br><br>
                <em>Check out Monisha's repositories and code samples!</em>`;
        }

        return '<strong>💻 GitHub:</strong><br><br>Visit Monisha\'s GitHub profile to see code samples and projects. You can find the link in the Contact section below.';
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
            'contact-section': 'Contact'
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
        console.log('🎯 Features: 4-Layer Architecture + Conversation Tracking + Fuzzy Matching + Clickable Links');
    }

    processMessage(message) {
        // Add to conversation history
        this.convoManager.addTurn('user', message);

        // Detect intent
        const intentResult = this.intentDetector.detectIntent(message);
        console.log('🎯 Detected Intent:', intentResult.intent, 'Confidence:', intentResult.confidence);

        // Generate response
        const response = this.responseGenerator.generateResponse(intentResult);

        // Add to conversation history
        this.convoManager.addTurn('bot', response.text, intentResult.intent);

        // Display response with typing animation and follow-up chips
        this.ui.addBotMessage(response.text, true, response.followUpChips || []);

        // Optionally scroll to section
        if (response.shouldScroll && response.sectionId) {
            this.ui.scrollToSection(response.sectionId);
        }
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    window.portfolioChatbot = new PortfolioChatbot();
    window.portfolioChatbot.init();
});
