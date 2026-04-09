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
        this.history = JSON.parse(localStorage.getItem('osint_history')) || [];
        this.currentTheme = localStorage.getItem('osint_theme') || 'dark';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderHistory();
        this.applyTheme();
        
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    setupEventListeners() {
        document.querySelectorAll('.search-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                this.handleSearch(type);
            });
        });

        document.getElementById('clearHistory').addEventListener('click', () => {
            this.clearHistory();
        });

        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        const inputs = ['usernameInput', 'domainInput', 'dorkInput', 'emailInput'];
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        const type = id.replace('Input', '');
                        this.handleSearch(type === 'dork' ? 'dorking' : (type === 'username' ? 'username' : type));
                    }
                });
            }
        });
    }

    handleSearch(type) {
        const inputId = type === 'dorking' ? 'dorkInput' : (type === 'username' ? 'usernameInput' : `${type}Input`);
        const inputEl = document.getElementById(inputId);
        const query = inputEl.value.trim();

        if (!query) {
            this.showToast('Please enter a target to investigate.', 'error');
            return;
        }

        this.executeSearch(type, query);
    }

    executeSearch(type, query) {
        const config = TOOLS_CONFIG[type];
        if (!config) return;

        const resultsSection = document.getElementById('resultsSection');
        resultsSection.classList.remove('hidden');
        
        document.getElementById('resultMeta').textContent = `QUERY: ${query.toUpperCase()}`;
        document.getElementById('resultTitle').innerHTML = `
            <i data-lucide="${config.icon}" class="w-5 h-5"></i>
            ${config.title} Results
        `;

        const grid = document.getElementById('resultsGrid');
        grid.innerHTML = '';

        config.template.forEach(item => {
            const card = document.createElement('div');
            card.className = 'glass-card p-4 rounded-xl result-item animate-in flex flex-col justify-between';
            
            let finalUrl = '';
            let actionText = 'Visit Tool';

            if (item.url) {
                finalUrl = item.url.replace(/{query}/g, encodeURIComponent(query));
            } else if (item.dork) {
                let dorkString = item.dork.replace(/{query}/g, query);
                // Fix site: for names
                if (query.includes(' ') && dorkString.includes(`site:${query}`)) {
                    dorkString = dorkString.replace(`site:${query}`, `"${query}"`);
                }
                finalUrl = `https://www.google.com/search?q=${encodeURIComponent(dorkString)}`;
                actionText = 'Run Dork';
            }

            card.innerHTML = `
                <div class="mb-3">
                    <h4 class="font-bold text-sm text-slate-200">${item.name}</h4>
                    <p class="text-xs text-slate-500 truncate mt-1 mono-font">${item.dork || finalUrl}</p>
                </div>
                <a href="${finalUrl}" target="_blank" rel="noopener noreferrer" 
                    class="mt-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold py-2 px-4 rounded-lg transition-colors border border-slate-700">
                    ${actionText} <i data-lucide="external-link" class="w-3 h-3"></i>
                </a>
            `;
            grid.appendChild(card);
        });

        this.addToHistory(type, query);
        
        if (window.lucide) {
            window.lucide.createIcons();
        }

        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.showToast(`Results generated for ${query}`, 'success');
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
            list.innerHTML = `<span class="text-xs text-slate-600 italic">No recent activity found.</span>`;
            return;
        }

        list.innerHTML = this.history.map(item => `
            <button class="history-item text-xs bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800 px-3 py-1.5 rounded-full flex items-center gap-2 transition-all"
                data-type="${item.type}" data-query="${item.query}">
                <span class="opacity-50">${item.type}</span>
                <span class="font-medium">${item.query}</span>
            </button>
        `).join('');

        list.querySelectorAll('.history-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const { type, query } = e.currentTarget.dataset;
                const inputId = type === 'dorking' ? 'dorkInput' : (type === 'username' ? 'usernameInput' : `${type}Input`);
                const el = document.getElementById(inputId);
                if (el) el.value = query;
                this.executeSearch(type, query);
            });
        });
    }

    clearHistory() {
        this.history = [];
        localStorage.removeItem('osint_history');
        this.renderHistory();
        this.showToast('History cleared.');
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
        if (window.lucide) window.lucide.createIcons();
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const msgEl = document.getElementById('toastMessage');
        msgEl.textContent = message;
        toast.classList.remove('opacity-0', 'translate-y-10');
        toast.classList.add('opacity-100', 'translate-y-0');
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-10');
            toast.classList.remove('opacity-100', 'translate-y-0');
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new OSINTApp();
});
