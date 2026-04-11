const TOOLS_CONFIG = {
    username: {
        title: "Person Search",
        icon: "fingerprint",
        description: "Deep search for individuals on specialized investigative platforms.",
        template: [
            { name: "Escavador (Records)", url: "https://www.escavador.com/busca?q={query}" },
            { name: "Jusbrasil (Legal)", url: "https://www.jusbrasil.com.br/busca?q={query}" },
            { name: "LinkedIn", url: "https://www.google.com/search?q=site:linkedin.com/in/ \"{query}\"" },
            { name: "Instagram", url: "https://www.instagram.com/explore/tags/{query}/" },
            { name: "Twitter/X", url: "https://twitter.com/search?q=\"{query}\"&f=user" },
            { name: "FaceCheck.ID (Face Search)", url: "https://facecheck.id/" }
        ]
    },
    domain: {
        title: "Domain / IP Lookup",
        icon: "globe",
        description: "Analyze domains and IP addresses.",
        template: [
            { name: "Who.is", url: "https://who.is/whois/{query}" },
            { name: "VirusTotal", url: "https://www.virustotal.com/gui/search/{query}" },
            { name: "Shodan", url: "https://www.shodan.io/search?query={query}" },
            { name: "SecurityTrails", url: "https://securitytrails.com/domain/{query}" },
            { name: "DNSDumpster", url: "https://dnsdumpster.com/" }
        ]
    },
    dorking: {
        title: "Google Dorking",
        icon: "search",
        description: "Find names in public lists, registrations, and official files.",
        template: [
            { name: "Public Lists / Names", dork: '"{query}" filetype:pdf OR filetype:xls OR filetype:doc' },
            { name: "Official Gazettes (BR)", dork: '"{query}" site:jus.br OR "diário oficial"' },
            { name: "Exam Registrations", dork: '"{query}" "lista de inscritos" OR "lista de aprovados"' },
            { name: "Gov / Edu Records", dork: '"{query}" site:gov.br OR site:edu.br' },
            { name: "Social Media Mentions", dork: '"{query}" site:facebook.com OR site:instagram.com OR site:linkedin.com' },
            { name: "Sensitive Docs (Domain)", dork: 'site:{query} filetype:pdf "confidential"' }
        ]
    },
    email: {
        title: "Mail Intel",
        icon: "mail",
        description: "Discovery accounts and data leaks linked to an email address.",
        template: [
            { name: "EPIEOS (Account Discovery)", url: "https://epieos.com/?q={query}" },
            { name: "HaveIBeenPwned (Leaks)", url: "https://haveibeenpwned.com/account/{query}" },
            { name: "IntelX (Data Search)", url: "https://intelx.io/?s={query}" },
            { name: "Hunter.io (Company Info)", url: "https://hunter.io/try/verify/{query}" },
            { name: "Social Search (Dork)", dork: '"{query}" site:facebook.com OR site:twitter.com OR site:instagram.com' },
            { name: "Pastebin / Leaks", dork: 'site:pastebin.com OR site:github.com "{query}"' }
        ]
    }

};

class OSINTApp {
    constructor() {
        this.history = [];
        try {
            this.history = JSON.parse(localStorage.getItem('osint_history')) || [];
        } catch(e) { console.error("History fail", e); }
        
        this.currentTheme = localStorage.getItem('osint_theme') || 'dark';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderHistory();
        this.applyTheme();
        this.refreshIcons();
    }

    refreshIcons() {
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    }

    setupEventListeners() {
        document.querySelectorAll('.search-btn').forEach(btn => {
            btn.onclick = (e) => {
                const type = e.currentTarget.getAttribute('data-type');
                this.handleSearch(type);
            };
        });

        const clearBtn = document.getElementById('clearHistory');
        if (clearBtn) clearBtn.onclick = () => this.clearHistory();

        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) themeBtn.onclick = () => this.toggleTheme();

