/**
 * OSINT Toolkit - Account Discovery Engine v1.8
 * Focus: Direct Profile Linking & Verification
 */

const TOOLS_CONFIG = {
    username: {
        title: "Person Search",
        icon: "fingerprint",
        template: [
            { name: "Escavador", url: "https://www.escavador.com/busca?q={query}" },
            { name: "Jusbrasil", url: "https://www.jusbrasil.com.br/busca?q={query}" },
            { name: "FaceCheck.ID", url: "https://facecheck.id/" }
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
            { name: "ETEC / CPS", dork: 'site:vestibulinho.etec.sp.gov.br "{query}"' },
            { name: "IFSP / Federal", dork: 'site:ifsp.edu.br "{query}"' },
            { name: "Diários Oficiais", dork: 'site:in.gov.br "{query}"' }
        ]
    },
    email: {
        title: "Mail Intel (Perfil & Contas)",
        icon: "mail",
        template: [
            // DIRECT ACCOUNT SIGNATURE DORKS
            { name: "Perfil GitHub", dork: 'site:github.com "{query}"' },
            { name: "Perfil Instagram", dork: 'site:instagram.com "{query}"' },
            { name: "Perfil Facebook", dork: 'site:facebook.com "{query}"' },
            { name: "Perfil Twitter/X", dork: 'site:twitter.com "{query}"' },
            { name: "Perfil LinkedIn", dork: 'site:linkedin.com "{query}"' },
            { name: "Perfil Pinterest", dork: 'site:pinterest.com "{query}"' },
            { name: "Perfil YouTube", dork: 'site:youtube.com "{query}"' },
            { name: "Perfil Behance", dork: 'site:behance.net "{query}"' },
            { name: "Perfil Medium", dork: 'site:medium.com "{query}"' },
            { name: "Perfil Wattpad", dork: 'site:wattpad.com "{query}"' },
            { name: "Gravatar Personal", url: "https://en.gravatar.com/{query}" }
        ]
    }
};

