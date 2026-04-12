/**
 * OSINT Toolkit - Classic Unified Engine v1.4
 * Stability: Consolidated Results Grid
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
            { name: "Twitter/X Dork", dork: 'site:twitter.com "{query}"' },
            { name: "FaceCheck.ID", url: "https://facecheck.id/" }
        ]
    },
    domain: {
        title: "Domain / IP Lookup",
        icon: "globe",
        template: [
            { name: "Who.is", url: "https://who.is/whois/{query}" },
            { name: "VirusTotal", url: "https://www.virustotal.com/gui/search/{query}" },
            { name: "Shodan", url: "https://www.shodan.io/search?query={query}" },
            { name: "DNSDumpster", url: "https://dnsdumpster.com/" }
        ]
    },
    dorking: {
        title: "Deep Search & Dorking",
        icon: "search",
        template: [
            { name: "ETEC / CPS", dork: 'site:vestibulinho.etec.sp.gov.br OR site:cps.sp.gov.br "{query}"' },
            { name: "Institutos Federais", dork: 'site:edu.br "{query}" "resultado" OR "classificação"' },
            { name: "Bancas & Vestibulares", dork: '"{query}" site:org.br OR site:com.br "resultado final"' },
            { name: "Transparência Brasil", dork: 'site:transparencia.gov.br "{query}"' },
            { name: "Diários Oficiais", dork: 'site:in.gov.br "{query}"' },
            { name: "CNPJ / Empresas", dork: '"{query}" site:cnpj.biz OR site:casadosdados.com.br' },
            { name: "OAB / CNA", dork: 'site:cna.oab.org.br "{query}"' },
            { name: "CRM / Federal", dork: 'site:portal.cfm.org.br "{query}"' },
            { name: "Lattes / Acadêmico", dork: 'site:lattes.cnpq.br "{query}"' },
            { name: "Gov (PDF/XLS)", dork: '"{query}" filetype:pdf site:gov.br' },
            { name: "Busca Global", dork: '"{query}" -site:twitter.com -site:facebook.com' }
        ]
    },
    email: {
        title: "Mail Intel",
        icon: "mail",
        template: [
            { name: "EPIEOS", dork: '"{query}" site:epieos.com' },
            { name: "OSINT Industries", dork: '"{query}" site:osint.industries' },
            { name: "Gravatar", url: "https://en.gravatar.com/{query}" },
            { name: "LinkedIn", dork: 'site:linkedin.com "{query}"' },
            { name: "Instagram", dork: 'site:instagram.com "{query}"' },
            { name: "Facebook", dork: 'site:facebook.com "{query}"' },
            { name: "Twitter/X", dork: 'site:twitter.com "{query}"' },
            { name: "Breach Directory", dork: '"{query}" site:breachdirectory.org' }
        ]
    }
};

const SOCIAL_PLATFORMS = [
    { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/{query}/', icon: 'instagram', color: 'bg-pink-600' },
    { id: 'twitter', name: 'Twitter/X', url: 'https://twitter.com/{query}', icon: 'twitter', color: 'bg-blue-500' },
    { id: 'tiktok', name: 'TikTok', url: 'https://www.tiktok.com/@{query}', icon: 'music', color: 'bg-slate-800' },
    { id: 'github', name: 'GitHub', url: 'https://github.com/{query}', icon: 'github', color: 'bg-slate-700' },
    { id: 'linkedin', name: 'LinkedIn', url: 'https://www.linkedin.com/in/{query}', icon: 'linkedin', color: 'bg-blue-700' },
    { id: 'facebook', name: 'Facebook', url: 'https://www.facebook.com/{query}', icon: 'facebook', color: 'bg-blue-600' }
];

class OSINTApp {
    constructor() {
        try {
            const saved = localStorage.getItem('osint_history');
            this.history = saved ? JSON.parse(saved) : [];
            this.currentTheme = localStorage.getItem('osint_theme') || 'dark';
        } catch (e) {
            this.history = [];
            this.currentTheme = 'dark';
        }
        this.discoveredLinks = new Set();
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
        const grid = document.getElementById('resultsGrid');
        const metaEl = document.getElementById('resultMeta');
        const titleEl = document.getElementById('resultTitle');
        
        if (resultsSection) resultsSection.classList.remove('hidden');
        if (metaEl) metaEl.textContent = `QUERY: ${query.toUpperCase()}`;
        if (titleEl) titleEl.innerHTML = `<i data-lucide="${config.icon}" class="w-4 h-4"></i> ${config.title}`;

        if (grid) {
            grid.innerHTML = `<div id="loader" class="col-span-full py-12 flex flex-col items-center justify-center gap-4 animate-pulse">
                <i data-lucide="shield-search" class="w-12 h-12 text-blue-500"></i>
                <p class="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Minerando Registros e Contas...</p>
            </div>`;
            this.refreshIcons();
        }

        this.discoveredLinks.clear();

        // 1. Kick off standard tools
        config.template.forEach(item => {
            this.fetchToolResult(item, query, grid);
        });

        // 2. Perform deep scans (Socials/Emails)
        this.performDeepLookup(type, query, grid);

        this.addToHistory(query);
        this.showToast(`Investigação iniciada: ${query}`);
    }

    async fetchToolResult(item, query, grid) {
        let url = "";
        if (item.url) url = item.url.replace('{query}', encodeURIComponent(query));
        else if (item.dork) url = `https://www.google.com/search?q=${encodeURIComponent(item.dork.replace('{query}', query))}`;

        // Add a "Source" card immediately
        this.renderSmallSourceCard(item, url, grid);

        if (item.dork) {
            try {
                const searchDork = item.dork.replace('{query}', query);
                const api = `https://api.microlink.io?url=${encodeURIComponent(`https://duckduckgo.com/html/?q=${encodeURIComponent(searchDork)}`)}&data.results.selector=.result__a&data.results.type=list&data.results.attr=href`;
                
                const response = await fetch(api);
                const data = await response.json();
                
                if (data.status === 'success' && data.data.results) {
                    data.data.results.forEach(encodedLink => {
                        const link = decodeURIComponent(encodedLink.split('uddg=')[1]?.split('&')[0] || encodedLink);
                        if (link.startsWith('http') && !this.discoveredLinks.has(link)) {
                            this.discoveredLinks.add(link);
                            this.renderResultCard(link, grid);
                        }
                    });
                }
            } catch (e) {}
        }
    }

    renderSmallSourceCard(item, url, grid) {
        const loader = document.getElementById('loader');
        if (loader) loader.remove();

        const card = document.createElement('div');
        card.className = "bg-slate-900/50 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3 animate-in hover:border-slate-600 transition-colors";
        card.innerHTML = `
            <div class="min-w-0">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-tighter truncate">${item.name}</p>
                <p class="text-[7px] text-emerald-500 uppercase font-black tracking-widest mt-0.5">Base Auditada</p>
            </div>
            <a href="${url}" target="_blank" class="p-1.5 bg-slate-800 rounded hover:bg-slate-700 transition-colors">
                <i data-lucide="external-link" class="w-3 h-3 text-slate-400"></i>
            </a>
        `;
        grid.appendChild(card);
        this.refreshIcons();
    }

    renderResultCard(link, grid) {
        const hostname = new URL(link).hostname;
        const card = document.createElement('div');
        card.className = "col-span-2 glass-card p-4 rounded-xl border border-emerald-500/20 hover:border-emerald-500/50 transition-all flex flex-col gap-2 animate-in relative group";
        card.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                    <i data-lucide="link" class="w-4 h-4 text-emerald-400"></i>
                </div>
                <div class="min-w-0">
                    <h5 class="text-[10px] font-black text-white truncate uppercase">${hostname}</h5>
                    <p class="text-[8px] text-slate-500 truncate font-mono">${link}</p>
                </div>
            </div>
            <a href="${link}" target="_blank" class="mt-2 text-[9px] bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white py-2 rounded text-center font-bold tracking-widest uppercase transition-all">
                Abrir Registro Encontrado
            </a>
        `;
        grid.prepend(card);
        this.refreshIcons();
    }

    async performDeepLookup(type, query, grid) {
        const handle = query.includes('@') ? query.split('@')[0] : query;
        
        if (type === 'email') {
            this.scanGravatar(query, grid);
            // Scan socials specifically for this email
            SOCIAL_PLATFORMS.forEach(p => this.checkPlatformForAccount(p, handle, grid));
        } else if (type === 'username') {
            SOCIAL_PLATFORMS.forEach(p => this.checkPlatformForAccount(p, handle, grid));
        }
    }

    async checkPlatformForAccount(platform, handle, grid) {
        const url = platform.url.replace('{query}', handle);
        try {
            const api = `https://api.microlink.io?url=${encodeURIComponent(url)}&meta=true`;
            const response = await fetch(api);
            const data = await response.json();
            
            if (data.status === 'success' && data.data.title && !data.data.title.toLowerCase().includes('404')) {
                const res = data.data;
                const card = document.createElement('div');
                card.className = "col-span-2 glass-card p-4 rounded-xl border border-blue-500/30 hover:border-blue-500 transition-all animate-in flex items-center gap-4 group";
                card.innerHTML = `
                    <div class="relative">
                        <img src="${res.image?.url || `https://unavatar.io/${platform.id}/${handle}`}" class="w-12 h-12 rounded-lg object-cover ring-2 ring-blue-500/20 group-hover:ring-blue-500/50 transition-all">
                        <div class="absolute -bottom-1 -right-1 ${platform.color} p-1 rounded-md shadow-lg">
                            <i data-lucide="${platform.icon}" class="w-2.5 h-2.5 text-white"></i>
                        </div>
                    </div>
                    <div class="min-w-0 flex-1">
                        <h4 class="text-xs font-black text-white truncate uppercase tracking-tighter">${res.title || platform.name}</h4>
                        <p class="text-[9px] text-blue-400 font-mono">@${handle}</p>
                        <a href="${url}" target="_blank" class="mt-1 text-[8px] text-slate-500 hover:text-white underline font-bold transition-colors">Ver Perfil Confirmado</a>
                    </div>
                `;
                grid.prepend(card);
                this.refreshIcons();
            }
        } catch (e) {}
    }

    async scanGravatar(email, grid) {
        try {
            const hash = CryptoJS.MD5(email.toLowerCase().trim()).toString();
            const response = await fetch(`https://en.gravatar.com/${hash}.json`);
            if (response.ok) {
                const profile = (await response.json()).entry[0];
                const card = document.createElement('div');
                card.className = "col-span-2 glass-card p-4 rounded-xl border border-purple-500/30 animate-in flex items-center gap-4";
                card.innerHTML = `
                    <img src="${profile.thumbnailUrl}" class="w-12 h-12 rounded-full ring-2 ring-purple-500/30">
                    <div class="min-w-0">
                        <h4 class="text-xs font-black text-white truncate uppercase">${profile.displayName || 'Usuário Gravatar'}</h4>
                        <p class="text-[9px] text-purple-400 font-mono">${email}</p>
                        <a href="${profile.profileUrl}" target="_blank" class="text-[8px] text-slate-500 hover:text-white underline font-bold mt-1 block">Perfil Global Detectado</a>
                    </div>
                `;
                grid.prepend(card);
                this.refreshIcons();
            }
        } catch(e) {}
    }

    addToHistory(query) {
        this.history = [query, ...this.history.filter(h => h !== query)].slice(0, 10);
        localStorage.setItem('osint_history', JSON.stringify(this.history));
        this.renderHistory();
    }

    renderHistory() {
        const list = document.getElementById('historyList');
        if (list) {
            if (this.history.length === 0) {
                list.innerHTML = `<span class="text-xs text-slate-600 italic">Nenhum registro recente.</span>`;
            } else {
                list.innerHTML = this.history.map(h => `<button class="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-[9px] text-slate-500 hover:text-white transition-all hover:bg-slate-800 uppercase font-bold">${h}</button>`).join(' ');
            }
        }
    }

    applyTheme() {
        document.body.classList.toggle('light-mode', this.currentTheme === 'light');
        const icon = document.querySelector('#themeToggle i');
        if (icon) icon.setAttribute('data-lucide', this.currentTheme === 'light' ? 'sun' : 'moon');
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
        if (toast && msgEl) {
            msgEl.textContent = msg;
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
            setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(20px)'; }, 3000);
        }
    }
}

// Launcher
window.addEventListener('load', () => {
    window.app = new OSINTApp();
    window.app.init();
});
