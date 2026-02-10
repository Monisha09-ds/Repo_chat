document.addEventListener('DOMContentLoaded', function () {

    // --- Advanced Interaction Engine ---

    class ConversationManager {
        constructor() {
            this.history = []; // Stores last 5 turns: { role: 'user'|'bot', content: '', intent: '' }
            this.context = {
                currentTopic: null, // e.g., 'projects', 'skills'
                lastEntity: null,   // e.g., 'nutriguide'
                awaitingFollowUp: false
            };
        }

        addTurn(role, content, intent = null) {
            this.history.push({ role, content, intent, timestamp: Date.now() });
            if (this.history.length > 10) this.history.shift(); // Keep history manageable

            if (intent && role === 'bot') {
                this.context.currentTopic = intent; // Simplified context tracking
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

    // Intent Definitions (The "Brain" Map)
    const intentMap = {
        'greetings': ['hello', 'hi', 'hey', 'greetings', 'morning', 'afternoon', 'start'],
        'gratitude': ['thanks', 'thank', 'cool', 'awesome', 'good job', 'great'],
        'farewell': ['bye', 'goodbye', 'see ya', 'exit', 'close'],
        'domains': ['domain', 'domains', 'expert', 'expertise', 'field', 'fields', 'area', 'areas'], // Added strict domain intent
        'skills': ['skill', 'skills', 'stack', 'tech', 'technology', 'languages', 'frameworks', 'tools', 'code'],
        'projects': ['project', 'projects', 'work', 'works', 'portfolio', 'app', 'apps', 'build'],
        'contact': ['contact', 'email', 'mail', 'phone', 'address', 'reach', 'connect', 'social', 'linkedin', 'github'],
        'resume': ['resume', 'cv', 'download', 'pdf', 'profile'],
        'experience': ['experience', 'job', 'work', 'history', 'career', 'background', 'company', 'companies', 'role', 'position'],
        'education': ['education', 'degree', 'university', 'college', 'school', 'study', 'studied', 'academic'],
        'results': ['result', 'results', 'cgpa', 'gpa', 'grade', 'grades', 'mark', 'marks'],
        'research': ['research', 'paper', 'papers', 'publication', 'publications', 'journal', 'conference'],
        'achievements': ['achievement', 'achievements', 'award', 'awards', 'win', 'winner', 'runner', 'competition', 'hackathon']
    };

    // Initialize Manager
    const convoManager = new ConversationManager();

    // Configuration
    const config = {
        botName: 'Monisha AI',
        typingSpeed: 30, // ms per character
        initialDelay: 600,
        chatHistoryLimit: 50
    };

    // State (Legacy compatibility wrapper if needed, but we rely on convoManager now)
    const state = {
        isOpen: false,
        isTyping: false,
        debugMode: false // New Debug Feature
    };

    // Knowledge Base - Initial Static Entries + Placeholders
    // Specific data will be populated by scrapePortfolioData()
    let knowledgeBase = [
        {
            id: 'greetings',
            keywords: intentMap.greetings,
            response: "Hi there! I'm <b>Monisha AI</b>. I can tell you everything about Monisha's <b>Skills</b>, <b>Projects</b>, <b>Research</b>, and more. How can I help?",
            followUpChips: ['Skills', 'Projects', 'Resume']
        },
        // ... (rest kept same, to be mapped dynamically)
        {
            id: 'resume',
            keywords: ['resume', 'cv', 'download', 'pdf', 'profile'],
            response: `📄 <b>Download Monisha's Resume:</b><br><br>
<a href="https://drive.google.com/file/d/1bDMGBARC3MTMIxhA3tY18BAPL4ItNOoG/view?usp=drive_link" target="_blank" style="color:#b4aea2; text-decoration:underline;">📥 Updated Resume (Google Drive)</a><br><br>
<a href="https://drive.google.com/drive/folders/17nutttyZG71Ah-8JYREmNeAULDtokPdK?usp=drive_link" target="_blank" style="color:#b4aea2; text-decoration:underline;">📁 Full CV Folder</a>`,
            followUpChips: ['Experience', 'Projects']
        },
        // Placeholders (Will be overwritten/appended by scraper)
        { id: 'projects_list', keywords: ['project', 'projects', 'work', 'works', 'portfolio', 'app', 'apps'], response: "Loading projects...", followUpChips: [] },
        { id: 'skills_core', keywords: ['skill', 'skills', 'capacity', 'ability', 'abilities', 'stack', 'tech'], response: "Loading skills...", followUpChips: [] },
        { id: 'contact', keywords: ['contact', 'email', 'mail', 'phone', 'address', 'reach', 'social'], response: "Loading contact info...", followUpChips: [] },
        { id: 'about', keywords: ['about', 'who', 'bio', 'introduction', 'myself', 'yourself'], response: "Loading bio...", followUpChips: [] },
        { id: 'experience', keywords: ['experience', 'job', 'work', 'history', 'career', 'education', 'background', 'school', 'university', 'college', 'degree'], response: "Loading experience...", followUpChips: [] },
        { id: 'results', keywords: ['cgpa', 'gpa', 'result', 'results', 'marks', 'grade', 'grades', 'performance', 'academic'], response: "Loading results...", followUpChips: [] },
        { id: 'research', keywords: ['research', 'paper', 'publication', 'publications', 'science', 'co-author', 'worker', 'alzheimer', 'detection'], response: "Loading research...", followUpChips: ['Publications', 'Projects'] },
        { id: 'certifications', keywords: ['certification', 'certifications', 'certificate', 'course', 'courses', 'online'], response: "Loading certifications...", followUpChips: [] },
        { id: 'domain_works_list', keywords: ['domain', 'domains', 'area', 'expert'], response: "Loading domains...", followUpChips: [] }
    ];




    function scrapePortfolioData() {
        console.log("Chatbot: Scraping portfolio data...");

        // 1. Projects
        const projectItems = document.querySelectorAll('#project-section ul li');
        // ... (rest of logic) ...
        let projectListHTML = "🎯 <b>Featured Projects:</b><br><br>";
        let projectChips = [];
        const newProjectEntries = [];

        projectItems.forEach((item, index) => {
            const titleEl = item.querySelector('h3');
            const linkEl = item.querySelector('a');
            const descEl = item.querySelector('p');

            if (titleEl) {
                // Clean title: "1. NutriGuide..." -> "NutriGuide"
                let rawTitle = titleEl.innerText;
                const cleanTitle = rawTitle.replace(/^\d+\s*[.]\s*/, '').split(':')[0].trim();
                const fullTitle = rawTitle.replace(/^\d+\s*[.]\s*/, '').trim();

                const gitLink = linkEl ? linkEl.href : "#";
                const desc = descEl ? descEl.innerText : "";

                // Add to main list
                projectListHTML += `${index + 1}️⃣ <b>${fullTitle}</b><br>`;
                projectChips.push(cleanTitle);

                // Create specific entry for this project
                newProjectEntries.push({
                    id: `proj_${cleanTitle.toLowerCase().replace(/\s+/g, '_')}`,
                    keywords: [cleanTitle.toLowerCase(), 'project'],
                    response: `📌 <b>${fullTitle}</b><br><br>${desc}<br><br>📂 <a href="${gitLink}" target="_blank" style="color:#b4aea2;">GitHub Link</a>`,
                    followUpChips: ['Other Projects', 'Contact']
                });
            }
        });
        projectListHTML += "<br>Click a project button below for details!";

        // Update Knowledge Base: Projects
        updateKnowledgeItem('projects_list', {
            response: projectListHTML,
            followUpChips: projectChips.slice(0, 5) // Limit to 5 chips
        });
        // Add individual projects
        knowledgeBase.push(...newProjectEntries);


        // 2. Skills
        // Skills are scattered in progress bars, lets grab titles
        // Actually structure is <span>Python</span>
        const skillSpans = document.querySelectorAll('.skill-mf span:not(.pull-right)');
        let skillsList = [];
        skillSpans.forEach(span => {
            if (span.innerText && span.innerText !== 'Skills' && !span.className.includes('title-s')) {
                skillsList.push(span.innerText);
            }
        });

        let skillsHTML = `💡 <b>Core Skills:</b><br><br>`;
        skillsList.forEach(s => skillsHTML += `• <b>${s}</b><br>`);
        skillsHTML += `<br>Ask about <b>Projects</b> to see them in action!`;

        updateKnowledgeItem('skills_core', {
            response: skillsHTML,
            followUpChips: ['Projects', 'Certifications']
        });


        // 3. Certifications
        const certRows = document.querySelectorAll('#Certification table tbody tr');
        let certHTML = `📜 <b>Certifications:</b><br><br>`;
        let foundCerts = false;

        certRows.forEach(row => {
            const cols = row.querySelectorAll('td');
            if (cols.length >= 3) {
                const name = cols[0].innerText;
                const provider = cols[1].innerText;
                // Extract link if exists
                const linkEl = cols[2].querySelector('a');
                const href = linkEl ? linkEl.href : "#";

                if (name && name !== 'N/A') {
                    foundCerts = true;
                    if (href && href !== "#") {
                        certHTML += `• <b>${name}</b> (${provider}) <a href="${href}" target="_blank" style="color:#b4aea2;">[View]</a><br>`;
                    } else {
                        certHTML += `• <b>${name}</b> (${provider})<br>`;
                    }
                }
            }
        });

        if (!foundCerts) {
            certHTML = "Sorry, I couldn't find any certifications listed properly on the portfolio at the moment.";
        }

        updateKnowledgeItem('certifications', {
            response: certHTML,
            followUpChips: ['Education', 'Projects']
        });


        // 4. Research Experience & Publications
        let researchHTML = `🔬 <b>Research Experience & Publications:</b><br><br>`;
        let foundResearch = false;

        // More robust search for research section
        const allResumeWraps = document.querySelectorAll('#resume-section .resume-wrap, #section-counter .block-18');

        allResumeWraps.forEach(block => {
            const blockText = block.textContent || block.innerText;
            if (blockText.includes('Research Experience')) {
                foundResearch = true;

                // Extract research paper titles
                const papers = block.querySelectorAll('ol li h5, ul li h5, h5');
                papers.forEach((paper, index) => {
                    const paperTitle = paper.textContent.trim();
                    if (paperTitle && !paperTitle.includes('Research Experience')) {
                        researchHTML += `${index + 1}. <b>${paperTitle}</b><br>`;
                    }
                });

                // Extract all links
                const links = block.querySelectorAll('a');
                if (links.length > 0) {
                    researchHTML += `<br><b>📎 Links & Resources:</b><br>`;
                    links.forEach(link => {
                        const linkText = link.textContent.trim() || 'View Link';
                        if (linkText && !linkText.includes('GitHub')) { // Avoid redundant GitHub label if it's the button
                            researchHTML += `🔗 <a href="${link.href}" target="_blank" style="color:#b4aea2;">${linkText}</a><br>`;
                        }
                    });
                }

                // Specifically look for the GitHub button if it exists in this block
                const gitBtn = block.querySelector('.btn-primary');
                if (gitBtn && gitBtn.textContent.includes('GitHub')) {
                    researchHTML += `💻 <a href="${gitBtn.href}" target="_blank" style="color:#b4aea2;">GitHub Repository</a><br>`;
                }
            }
        });

        if (!foundResearch) {
            // Fallback: search for the specific paper title known to be there
            if (document.body.textContent.includes("Alzheimer's Detection")) {
                foundResearch = true;
                researchHTML += `1. <b>Alzheimer's Detection using XAI in Capsule Network & Post Detection Management with Portable Solution</b><br>`;
                researchHTML += `<br><b>📎 Links:</b><br>`;
                researchHTML += `🔗 <a href="https://doi.org/10.1007/978-3-032-04657-4_2" target="_blank" style="color:#b4aea2;">Springer Nature Link</a><br>`;
            } else {
                researchHTML = "Research information is being updated. Please check the portfolio for the latest research work.";
            }
        }

        updateKnowledgeItem('research', {
            response: researchHTML,
            followUpChips: ['Publications', 'Projects', 'Resume']
        });

        // Add specific entry for publications
        knowledgeBase.push({
            id: 'publications',
            keywords: ['publication', 'publications', 'paper', 'papers', 'springer', 'journal', 'conference'],
            response: researchHTML,
            followUpChips: ['Research', 'Projects']
        });


        // 4.5 Achievements Section
        const achievementBlocks = document.querySelectorAll('#section-counter .block-18');
        let achievementHTML = `🏆 <b>Achievements:</b><br><br>`;
        let foundAchievement = false;

        achievementBlocks.forEach(block => {
            if (block.innerText.includes('Achievements') && !block.innerText.includes('Research')) {
                foundAchievement = true;

                // Extract position
                const positionMatch = block.innerText.match(/Position\s*:\s*([^>\n]+)/i);
                if (positionMatch) {
                    achievementHTML += `<b>Position:</b> ${positionMatch[1].trim()}<br>`;
                }

                // Extract event name (look for INNOVATION SHOWCASING)
                const eventMatch = block.innerText.match(/INNOVATION SHOWCASING\s*:\s*([^>\n]+)/i);
                if (eventMatch) {
                    achievementHTML += `<b>Event:</b> ${eventMatch[1].trim()}<br>`;
                }

                // Extract project name (handles the weird <title> Project Name structure)
                const projectMatch = block.innerText.match(/Project Name\s*:\s*([^>\n]+)/i);
                if (projectMatch) {
                    achievementHTML += `<b>Project:</b> ${projectMatch[1].trim()}<br><br>`;
                }

                // Extract project link
                const projectLink = block.querySelector('a');
                if (projectLink) {
                    achievementHTML += `🔗 <a href="${projectLink.href}" target="_blank" style="color:#b4aea2;">View Project</a>`;
                }
            }
        });

        if (!foundAchievement) {
            achievementHTML = "Achievement information is being updated. Please check the portfolio for latest achievements.";
        }

        knowledgeBase.push({
            id: 'achievements',
            keywords: ['achievement', 'achievements', 'award', 'awards', 'competition', 'innovation', 'showcase', 'winner', 'runner'],
            response: achievementHTML,
            followUpChips: ['Research', 'Projects']
        });



        // 5. Domain Works
        const domainBlocks = document.querySelectorAll('#domain-work .block-18');
        let domainList = [];
        let domainHTML = `🧠 <b>Domain Expertise:</b><br><br>Monisha has worked on the following domains:<br><br>`;

        domainBlocks.forEach(block => {
            // Try to find text in h5 or h3
            const h5 = block.querySelector('h5');
            const h3 = block.querySelector('h3');
            let text = "";
            if (h5) text = h5.innerText;
            else if (h3) text = h3.innerText;

            if (text) {
                // Clean up text (remove > or other artifacts if any, relying on innerText usually being clean but just in case)
                text = text.replace(/[>]/g, '').trim();
                if (text) {
                    domainList.push(text);
                    domainHTML += `• <b>${text}</b><br>`;

                    // Dynamic Entry for specific domain query
                    // e.g. "Do you know Generative AI?"
                    knowledgeBase.push({
                        id: `domain_${text.toLowerCase().replace(/\s+/g, '_')}`,
                        keywords: [text.toLowerCase(), ...text.toLowerCase().split(/\s+/).filter(w => w.length >= 2)], // Add full phrase AND individual significant words
                        response: `✅ <b>Yes!</b><br><br><b>${text}</b> is one of Monisha's key areas of expertise. She has developed specialized projects and research in this field.`,
                        followUpChips: ['Projects', 'Skills']
                    });
                }
            }
        });

        // Update the master Domain Works item
        if (domainList.length > 0) {
            // Check if we already have a placeholder (we didn't in the original list, so we push or update if we add one)
            // Let's look for a generic 'domain' trigger.
            // If not present, we can add it.
            knowledgeBase.push({
                id: 'domain_works_list',
                keywords: ['domain', 'domains', 'expert', 'expertise', 'field', 'fields', 'work'],
                response: domainHTML,
                followUpChips: ['Projects', 'Resume']
            });
        }


        // 6. About & Work
        const nameEl = document.querySelector('.about-info span:nth-child(2)'); // Name
        // Job Role is more complex structure, selecting loosely
        const roleEl = document.querySelector('.about-info p:nth-child(2)');
        const expEl = document.querySelector('.about-info p:nth-child(3) span:nth-child(2)'); // Experience years

        let bioHTML = `👩‍💻 <b>About Monisha:</b><br><br>`;
        if (roleEl) {
            // Clean up role text
            bioHTML += `She is a <b>${roleEl.innerText.replace('Job Role: ', '').replace(/\n/g, ' & ')}</b>`;
        }
        if (expEl) bioHTML += ` with <b>${expEl.innerText}</b> of experience.`;

        bioHTML += `<br><br>She specializes in <b>Generative AI, NLP, and Computer Vision</b>.`;

        updateKnowledgeItem('about', {
            response: bioHTML,
            followUpChips: ['Experience', 'Skills']
        });

        // 5.8 Work Experience & Bio Data
        let expHTML = `💼 <b>Work Experience:</b><br><br>`;

        // Extract all work experience from resume section
        const workBlocks = document.querySelectorAll('#resume-section .resume-wrap');
        let jobCount = 0;

        workBlocks.forEach(block => {
            const h3 = block.querySelector('h3');
            const h2 = block.querySelector('h2');
            const position = block.querySelector('.position');
            const date = block.querySelector('.date');
            const desc = block.querySelector('p');

            // Check if this is a work experience entry (has company name or position)
            if (h3 && h3.innerText.includes('Company Name')) {
                jobCount++;
                const companyLink = h3.querySelector('a');
                const companyName = companyLink ? companyLink.innerText : '';
                const jobTitle = position ? position.innerText : '';
                const dateRange = date ? date.innerText : '';

                expHTML += `<b>${jobCount}. ${jobTitle}</b><br>`;
                if (companyName) expHTML += `📍 Company: ${companyName}<br>`;
                if (dateRange) expHTML += `📅 ${dateRange}<br>`;

                // Extract job type (Full-time/Part-time, Remote/Onsite)
                if (desc) {
                    const descText = desc.innerText;
                    const listItems = block.querySelectorAll('ul li');
                    if (listItems.length > 0) {
                        listItems.forEach(item => {
                            expHTML += `&nbsp;&nbsp;• ${item.innerText}<br>`;
                        });
                    }
                }
                expHTML += `<br>`;
            } else if (h2 && !h2.innerText.includes('Science') && !h2.innerText.includes('HSC') && !h2.innerText.includes('SSC')) {
                // Other work experience like mentorship, research work
                jobCount++;
                const title = h2.innerText;
                const dateRange = date ? date.innerText : '';

                expHTML += `<b>${jobCount}. ${title}</b><br>`;
                if (dateRange) expHTML += `📅 ${dateRange}<br>`;

                if (desc) {
                    const listItems = block.querySelectorAll('ul li');
                    if (listItems.length > 0) {
                        listItems.forEach(item => {
                            expHTML += `&nbsp;&nbsp;• ${item.innerText}<br>`;
                        });
                    }
                }
                expHTML += `<br>`;
            }
        });

        if (jobCount === 0) {
            expHTML += `Currently working as <b>Jr AI Engineer</b> at <b>Mediusware Ltd.</b> with 2.5+ years of experience.<br>`;
        }

        // 5.5 Education & Results
        let eduHTML = `🎓 <b>Education & Results:</b><br><br>`;
        let resultsHTML = `📊 <b>Academic Results (CGPA/GPA):</b><br><br>`;
        // Using the same workBlocks (resume-wrap) as they contain both experience and education
        // But re-querying to be safe if variable scope was different, though here it shares scope.
        // Let's reuse workBlocks logic but filter for education specific items more robustly.

        const educationBlocks = document.querySelectorAll('#resume-section .resume-wrap');

        educationBlocks.forEach(block => {
            const h3 = block.querySelector('h3');
            const h2 = block.querySelector('h2');
            const degree = h3 ? h3.innerText : (h2 ? h2.innerText : '');
            const universityEl = block.querySelector('.position');
            const university = universityEl ? universityEl.innerText : '';
            const dateEl = block.querySelector('.date');
            const date = dateEl ? dateEl.innerText : '';

            // Extract certificate link if present
            const certLink = block.querySelector('a');
            const certHref = certLink ? certLink.href : '';

            // Extract result/desc
            const pTags = block.querySelectorAll('p');
            let desc = '';
            // Usually the last p, or one containing 'CGPA'/'GPA'
            pTags.forEach(p => {
                if (p.innerText.includes('CGPA') || p.innerText.includes('GPA')) {
                    desc = p.innerText;
                }
            });

            if (degree && (degree.includes('Science') || degree.includes('HSC') || degree.includes('SSC'))) {
                eduHTML += `• <b>${degree}</b><br>`;
                if (university) eduHTML += `&nbsp;&nbsp;🏫 ${university}<br>`;
                if (date) eduHTML += `&nbsp;&nbsp;📅 ${date}<br>`;

                if (desc) {
                    eduHTML += `&nbsp;&nbsp;🏆 ${desc}<br>`;
                    resultsHTML += `• <b>${degree}</b>: ${desc}<br>`;
                }

                if (certHref) {
                    eduHTML += `&nbsp;&nbsp;🔗 <a href="${certHref}" target="_blank" style="color:#b4aea2;">View Certificate</a><br>`;
                }
                eduHTML += `<br>`;
            }
        });

        updateKnowledgeItem('experience', {
            response: expHTML + eduHTML,
            followUpChips: ['Results', 'Projects']
        });

        updateKnowledgeItem('results', {
            response: resultsHTML + `<br>Monisha has a consistently strong academic record!`,
            followUpChips: ['Education', 'Certifications']
        });


        // 6. Contact & Socials
        let email = "itmonisha95@gmail.com"; // Default fallback
        let address = "Dhaka, Bangladesh";
        let linkedIn = "";
        let github = "";
        let otherSocials = [];

        // Iterate boxes to find content
        const contactBoxes = document.querySelectorAll('.contact-info .box');
        contactBoxes.forEach(box => {
            const txt = box.innerText;
            if (txt.includes('@')) email = txt.split('\n').find(l => l.includes('@')) || txt;
            if (txt.includes('Address')) address = txt.replace('Address\n', '');
        });

        // Scrape Social Links (Footer & General)
        const socialLinks = document.querySelectorAll('.ftco-footer-social li a, a[href*="linkedin.com"], a[href*="github.com"]');
        socialLinks.forEach(link => {
            const href = link.href;
            if (href.includes("linkedin.com")) linkedIn = href;
            else if (href.includes("github.com")) github = href;
            else {
                // Avoid duplicates
                if (!otherSocials.some(s => s.href === href) && href !== "#") {
                    const iconSpan = link.querySelector('span');
                    const name = iconSpan ? iconSpan.className.replace('icon-', '') : 'Link';
                    otherSocials.push({ name: name, href: href });
                }
            }
        });


        // --- Create Granular Knowledge Entries ---

        // A. Email Only
        knowledgeBase.push({
            id: 'contact_email',
            keywords: ['email', 'mail', 'gmail', 'address'], // 'address' sometimes overlaps but usually implies electronic address in chat context unless 'home address'
            response: `📧 <b>Email:</b> <a href="mailto:${email.trim()}" style="color:#b4aea2;">${email.trim()}</a>`,
            followUpChips: ['LinkedIn', 'Contact']
        });

        // B. LinkedIn Only
        if (linkedIn) {
            knowledgeBase.push({
                id: 'contact_linkedin',
                keywords: ['linkedin', 'profile'],
                response: `🔗 <b>LinkedIn:</b> <a href="${linkedIn}" target="_blank" style="color:#b4aea2;">View Profile</a>`,
                followUpChips: ['Email', 'Resume']
            });
        }

        // C. GitHub Only
        if (github) {
            knowledgeBase.push({
                id: 'contact_github',
                keywords: ['github', 'git', 'repo', 'repositories', 'code'],
                response: `💻 <b>GitHub:</b> <a href="${github}" target="_blank" style="color:#b4aea2;">View Repositories</a>`,
                followUpChips: ['Projects', 'Skills']
            });
        }

        // D. Location Only
        knowledgeBase.push({
            id: 'contact_location',
            keywords: ['location', 'where', 'live', 'city', 'country'],
            response: `📍 <b>Location:</b> ${address.trim()}`,
            followUpChips: ['Contact', 'About']
        });


        // E. General Contact (The Master List)
        let contactHTML = `📧 <b>Get in Touch:</b><br><br>
        <b>Email:</b> <a href="mailto:${email.trim()}" style="color:#b4aea2;">${email.trim()}</a><br>
        <b>Address:</b> ${address.trim()}<br>`;

        if (linkedIn) contactHTML += `<b>LinkedIn:</b> <a href="${linkedIn}" target="_blank" style="color:#b4aea2;">Profile</a><br>`;
        if (github) contactHTML += `<b>GitHub:</b> <a href="${github}" target="_blank" style="color:#b4aea2;">Profile</a><br>`;

        if (otherSocials.length > 0) {
            contactHTML += `<br><b>Socials:</b> `;
            otherSocials.forEach(s => {
                contactHTML += `<a href="${s.href}" target="_blank" style="margin-right:10px; text-transform:capitalize;">${s.name}</a> `;
            });
        }

        updateKnowledgeItem('contact', {
            response: contactHTML,
            // Only use specific triggers for 'contact' ID now, removing 'email', 'github' etc from here to let specific handlers take precedence if matched exactly
            // Logic note: The `findBestMatch` uses score. If keywords partially overlap, we need to ensure unique ones boost the score.
            followUpChips: ['Resume', 'LinkedIn']
        });

        // We update the keywords for the main 'contact' item directly in the KB array to be cleaner
        // removing specific words to avoid conflict
        const contactItem = knowledgeBase.find(k => k.id === 'contact');
        if (contactItem) {
            contactItem.keywords = ['contact', 'reach', 'connect', 'info', 'touch', 'details'];
        }
    }

    function updateKnowledgeItem(id, data) {
        const item = knowledgeBase.find(k => k.id === id);
        if (item) {
            if (data.response) item.response = data.response;
            if (data.followUpChips) item.followUpChips = data.followUpChips;
        }
    }


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

    // Tokenizer
    function tokenize(text) {
        return text.toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "") // Added ? to regex
            .split(/\s+/)
            .filter(w => w.length >= 2); // Filter out very short words (>=2 allows AI, ML)
    }

    // calculateScore function removed as it is now integrated into findBestMatch


    function findBestMatch(userInput) {
        const tokens = tokenize(userInput);
        let bestMatch = null;
        let highestScore = 0;
        let potentialMatches = [];
        let detectedIntent = null;

        // 1. Check for specific interactions (Priority)
        // Check Intent Map directly
        for (const [intent, keywords] of Object.entries(intentMap)) {
            const matchCount = keywords.filter(k => userInput.toLowerCase().includes(k)).length;
            if (matchCount > 0) {
                detectedIntent = intent;
                // We found a likely intent. Now prioritize finding the KB item for this intent.
                addDebugMessage(`⚡ <b>Direct Intent Match:</b> ${intent}`);
                // Map Intents to KB IDs
                let targetId = null;
                if (intent === 'greetings') targetId = 'greetings';
                else if (intent === 'domains') targetId = 'domain_works_list';
                else if (intent === 'skills') targetId = 'skills_core';
                else if (intent === 'resume') targetId = 'resume';
                else if (intent === 'contact') targetId = 'contact';
                else if (intent === 'projects') targetId = 'projects_list';
                else if (intent === 'research') targetId = 'publications';
                else if (intent === 'publications') targetId = 'publications';
                else if (intent === 'achievements') targetId = 'achievements';
                else if (intent === 'education') targetId = 'experience';
                else if (intent === 'experience') targetId = 'experience';
                else if (intent === 'results') targetId = 'results';

                if (targetId) {
                    const directHit = knowledgeBase.find(k => k.id === targetId);
                    if (directHit) return directHit;
                }
            }
        }

        // 2. Fallback to Scoring System
        knowledgeBase.forEach(item => {
            let score = 0;
            const itemKeywords = item.keywords;

            // Exact & Partial Token Matching
            tokens.forEach(token => {
                if (itemKeywords.includes(token)) score += 10;
                else {
                    itemKeywords.forEach(k => {
                        if (k.includes(token) || token.includes(k)) {
                            score += (token.length > 3) ? 5 : 2;
                        } else if (getLevenshteinDistance(token, k) <= 1 && token.length > 3) {
                            score += 8; // Fuzzy
                        }
                    });
                }
            });

            // Phrase Matching
            itemKeywords.forEach(k => {
                if (userInput.toLowerCase().includes(k) && k.includes(' ')) {
                    score += 15;
                }
            });

            if (score > 0) potentialMatches.push({ item: item, score: score });
            if (score > highestScore) {
                highestScore = score;
                bestMatch = item;
            }
        });

        potentialMatches.sort((a, b) => b.score - a.score);

        // Threshold & Context Logic
        if (highestScore < 3) {
            if (potentialMatches.length > 0) return potentialMatches[0].item;

            // Advanced Contextual Fallback
            const lastTopic = convoManager.getContext().currentTopic;
            addDebugMessage(`⚠️ <b>Low Score:</b> ${highestScore} <br> 🔄 <b>Context Check:</b> ${lastTopic}`);

            if (userInput.includes('more') || userInput.includes('detail') || userInput.includes('tell me')) {
                // Check Conversation Manager Context
                if (lastTopic === 'projects' || lastTopic === 'projects_list') return knowledgeBase.find(k => k.id === 'projects_list');
                if (lastTopic === 'research' || lastTopic === 'publications') return knowledgeBase.find(k => k.id === 'publications');
                if (lastTopic === 'skills' || lastTopic === 'skills_core') return knowledgeBase.find(k => k.id === 'skills_core');
            }

            return null;
        }

        if (bestMatch) {
            addDebugMessage(`🏆 <b>Best Match:</b> ${bestMatch.id} (Score: ${highestScore})`);
        }

        return bestMatch;
    }

    // Helper: Levenshtein Distance for fuzzy matching
    function getLevenshteinDistance(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

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

    function scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'center' });
            section.style.transition = 'outline 0.5s ease-in-out';
            section.style.outline = '4px solid #b4aea2';
            setTimeout(() => {
                section.style.outline = 'none';
            }, 3000);
        }
    }



    function handleInput() {
        const text = elements.input.value.trim();
        if (!text) return;

        // Debug Command Handler
        if (text.toLowerCase() === '/debug') {
            state.debugMode = !state.debugMode;
            addMessage(`🐞 <b>Debug Mode:</b> ${state.debugMode ? 'ON' : 'OFF'}`, 'bot');
            elements.input.value = '';
            return;
        }

        // Simulation Command Handler
        if (text.toLowerCase().startsWith('/simulate')) {
            const simulationPrompt = text.substring(9).trim();
            if (!simulationPrompt) {
                addMessage("⚠️ <b>Simulation Mode:</b> Please provide questions separated by newlines or commas.<br>Example: `/simulate Who are you?, What are your skills?`", 'bot');
            } else {
                runSimulation(simulationPrompt);
            }
            elements.input.value = '';
            return;
        }

        // Refresh Command Handler
        if (text.toLowerCase() === '/refresh') {
            addMessage("🔄 <b>Refreshing Knowledge Base...</b>", 'bot');
            scrapePortfolioData();
            elements.input.value = '';
            return;
        }

        addMessage(text, 'user');
        convoManager.addTurn('user', text);

        elements.input.value = '';
        setInputState(false);
        processBotResponse(text);
    }

    function runSimulation(input) {
        addMessage("🧪 <b>Running Simulation...</b>", 'bot');
        const questions = input.split(/[,\n]/).map(q => q.trim()).filter(q => q.length > 0);

        let reportHTML = `📊 <b>Simulation Report:</b><br><br>`;
        let successCount = 0;

        questions.forEach((q, i) => {
            const match = findBestMatch(q);
            const status = match ? '✅' : '❌';
            if (match) successCount++;
            reportHTML += `${i + 1}. "${q}" -> <b>${match ? match.id : 'No Match'}</b> ${status}<br>`;
        });

        reportHTML += `<br>🎯 <b>Accuracy:</b> ${Math.round((successCount / questions.length) * 100)}% (${successCount}/${questions.length})`;

        setTimeout(() => {
            addMessage(reportHTML, 'bot');
            renderChips(['Skills', 'Projects', 'Contact']);
        }, 800);
    }

    function addDebugMessage(info) {
        if (!state.debugMode) return;
        const div = document.createElement('div');
        div.className = 'message bot debug-msg';
        div.style.fontSize = '0.8rem';
        div.style.color = '#ff9800';
        div.style.backgroundColor = '#1e1e1e';
        div.style.fontFamily = 'monospace';
        div.style.border = '1px solid #333';
        div.innerHTML = info;
        elements.messages.appendChild(div);
        scrollToBottom();
    }

    function setInputState(enabled) {
        elements.input.disabled = !enabled;
        elements.send.disabled = !enabled;
    }

    function processBotResponse(userInput) {
        showThinking();
        const delay = config.initialDelay + Math.random() * 800;

        setTimeout(() => {
            removeThinking();

            // 1. Check for Social/Small Talk first
            // Gratitude
            if (intentMap.gratitude.some(k => userInput.toLowerCase().includes(k))) {
                typeOutMessage("You're very welcome! Let me know if you need anything else.", () => renderChips(['Projects', 'Contact']));
                convoManager.addTurn('bot', "You're welcome...", 'gratitude');
                return;
            }
            // Farewell
            if (intentMap.farewell.some(k => userInput.toLowerCase().includes(k))) {
                typeOutMessage("Goodbye! Feels good to help you learn about Monisha.", () => renderChips([]));
                convoManager.addTurn('bot', "Goodbye", 'farewell');
                return;
            }

            // 2. Find Best Knowledge Match
            const match = findBestMatch(userInput);
            let responseText = "";
            let chips = ['Skills', 'Projects', 'Publications', 'Contact'];

            if (match) {
                responseText = match.response;
                if (match.followUpChips) chips = match.followUpChips;

                // Event-triggered: Scroll to relevant section
                if (match.id === 'achievements' || match.id === 'research' || match.id === 'publications') {
                    scrollToSection('section-counter');
                } else if (match.id === 'projects_list' || match.id.startsWith('proj_')) {
                    scrollToSection('project-section');
                } else if (match.id === 'skills_core') {
                    scrollToSection('skills-section');
                } else if (match.id === 'domain_works_list') {
                    scrollToSection('domain-work');
                }

                // Determine broad intent from ID for context
                let detectedIntent = match.id.split('_')[0];
                convoManager.addTurn('bot', responseText, detectedIntent);

                addDebugMessage(`✅ <b>Matched:</b> ${match.id}<br>🎯 <b>Intent:</b> ${detectedIntent}`);

            } else {
                responseText = "I'm not exactly sure about that, but verify with Monisha's <b>Portfolio</b>. Try asking about <b>Projects</b>, <b>Skills</b>, or <b>Contact Info</b>.";
                convoManager.addTurn('bot', responseText, 'fallback');
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

    // Proactive Scroll Monitor (Event-Triggered)
    let proactiveTriggered = false;
    window.addEventListener('scroll', () => {
        if (proactiveTriggered) return;

        const triggerSection = document.getElementById('section-counter');
        if (triggerSection) {
            const rect = triggerSection.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom >= 0) {
                proactiveTriggered = true;
                if (!state.isOpen) {
                    addMessage("👋 Checking out my <b>Achievements & Research</b>? I can give you more details or paper links!", 'bot');
                    renderChips(['Publications', 'Achievements', 'Contact']);
                }
            }
        }
    });

    // Run Scraper to populate KB
    setTimeout(scrapePortfolioData, 1000); // 1s delay to allow rendering

    // Init chips
    const initialChips = ['Skills', 'Projects', 'Publications', 'Resume', 'Contact'];
    renderChips(initialChips);

});
