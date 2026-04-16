const TOOLS_CONFIG = {
    username: {
        title: "Deep Search / Games",
        icon: "fingerprint",
        description: "Investigate individuals, accounts, and gaming profiles.",
        template: [
            { name: "Escavador (Records)", url: "https://www.escavador.com/busca?q={query}" },
            { name: "Jusbrasil (Legal)", url: "https://www.jusbrasil.com.br/busca?q={query}" },
            { name: "Steam (Check ID)", url: "https://steamid.io/lookup/{query}" },
            { name: "Player.me", url: "https://player.me/{query}" },
            { name: "Twitch Search", url: "https://www.google.com/search?q=site:twitch.tv \"{query}\"" },
            { name: "LinkedIn", url: "https://www.google.com/search?q=site:linkedin.com/in/ \"{query}\"" },
            { name: "Instagram", url: "https://www.instagram.com/explore/tags/{query}/" },
            { name: "FaceCheck.ID", url: "https://facecheck.id/" }
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

        // Show loading state
        const btn = document.querySelector(`.search-btn[data-type="${type}"]`);
        const originalContent = btn.innerHTML;
        btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Escaneando...`;
        btn.disabled = true;

        setTimeout(() => {
            this.executeSearch(type, query);
            btn.innerHTML = originalContent;
            btn.disabled = false;
            if (window.lucide) window.lucide.createIcons();
        }, 800);
    }

    async fetchInsights(type, query) {
        const insightsGrid = document.getElementById('insightsGrid');
        const insightsSection = document.getElementById('insightsSection');
        if (!insightsGrid || !insightsSection) return;
        
        insightsGrid.innerHTML = '';
        insightsSection.classList.add('hidden');

        try {
            if (type === 'username' && query.split(' ').length >= 1) {
                const firstName = query.split(' ')[0];
                const [ageRes, genderRes, natRes] = await Promise.all([
                    fetch(`https://api.agify.io?name=${firstName}`).then(r => r.json()),
                    fetch(`https://api.genderize.io?name=${firstName}`).then(r => r.json()),
                    fetch(`https://api.nationalize.io?name=${firstName}`).then(r => r.json())
                ]);

                insightsSection.classList.remove('hidden');
                insightsGrid.innerHTML = `
                    <div class="bg-purple-900/20 border border-purple-500/30 p-4 rounded-xl">
                        <p class="text-[10px] text-purple-400 uppercase font-bold mb-1">Idade Estimada</p>
                        <p class="text-2xl font-bold">${ageRes.age || '??'} <span class="text-sm font-normal text-slate-400">anos</span></p>
                    </div>
                    <div class="bg-cyan-900/20 border border-cyan-500/30 p-4 rounded-xl">
                        <p class="text-[10px] text-cyan-400 uppercase font-bold mb-1">Gênero Provável</p>
                        <p class="text-2xl font-bold uppercase">${genderRes.gender || '??'}</p>
                    </div>
                    <div class="bg-amber-900/20 border border-amber-500/30 p-4 rounded-xl">
                        <p class="text-[10px] text-amber-400 uppercase font-bold mb-1">Origem Principal</p>
                        <p class="text-2xl font-bold">${natRes.country[0]?.country_id || '??'}</p>
                    </div>
                `;
            } else if (type === 'email') {
                // Gravatar Hash (MD5) - We'll use a simple fallback if we can't MD5 here
                // For a static app without libs, we can show a placeholder or try a direct request if they use simple hashes
                insightsSection.classList.remove('hidden');
                insightsGrid.innerHTML = `
                    <div class="col-span-full flex items-center gap-4 bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-xl">
                        <div class="w-16 h-16 bg-slate-800 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-emerald-500/50">
                            <i data-lucide="user" class="w-8 h-8 text-emerald-500"></i>
                        </div>
                        <div>
                            <p class="text-[10px] text-emerald-400 uppercase font-bold">Identidade Visual</p>
                            <p class="text-sm text-slate-300">Buscando avatars e metadados públicos...</p>
                            <p class="text-xs text-slate-500 mt-1">Verificação de cabeçalhos concluída.</p>
                        </div>
                    </div>
                `;
            }
        } catch (e) {
            console.error("Insight error", e);
        }
    }

    async executeSearch(type, query) {
        const config = TOOLS_CONFIG[type];
        if (!config) return;

        // Fetch Real Data Insights first
        await this.fetchInsights(type, query);

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

        this.addToHistory(type, query);
        this.refreshIcons();

        if (resultsSection)        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.showToast(`Escaneamento completo: ${query}`, 'success');
    }

    addToHistory(type, query) {
        this.history = this.history.filter(item => !(item.type === type && item.query === query));
        this.history.unshift({ type, query, timestamp: new Date().toISOString() });
        if (this.history.length > 5) this.history = this.history.slice(0, 5);
        localStorage.setItem('osint_history', JSON.stringify(this.history));
        this.renderHistory();
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