        ['usernameInput', 'domainInput', 'dorkInput', 'emailInput'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.onkeypress = (e) => {
                    if (e.key === 'Enter') {
                        const type = id.replace('Input', '');
                        this.handleSearch(type === 'dork' ? 'dorking' : (type === 'username' ? 'username' : type));
                    }
                };
            }
        });
    }

    handleSearch(type) {
        const inputId = type === 'dorking' ? 'dorkInput' : (type === 'username' ? 'usernameInput' : `${type}Input`);
        const inputEl = document.getElementById(inputId);
        if (!inputEl) return;

        const query = inputEl.value.trim();
        if (!query) {
            this.showToast('Digite um alvo para investigar.', 'error');
            return;
        }

        this.executeSearch(type, query);
    }

    executeSearch(type, query) {
        const config = TOOLS_CONFIG[type];
        if (!config) return;

        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) resultsSection.classList.remove('hidden');
        
        const metaEl = document.getElementById('resultMeta');
        if (metaEl) metaEl.textContent = `ALVO: ${query.toUpperCase()}`;

        const titleEl = document.getElementById('resultTitle');
        if (titleEl) {
            titleEl.innerHTML = `<i data-lucide="${config.icon}" class="w-5 h-5"></i> ${config.title} - Resultados`;
        }

        const grid = document.getElementById('resultsGrid');
        if (!grid) return;
        grid.innerHTML = '';

        config.template.forEach(item => {
            const card = document.createElement('div');
            card.className = 'glass-card p-4 rounded-xl result-item animate-in flex flex-col justify-between';
            
            let finalUrl = '';
            let displayPath = '';

            if (item.url) {
                finalUrl = item.url.split('{query}').join(encodeURIComponent(query));
                displayPath = finalUrl;
            } else if (item.dork) {
                let dorkString = item.dork.split('{query}').join(query);
                if (query.includes(' ') && dorkString.includes(`site:${query}`)) {
                    dorkString = dorkString.split(`site:${query}`).join(`"${query}"`);
                }
                finalUrl = `https://www.google.com/search?q=${encodeURIComponent(dorkString)}`;
                displayPath = dorkString;
            }

            card.innerHTML = `
                <div class="mb-3 overflow-hidden">
                    <h4 class="font-bold text-sm text-slate-200">${item.name}</h4>
                    <p class="text-[10px] text-slate-500 truncate mt-1 mono-font" title="${displayPath}">${displayPath}</p>
                </div>
                <a href="${finalUrl}" target="_blank" rel="noopener noreferrer" 
                    class="mt-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold py-2 px-4 rounded-lg transition-colors border border-slate-700">
                    Abrir Ferramenta <i data-lucide="external-link" class="w-3 h-3"></i>
                </a>
            `;
            grid.appendChild(card);
        });

        this.performLiveOSINT(type, query, grid);

        this.addToHistory(type, query);
        this.refreshIcons();

        if (resultsSection) resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.showToast(`Relatório gerado para: ${query}`, 'success');
    }

    addToHistory(type, query) {
        this.history = this.history.filter(item => !(item.type === type && item.query === query));
        this.history.unshift({ type, query, timestamp: new Date().toISOString() });
        if (this.history.length > 5) this.history = this.history.slice(0, 5);
        localStorage.setItem('osint_history', JSON.stringify(this.history));
        this.renderHistory();
    }

    async performLiveOSINT(type, query, grid) {
        if (type === 'email') {
            try {
                // Gravatar API supports CORS and reveals active accounts
                const hash = CryptoJS.MD5(query.toLowerCase().trim()).toString();
                const response = await fetch(`https://en.gravatar.com/${hash}.json`);
                if (response.ok) {
                    const data = await response.json();
                    const profile = data.entry[0];
                    this.injectLiveCard(grid, {
                        platform: "Gravatar Integration",
                        icon: "fingerprint",
                        avatar: profile.thumbnailUrl,
                        name: profile.displayName || profile.preferredUsername || "Unknown Name",
                        username: profile.preferredUsername || "N/A",
                        details: [
                            { label: "Profile Link", value: profile.profileUrl, link: true }
                        ],
                        about: profile.aboutMe || ""
                    });
                }
            } catch(e) { console.log('Gravatar fetch failed', e) }
        } else if (type === 'username') {
             try {
                // Github Open API reveals followers, etc.
                const response = await fetch(`https://api.github.com/users/${query}`);
                if (response.ok) {
                    const profile = await response.json();
                    this.injectLiveCard(grid, {
                        platform: "GitHub Profile",
                        icon: "code",
                        avatar: profile.avatar_url,
                        name: profile.name || profile.login,
                        username: profile.login,
                        details: [
                            { label: "Followers", value: profile.followers },
                            { label: "Following", value: profile.following },
                            { label: "Public Repos", value: profile.public_repos }
                        ],
                        link: profile.html_url
                    });
                }
            } catch(e) { console.log('Github fetch failed', e) }
        }
    }

    injectLiveCard(grid, data) {
        const card = document.createElement('div');
        // Make it span all columns, distinctive border, vibrant background
        card.className = 'glass-card p-6 rounded-xl border border-purple-500/50 result-item animate-in flex flex-col md:col-span-2 lg:col-span-3 lg:col-span-4 bg-slate-900/60 shadow-[0_0_20px_rgba(168,85,247,0.15)] relative overflow-hidden mb-4';
        
        let detailsHtml = '';
        if (data.details && data.details.length) {
             detailsHtml = `<div class="flex flex-wrap gap-4 mt-4">` + 
                 data.details.map(d => {
                     const val = d.link ? `<a href="${d.value}" target="_blank" class="text-purple-400 hover:text-purple-300 hover:underline break-all transition-colors">${d.value}</a>` : `<span class="font-bold text-slate-100 text-lg">${d.value}</span>`;
                     return `<div class="bg-slate-950/80 rounded-lg px-4 py-2 border border-slate-700/50 shadow-inner flex flex-col justify-center"><span class="text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5">${d.label}</span>${val}</div>`;
                 }).join('') + `</div>`;
        }

        const iconStr = data.icon === 'code' ? `<i data-lucide="code" class="w-5 h-5"></i>` : `<i data-lucide="${data.icon}" class="w-5 h-5"></i>`;

        card.innerHTML = `
            <!-- Accent Bar -->
            <div class="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-purple-500 to-cyan-500"></div>
            
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5 z-10 w-full pl-2">
                ${data.avatar ? `<div class="relative"><img src="${data.avatar}" alt="Avatar" class="w-20 h-20 rounded-full border-2 border-purple-500/30 object-cover shadow-lg shadow-purple-500/20"><div class="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-slate-900 rounded-full"></div></div>` : `<div class="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700 shadow-lg"><i data-lucide="user" class="w-10 h-10 text-slate-500"></i></div>`}
                
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 text-purple-400 mb-1.5">
                        ${iconStr}
                        <h4 class="font-bold text-[11px] uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">${data.platform} <span class="bg-purple-600/20 border border-purple-500/30 text-purple-300 text-[9px] px-1.5 py-0.5 rounded ml-2 tracking-normal font-mono">LIVE INTELLIGENCE</span></h4>
                    </div>
                    <div class="flex items-center gap-3">
                        <h3 class="text-2xl font-bold text-white truncate">${data.name}</h3>
                        ${data.link ? `<a href="${data.link}" target="_blank" class="shrink-0 bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white p-1.5 rounded-md transition-all shadow-sm group">
                            <i data-lucide="external-link" class="w-4 h-4 group-hover:scale-110 transition-transform"></i>
                        </a>` : ''}
                    </div>
                    <p class="text-sm text-slate-400 font-mono mt-1 flex items-center gap-1.5">
                        <i data-lucide="at-sign" class="w-3.5 h-3.5"></i>${data.username}
                    </p>
                    
                    ${data.about ? `<p class="text-sm text-slate-300 mt-3 bg-slate-800/40 p-3 rounded-lg border border-slate-700/50 italic w-full sm:w-11/12">"${data.about}"</p>` : ''}
                    
                    ${detailsHtml}
                </div>
            </div>
        `;
        // Prepend so it shows at the top of results
        grid.prepend(card);
        this.refreshIcons();
    }

    renderHistory() {
        const list = document.getElementById('historyList');
        if (!list) return;
        if (this.history.length === 0) {
            list.innerHTML = `<span class="text-xs text-slate-600 italic">Sem histórico recente.</span>`;
            return;
        }

        list.innerHTML = this.history.map(item => `
            <button class="history-item text-[10px] bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800 px-3 py-1 rounded-full flex items-center gap-2 transition-all"
                data-type="${item.type}" data-query="${item.query}">
                <span class="opacity-40 uppercase">${item.type}</span>
                <span class="font-medium">${item.query}</span>
            </button>
        `).join('');

        list.querySelectorAll('.history-item').forEach(btn => {
            btn.onclick = (e) => {
                const { type, query } = e.currentTarget.dataset;
                const inputId = type === 'dorking' ? 'dorkInput' : (type === 'username' ? 'usernameInput' : `${type}Input`);
                const el = document.getElementById(inputId);
                if (el) el.value = query;
                this.executeSearch(type, query);
            };
        });
    }

    clearHistory() {
        this.history = [];
        localStorage.removeItem('osint_history');
        this.renderHistory();
        this.showToast('Histórico limpo.');
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('osint_theme', this.currentTheme);
        this.applyTheme();
    }

    applyTheme() {
        const body = document.body;
        const toggleIcon = document.querySelector('#themeToggle i');
        if (this.currentTheme === 'light') {
            body.classList.add('light-mode');
            if (toggleIcon) toggleIcon.setAttribute('data-lucide', 'sun');
        } else {
            body.classList.remove('light-mode');
            if (toggleIcon) toggleIcon.setAttribute('data-lucide', 'moon');
        }
        this.refreshIcons();
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const msgEl = document.getElementById('toastMessage');
        if (!toast || !msgEl) return;
        msgEl.textContent = message;
        toast.classList.remove('opacity-0', 'translate-y-10');
        toast.classList.add('opacity-100', 'translate-y-0');
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-10');
            toast.classList.remove('opacity-100', 'translate-y-0');
        }, 3000);
    }
}

// Inicialização segura
(function() {
    const startApp = () => new OSINTApp();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startApp);
    } else {
        startApp();
    }
})();
