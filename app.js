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
        title: "Email Validator",
        icon: "mail",
        description: "Verify email format and potential leaks.",
        template: [
            { name: "HaveIBeenPwned", url: "https://haveibeenpwned.com/account/{query}" },
            { name: "EPIEOS", url: "https://epieos.com/?q={query}" },
            { name: "Hunter.io", url: "https://hunter.io/try/verify/{query}" }
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