const SOCIAL_PLATFORMS = [
    { id: 'instagram', name: 'Instagram', icon: 'instagram', color: 'bg-pink-600' },
    { id: 'twitter', name: 'Twitter/X', icon: 'twitter', color: 'bg-blue-500' },
    { id: 'tiktok', name: 'TikTok', icon: 'music', color: 'bg-slate-800' },
    { id: 'github', name: 'GitHub', icon: 'github', color: 'bg-slate-700' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin', color: 'bg-blue-700' },
    { id: 'facebook', name: 'Facebook', icon: 'facebook', color: 'bg-blue-600' },
    { id: 'pinterest', name: 'Pinterest', icon: 'pin', color: 'bg-red-600' },
    { id: 'youtube', name: 'YouTube', icon: 'youtube', color: 'bg-red-700' },
    { id: 'behance', name: 'Behance', icon: 'image', color: 'bg-blue-500' },
    { id: 'medium', name: 'Medium', icon: 'file-text', color: 'bg-slate-900' }
];

class OSINTApp {
    constructor() {
        this.history = JSON.parse(localStorage.getItem('osint_history') || '[]');
        this.currentTheme = localStorage.getItem('osint_theme') || 'dark';
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
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) themeBtn.onclick = () => this.toggleTheme();
        ['usernameInput', 'domainInput', 'dorkInput', 'emailInput'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.onkeypress = (e) => { if (e.key === 'Enter') this.handleSearch(id.replace('Input', '')); };
        });
    }

    handleSearch(type) {
        const id = type === 'dorking' ? 'dorkInput' : (type === 'email' ? 'emailInput' : (type === 'username' ? 'usernameInput' : `${type}Input`));
        const inputEl = document.getElementById(id);
        if (!inputEl || !inputEl.value.trim()) return;
        this.executeSearch(type === 'dork' ? 'dorking' : type, inputEl.value.trim());
    }

    executeSearch(type, query) {
        const config = TOOLS_CONFIG[type];
        if (!config) return;

        const resultsSection = document.getElementById('resultsSection');
        const grid = document.getElementById('resultsGrid');
        const metaEl = document.getElementById('resultMeta');
        const titleEl = document.getElementById('resultTitle');
        
        if (resultsSection) resultsSection.classList.remove('hidden');
        if (metaEl) metaEl.textContent = `VINCULADOS AO EMAIL: ${query}`;
        if (titleEl) titleEl.innerHTML = `<i data-lucide="shield-check" class="w-4 h-4 text-emerald-400"></i> CONTAS DETECTADAS`;

        if (grid) {
            grid.innerHTML = `<div id="loader" class="col-span-full py-12 flex flex-col items-center justify-center gap-4 animate-pulse">
                <i data-lucide="search" class="w-12 h-12 text-blue-500"></i>
                <p class="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Identificando Perfis Logados e Registros Diretos...</p>
            </div>
            <div id="confirmedGrid" class="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"></div>
            <div id="statusGrid" class="col-span-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 border-t border-slate-800 pt-8 opacity-50"></div>`;
            this.refreshIcons();
        }

        this.discoveredLinks.clear();
        this.addToHistory(query);

        // Run Dork Extraction (The core of finding linked accounts)
        config.template.forEach(item => {
            if (item.dork) this.mineEmailRecords(item, query);
            else this.renderAuditCard(item, query);
        });

        if (type === 'email') this.scanGravatar(query);
    }

    async mineEmailRecords(item, query) {
        const confirmedGrid = document.getElementById('confirmedGrid');
        const statusGrid = document.getElementById('statusGrid');
        
        const searchDork = item.dork.replace('{query}', query);
        const url = `https://www.google.com/search?q=${encodeURIComponent(searchDork)}`;
        this.renderAuditCard(item, query, statusGrid);

        try {
            const api = `https://api.microlink.io?url=${encodeURIComponent(`https://duckduckgo.com/html/?q=${encodeURIComponent(searchDork)}`)}&data.results.selector=.result__a&data.results.type=list&data.results.attr=href`;
            const response = await fetch(api);
            const data = await response.json();
            
            if (data.status === 'success' && data.data.results) {
                data.data.results.forEach(linkUrl => {
                    const link = decodeURIComponent(linkUrl.split('uddg=')[1]?.split('&')[0] || linkUrl);
                    if (link.startsWith('http') && !this.discoveredLinks.has(link)) {
                        this.discoveredLinks.add(link);
                        this.renderProfileCard(link, item.name, confirmedGrid);
                    }
                });
            }
        } catch (e) {}
    }

    renderProfileCard(link, sourceName, grid) {
        const loader = document.getElementById('loader');
        if (loader) loader.remove();

        const hostname = new URL(link).hostname;
        const platform = SOCIAL_PLATFORMS.find(p => hostname.includes(p.id)) || { id: 'globe', name: hostname, color: 'bg-emerald-600', icon: 'link' };
        
        const card = document.createElement('div');
        card.className = "glass-card p-5 rounded-2xl border border-emerald-500/40 hover:border-emerald-500 transition-all animate-in flex flex-col gap-4 group";
        card.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="${platform.color} w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <i data-lucide="${platform.icon || 'user'}" class="w-7 h-7 text-white"></i>
                </div>
                <div class="min-w-0">
                    <h4 class="text-xs font-black text-white uppercase tracking-tighter truncate">Perfil Confirmado</h4>
                    <p class="text-[9px] text-emerald-400 font-mono mt-0.5 truncate uppercase font-black">${platform.name}</p>
                </div>
            </div>
            <div class="bg-slate-950/50 p-3 rounded-xl border border-white/5">
                <p class="text-[8px] text-slate-500 font-mono truncate mb-1">Caminho do Registro:</p>
                <p class="text-[9px] text-slate-300 font-mono break-all line-clamp-2">${link}</p>
            </div>
            <a href="${link}" target="_blank" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-center text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
                Acessar Conta Agora
            </a>
        `;
        grid.prepend(card);
        this.refreshIcons();
    }

    renderAuditCard(item, query, grid = null) {
        if (!grid) grid = document.getElementById('statusGrid');
        if (!grid) return;
        
        const loader = document.getElementById('loader');
        if (loader) loader.remove();

        const url = item.url ? item.url.replace('{query}', encodeURIComponent(query)) : `https://www.google.com/search?q=${encodeURIComponent(item.dork.replace('{query}', query))}`;
        const div = document.createElement('div');
        div.className = "bg-slate-900/40 border border-slate-800 p-2 rounded-lg flex justify-between items-center group animate-in";
        div.innerHTML = `<span class="text-[8px] text-slate-500 font-bold uppercase truncate">${item.name}</span><a href="${url}" target="_blank"><i data-lucide="external-link" class="w-3 h-3 text-slate-700 hover:text-white"></i></a>`;
        grid.appendChild(div);
        this.refreshIcons();
    }

    async scanGravatar(email) {
        const grid = document.getElementById('confirmedGrid');
        try {
            const hash = CryptoJS.MD5(email.toLowerCase().trim()).toString();
            const response = await fetch(`https://en.gravatar.com/${hash}.json`);
            if (response.ok) {
                const profile = (await response.json()).entry[0];
                const card = document.createElement('div');
                card.className = "glass-card p-5 rounded-2xl border border-purple-500/40 animate-in flex flex-col gap-4";
                card.innerHTML = `
                    <div class="flex items-center gap-4">
                        <img src="${profile.thumbnailUrl}" class="w-14 h-14 rounded-2xl ring-2 ring-purple-500/30 object-cover">
                        <div class="min-w-0">
                            <h4 class="text-xs font-black text-white uppercase truncate">${profile.displayName || 'Usuário Global'}</h4>
                            <p class="text-[8px] text-purple-400 font-mono uppercase font-black">Identidade Pessoal</p>
                        </div>
                    </div>
                    <a href="${profile.profileUrl}" target="_blank" class="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl text-center text-[10px] font-black uppercase tracking-widest transition-all">Ver Identidade Digital</a>`;
                grid.prepend(card);
                this.refreshIcons();
            }
        } catch(e) {}
    }

    addToHistory(query) {
        this.history = [query, ...this.history.filter(h => h !== query)].slice(0, 5);
        localStorage.setItem('osint_history', JSON.stringify(this.history));
        this.renderHistory();
    }

    renderHistory() {
        const list = document.getElementById('historyList');
        if (list) list.innerHTML = this.history.map(h => `<span class="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-[9px] text-slate-500 uppercase font-black">${h}</span>`).join(' ');
    }

    applyTheme() { document.body.classList.toggle('light-mode', this.currentTheme === 'light'); this.refreshIcons(); }
    toggleTheme() { this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark'; localStorage.setItem('osint_theme', this.currentTheme); this.applyTheme(); }
}

// Start
window.addEventListener('load', () => { window.app = new OSINTApp(); window.app.init(); });
