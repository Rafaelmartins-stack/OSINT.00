/**
 * OSINT Toolkit - Deep Hyper-Mining Engine v1.3
 * Stability: Optimized for Real-time Extraction
 */

const TOOLS_CONFIG = {
    username: {
        title: "Person Search",
        icon: "fingerprint",
        template: [
            { name: "Escavador", url: "https://www.escavador.com/busca?q={query}" },
            { name: "Jusbrasil", url: "https://www.jusbrasil.com.br/busca?q={query}" },
            { name: "LinkedIn", url: "https://www.google.com/search?q=site:linkedin.com/in/ \"{query}\"" },
            { name: "Instagram Dork", dork: 'site:instagram.com "{query}"' },
            { name: "FaceCheck.ID", url: "https://facecheck.id/" }
        ]
    },
    domain: {
        title: "Domain / IP Lookup",
        icon: "globe",
        template: [
            { name: "Who.is", url: "https://who.is/whois/{query}" },
            { name: "VirusTotal", url: "https://www.virustotal.com/gui/search/{query}" },
            { name: "Shodan", url: "https://www.shodan.io/search?query={query}" }
        ]
    },
    dorking: {
        title: "Deep Search & Dorking",
        icon: "search",
        template: [
            { name: "Listas ETEC / SP", dork: 'site:vestibulinho.etec.sp.gov.br OR site:cps.sp.gov.br "{query}"' },
            { name: "Institutos Federais (IF)", dork: 'site:edu.br "{query}" "resultado" OR "classificação"' },
            { name: "Bancas & Vestibulares", dork: '"{query}" site:org.br OR site:com.br "resultado final" OR "lista"' },
            { name: "Portal da Transparência", dork: 'site:transparencia.gov.br "{query}"' },
            { name: "Diário Oficial (União)", dork: 'site:in.gov.br "{query}"' },
            { name: "CNPJ / Empresas", dork: '"{query}" site:cnpj.biz OR site:casadosdados.com.br' },
            { name: "Tribunal Regional (TRF)", dork: 'site:jus.br "{query}" "processo"' },
            { name: "OAB / Advogados", dork: 'site:cna.oab.org.br "{query}"' },
            { name: "CRM / Médicos", dork: 'site:portal.cfm.org.br "{query}"' },
            { name: "Lattes / Acadêmico", dork: 'site:lattes.cnpq.br "{query}"' },
            { name: "Registros Gov (PDF/XLS)", dork: '"{query}" filetype:pdf OR filetype:xls site:gov.br' },
            { name: "Busca Global (Tudo)", dork: '"{query}" -site:twitter.com -site:facebook.com' }
        ]
    },
    email: {
        title: "Mail Intel",
        icon: "mail",
        template: [
            { name: "OSINT Industries", dork: '"{query}" site:osint.industries' },
            { name: "EPIEOS", dork: '"{query}" site:epieos.com' },
            { name: "Gravatar", url: "https://en.gravatar.com/{query}" },
            { name: "LinkedIn Identity", dork: 'site:linkedin.com "{query}"' },
            { name: "Breach Directory", dork: '"{query}" site:breachdirectory.org' }
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
        
        try {
            const saved = localStorage.getItem('osint_history');
            this.history = saved ? JSON.parse(saved) : [];
            this.currentTheme = localStorage.getItem('osint_theme') || 'dark';
        } catch (e) {}
    }

    init() {
        this.setupEventListeners();
        this.renderHistory();
        this.applyTheme();
        this.refreshIcons();
    }

    refreshIcons() {
        if (window.lucide) window.lucide.createIcons();
    }

    setupEventListeners() {
        document.querySelectorAll('.search-btn').forEach(btn => {
            btn.onclick = (e) => this.handleSearch(e.currentTarget.getAttribute('data-type'));
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
        if (!inputEl || !inputEl.value.trim()) return;
        this.executeSearch(type, inputEl.value.trim());
    }

    executeSearch(type, query) {
        const config = TOOLS_CONFIG[type];
        if (!config) return;

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
            grid.innerHTML = `<div id="status" class="col-span-full py-2 text-[10px] text-emerald-400 animate-pulse text-center uppercase font-black tracking-widest">Iniciando Varredura Multi-Fonte...</div>`;
        }

        config.template.forEach(item => {
            this.runExtraction(item, query, grid, globalGrid);
        });

        this.performLiveOSINT(type, query, globalGrid);
        this.addToHistory(query);
        this.showToast(`Motor de extração ativado para: ${query}`);
    }

    async runExtraction(item, query, statusGrid, feedGrid) {
        let url = "";
        if (item.url) url = item.url.replace('{query}', encodeURIComponent(query));
        else if (item.dork) url = `https://www.google.com/search?q=${encodeURIComponent(item.dork.replace('{query}', query))}`;

        this.addStatusItem(item, url, statusGrid);

        if (item.dork) {
            try {
                const searchDork = item.dork.replace('{query}', query);
                // Optimized API call: Just get the links, don't wait for metadata yet
                const api = `https://api.microlink.io?url=${encodeURIComponent(`https://duckduckgo.com/html/?q=${encodeURIComponent(searchDork)}`)}&data.results.selector=.result__a&data.results.type=list&data.results.attr=href`;
                
                const response = await fetch(api);
                const data = await response.json();
                
                if (data.status === 'success' && data.data.results) {
                    data.data.results.forEach(encodedLink => {
                        const link = decodeURIComponent(encodedLink.split('uddg=')[1]?.split('&')[0] || encodedLink);
                        if (link.startsWith('http') && !this.discoveredLinks.has(link)) {
                            this.discoveredLinks.add(link);
                            this.renderFastLink(link, feedGrid);
                        }
                    });
                }
            } catch (e) {}
        }
    }

    addStatusItem(item, url, grid) {
        if (!grid) return;
        const statusArea = document.getElementById('status');
        if (statusArea) statusArea.remove();

        const div = document.createElement('div');
        div.className = 'bg-slate-900/50 border border-slate-800 p-2 rounded text-[9px] flex justify-between items-center group animate-in';
        div.innerHTML = `
            <div class="min-w-0">
                <span class="text-slate-300 font-bold truncate block">${item.name}</span>
                <span class="text-[7px] text-emerald-500 uppercase font-black">Auditando</span>
            </div>
            <a href="${url}" target="_blank" class="text-[8px] bg-slate-800 px-2 py-1 rounded text-slate-400 hover:text-emerald-400 transition-colors">ABRIR</a>
        `;
        grid.appendChild(div);
    }

    renderFastLink(link, grid) {
        if (!grid) return;
        const countEl = document.getElementById('globalResultCount');
        const hostname = new URL(link).hostname;
        
        const div = document.createElement('div');
        div.className = "glass-card p-3 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col gap-2 animate-in relative overflow-hidden group";
        div.innerHTML = `
            <div class="absolute top-0 left-0 w-1 h-full bg-emerald-500/30 group-hover:bg-emerald-500 transition-colors"></div>
            <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center">
                    <i data-lucide="link-2" class="w-3 h-3 text-emerald-400"></i>
                </div>
                <h5 class="text-[9px] font-black text-white truncate uppercase tracking-tighter">${hostname}</h5>
            </div>
            <p class="text-[10px] text-slate-400 line-clamp-2 font-mono break-all">${link}</p>
            <a href="${link}" target="_blank" class="mt-1 text-[9px] bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 py-1.5 rounded text-center font-bold transition-all">
                Acessar Registro Direto
            </a>
        `;
        grid.prepend(div);
        if (countEl) countEl.textContent = parseInt(countEl.textContent || '0') + 1;
        this.refreshIcons();
    }

    async performLiveOSINT(type, query, grid) {
        const username = query.includes('@') ? query.split('@')[0] : query;
        if (type === 'email') {
            this.scanGravatar(query, grid);
        }
        if (type === 'username' || type === 'dorking') {
            SOCIAL_PLATFORMS.forEach(p => this.checkSocial(p, username, grid));
        }
    }

    async checkSocial(platform, handle, grid) {
        const url = platform.url.replace('{query}', handle);
        try {
            const api = `https://api.microlink.io?url=${encodeURIComponent(url)}&meta=true`;
            const response = await fetch(api);
            const data = await response.json();
            if (data.status === 'success' && data.data.title && !data.data.title.toLowerCase().includes('404')) {
                this.renderFastLink(url, grid);
            }
        } catch (e) {}
    }

    async scanGravatar(email, grid) {
        try {
            // Check MD5 via script tag fallback if CryptoJS fails
            const hash = CryptoJS.MD5(email.toLowerCase().trim()).toString();
            const response = await fetch(`https://en.gravatar.com/${hash}.json`);
            if (response.ok) {
                const profile = (await response.json()).entry[0];
                this.renderFastLink(profile.profileUrl, grid);
            }
        } catch(e) {}
    }

    addToHistory(query) {
        this.history = [query, ...this.history.filter(h => h !== query)].slice(0, 8);
        localStorage.setItem('osint_history', JSON.stringify(this.history));
        this.renderHistory();
    }

    renderHistory() {
        const list = document.getElementById('historyList');
        if (list && this.history.length > 0) {
            list.innerHTML = this.history.map(h => `<button class="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[8px] text-slate-500 hover:text-emerald-400 transition-colors uppercase font-bold">${h}</button>`).join(' ');
        }
    }

    applyTheme() {
        document.body.classList.toggle('light-mode', this.currentTheme === 'light');
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
        const list = document.getElementById('historyList');
        if (list) list.innerHTML = `<span class="text-xs text-slate-600 italic">Histórico limpo.</span>`;
    }

    showToast(msg) {
        const toast = document.getElementById('toast');
        const msgEl = document.getElementById('toastMessage');
        if (toast && msgEl) {
            msgEl.textContent = msg;
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
            setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(20px)'; }, 3000);
        }
    }
}

// Global Launcher
window.addEventListener('load', () => {
    window.app = new OSINTApp();
    window.app.init();
});
