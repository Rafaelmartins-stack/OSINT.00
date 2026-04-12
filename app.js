/**
 * OSINT Toolkit - Core Engine v1.2
 * Stability: MAXIMUM
 */

const TOOLS_CONFIG = {
    username: {
        title: "Person Search",
        icon: "fingerprint",
        template: [
            { name: "Escavador (Records)", url: "https://www.escavador.com/busca?q={query}" },
            { name: "Jusbrasil (Legal)", url: "https://www.jusbrasil.com.br/busca?q={query}" },
            { name: "LinkedIn", url: "https://www.google.com/search?q=site:linkedin.com/in/ \"{query}\"" },
            { name: "Instagram", url: "https://www.instagram.com/explore/tags/{query}/" },
            { name: "Twitter/X", url: "https://twitter.com/search?q=\"{query}\"&f=user" }
        ]
    },
    domain: {
        title: "Domain / IP Lookup",
        icon: "globe",
        template: [
            { name: "Who.is", url: "https://who.is/whois/{query}" },
            { name: "VirusTotal", url: "https://www.virustotal.com/gui/search/{query}" }
        ]
    },
    dorking: {
        title: "Deep Search & Dorking",
        icon: "search",
        template: [
            { name: "Listas ETEC / SP", dork: 'site:vestibulinho.etec.sp.gov.br OR site:cps.sp.gov.br "{query}"' },
            { name: "IFSP / Federal", dork: 'site:ifsp.edu.br "{query}" "resultado"' },
            { name: "Diários Oficiais", dork: 'site:in.gov.br "{query}"' },
            { name: "Transparência Brasil", dork: 'site:transparencia.gov.br "{query}"' }
        ]
    },
    email: {
        title: "Mail Intel",
        icon: "mail",
        template: [
            { name: "OSINT Industries", url: "https://osint.industries/search?query={query}" },
            { name: "EPIEOS", url: "https://epieos.com/?q={query}" },
            { name: "Gravatar", url: "https://en.gravatar.com/{query}" }
        ]
    }
};

const SOCIAL_PLATFORMS = [
    { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/{query}/', icon: 'instagram' },
    { id: 'twitter', name: 'Twitter/X', url: 'https://twitter.com/{query}', icon: 'twitter' },
    { id: 'tiktok', name: 'TikTok', url: 'https://www.tiktok.com/@{query}', icon: 'music' },
    { id: 'github', name: 'GitHub', url: 'https://github.com/{query}', icon: 'github' }
];

class OSINTApp {
    constructor() {
        this.history = [];
        this.discoveredLinks = new Set();
        this.currentTheme = 'dark';
        
        console.log("OSINTApp: Loading...");
    }

    init() {
        console.log("OSINTApp: Initializing UI...");
        this.loadSettings();
        this.setupEventListeners();
        this.renderHistory();
        this.applyTheme();
        this.refreshIcons();
    }

    loadSettings() {
        try {
            const hist = localStorage.getItem('osint_history');
            if (hist) this.history = JSON.parse(hist);
            this.currentTheme = localStorage.getItem('osint_theme') || 'dark';
        } catch (e) {
            console.warn("Settings load failed", e);
        }
    }

    refreshIcons() {
        try {
            if (window.lucide && window.lucide.createIcons) {
                window.lucide.createIcons();
            } else if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        } catch (e) {
            console.error("Lucide Error:", e);
        }
    }

    setupEventListeners() {
        // Search Buttons
        document.querySelectorAll('.search-btn').forEach(btn => {
            btn.onclick = (e) => {
                const type = e.currentTarget.getAttribute('data-type');
                this.handleSearch(type);
            };
        });

        // Utils
        const clearBtn = document.getElementById('clearHistory');
        if (clearBtn) clearBtn.onclick = () => this.clearHistory();

        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) themeBtn.onclick = () => this.toggleTheme();

        // Inputs
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
        if (!inputEl || !inputEl.value.trim()) return;
        
        this.executeSearch(type, inputEl.value.trim());
    }

    executeSearch(type, query) {
        const config = TOOLS_CONFIG[type];
        if (!config) return;

        console.log(`Searching ${type}: ${query}`);

        const resultsSection = document.getElementById('resultsSection');
        const investigationSection = document.getElementById('investigationSection');
        const grid = document.getElementById('resultsGrid');
        const globalGrid = document.getElementById('globalFindingsGrid');
        const countEl = document.getElementById('globalResultCount');
        
        if (resultsSection) resultsSection.classList.remove('hidden');
        if (investigationSection) investigationSection.classList.remove('hidden');
        
        if (countEl) countEl.textContent = '0';
        if (globalGrid) globalGrid.innerHTML = '';
        this.discoveredLinks.clear();

        if (grid) {
            grid.innerHTML = `<div id="status" class="col-span-full text-[10px] text-purple-400 animate-pulse text-center">INICIANDO BUSCA...</div>`;
        }

        // Parallel Extractions
        config.template.forEach(item => {
            this.runExtraction(item, query, grid, globalGrid);
        });

        this.addToHistory(query);
        this.showToast(`Pesquisa iniciada: ${query}`);
    }

    async runExtraction(item, query, statusGrid, feedGrid) {
        let url = "";
        if (item.url) url = item.url.replace('{query}', encodeURIComponent(query));
        else if (item.dork) url = `https://www.google.com/search?q=${encodeURIComponent(item.dork.replace('{query}', query))}`;

        try {
            // Log target found or triggered
            this.addStatusItem(item, url, statusGrid);

            // If it's a dork, try to mine
            if (item.dork) {
                const searchDork = item.dork.replace('{query}', query);
                const api = `https://api.microlink.io?url=${encodeURIComponent(`https://duckduckgo.com/html/?q=${encodeURIComponent(searchDork)}`)}&data.results.selector=.result__title&data.results.type=list&data.results.attr=href`;
                
                const response = await fetch(api);
                const data = await response.json();
                
                if (data.status === 'success' && data.data.results) {
                    data.data.results.forEach(encodedLink => {
                        const link = decodeURIComponent(encodedLink.split('uddg=')[1]?.split('&')[0] || encodedLink);
                        if (link.startsWith('http') && !this.discoveredLinks.has(link)) {
                            this.discoveredLinks.add(link);
                            this.addFeedItem(link, feedGrid);
                        }
                    });
                }
            }
        } catch (e) {
            console.warn("Extraction failed for", item.name, e);
        }
    }

    addStatusItem(item, url, grid) {
        if (!grid) return;
        const div = document.createElement('div');
        div.className = 'bg-slate-900 border border-slate-800 p-2 rounded text-[9px] flex justify-between items-center';
        div.innerHTML = `<span>${item.name}</span><a href="${url}" target="_blank" class="text-purple-400">ABRIR</a>`;
        grid.prepend(div);
    }

    async addFeedItem(link, grid) {
        if (!grid) return;
        const countEl = document.getElementById('globalResultCount');
        
        try {
            const api = `https://api.microlink.io?url=${encodeURIComponent(link)}&meta=true`;
            const response = await fetch(api);
            const data = await response.json();
            
            if (data.status === 'success') {
                const res = data.data;
                const div = document.createElement('div');
                div.className = "glass-card p-3 rounded-xl border border-slate-800 animate-in";
                div.innerHTML = `
                    <h5 class="text-[10px] font-bold text-white truncate">${res.title || 'Registro'}</h5>
                    <p class="text-[8px] text-slate-500 truncate mb-2">${new URL(link).hostname}</p>
                    <a href="${link}" target="_blank" class="text-[9px] text-emerald-400 font-bold hover:underline">VER LINK DIRETO</a>
                `;
                grid.prepend(div);
                if (countEl) countEl.textContent = parseInt(countEl.textContent || '0') + 1;
                this.refreshIcons();
            }
        } catch (e) {}
    }

    addToHistory(query) {
        if (!this.history.includes(query)) {
            this.history.unshift(query);
            this.history = this.history.slice(0, 5);
            localStorage.setItem('osint_history', JSON.stringify(this.history));
            this.renderHistory();
        }
    }

    renderHistory() {
        const list = document.getElementById('historyList');
        if (!list) return;
        if (this.history.length === 0) return;
        list.innerHTML = this.history.map(h => `<span class="bg-slate-900 px-2 py-1 rounded text-[9px] text-slate-500">${h}</span>`).join(' ');
    }

    applyTheme() {
        const body = document.body;
        if (this.currentTheme === 'light') body.classList.add('light-mode');
        else body.classList.remove('light-mode');
        this.refreshIcons();
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('osint_theme', this.currentTheme);
        this.applyTheme();
    }

    clearHistory() {
        this.history = [];
        localStorage.removeItem('osint_history');
        this.renderHistory();
    }

    showToast(msg) {
        const toast = document.getElementById('toast');
        const msgEl = document.getElementById('toastMessage');
        if (!toast || !msgEl) return;
        msgEl.textContent = msg;
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
        setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(20px)'; }, 3000);
    }
}

// Global Launcher
window.addEventListener('load', () => {
    try {
        window.app = new OSINTApp();
        window.app.init();
        console.log("OSINT Toolkit: 100% Ready.");
    } catch (e) {
        alert("Erro Crítico ao iniciar o site: " + e.message);
    }
});
