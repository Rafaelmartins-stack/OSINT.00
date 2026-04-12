/**
 * OSINT Toolkit - Deep Hyper-Mining Engine v1.5
 * Stability: Full Restoration of Sources & Detection
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
            { name: "FaceCheck.ID", url: "https://facecheck.id/" },
            { name: "Telefone Ninja", url: "https://www.telefoneninja.com.br/busca?q={query}" },
            { name: "Consultas Públicas", url: "https://www.consultaspublicas.com.br/busca?q={query}" }
        ]
    },
    domain: {
        title: "Domain / IP Lookup",
        icon: "globe",
        template: [
            { name: "Who.is", url: "https://who.is/whois/{query}" },
            { name: "VirusTotal", url: "https://www.virustotal.com/gui/search/{query}" },
            { name: "Shodan", url: "https://www.shodan.io/search?query={query}" },
            { name: "DNSDumpster", url: "https://dnsdumpster.com/" },
            { name: "Censys", url: "https://search.censys.io/search?q={query}" }
        ]
    },
    dorking: {
        title: "Deep Search & Dorking",
        icon: "search",
        template: [
            { name: "ETEC / CPS", dork: 'site:vestibulinho.etec.sp.gov.br OR site:cps.sp.gov.br "{query}"' },
            { name: "Institutos Federais", dork: 'site:edu.br "{query}" "resultado" OR "classificação"' },
            { name: "Bancas & Vestibulares", dork: '"{query}" site:org.br OR site:com.br "resultado final" OR "lista de chamada"' },
            { name: "Portal da Transparência", dork: 'site:transparencia.gov.br "{query}"' },
            { name: "Diário Oficial (União)", dork: 'site:in.gov.br "{query}"' },
            { name: "CNPJ / Quadro Societário", dork: '"{query}" site:cnpj.biz OR site:casadosdados.com.br' },
            { name: "OAB / CNA", dork: 'site:cna.oab.org.br "{query}"' },
            { name: "CRM / CFM", dork: 'site:portal.cfm.org.br "{query}"' },
            { name: "CREA / Engenheiros", dork: 'site:crea.org.br "{query}"' },
            { name: "Lattes / Acadêmico", dork: 'site:lattes.cnpq.br "{query}"' },
            { name: "Gov (PDF/XLS/DOC)", dork: '"{query}" filetype:pdf OR filetype:xls OR filetype:doc site:gov.br' },
            { name: "Portais Estaduais (SP/RJ/MG)", dork: 'site:sp.gov.br OR site:rj.gov.br OR site:mg.gov.br "{query}"' },
            { name: "Busca Global (Profunda)", dork: '"{query}" -site:twitter.com -site:facebook.com' }
        ]
    },
    email: {
        title: "Mail Intel",
        icon: "mail",
        template: [
            { name: "EPIEOS (Direct)", url: "https://epieos.com/?q={query}", dork: '"{query}" site:epieos.com' },
            { name: "OSINT Industries", url: "https://osint.industries/search?query={query}", dork: '"{query}" site:osint.industries' },
            { name: "Gravatar", url: "https://en.gravatar.com/{query}" },
            { name: "LinkedIn Identity", dork: 'site:linkedin.com "{query}"' },
            { name: "Social Search (Global)", dork: '"{query}" site:instagram.com OR site:facebook.com OR site:twitter.com OR site:github.com' },
            { name: "Breach Directory", url: "https://breachdirectory.org/search?term={query}", dork: '"{query}" site:breachdirectory.org' },
            { name: "Intelligence X", url: "https://intelx.io/?s={query}" },
            { name: "Google Accounts Hub", dork: '"{query}" site:google.com OR site:youtube.com' }
        ]
    }
};

const SOCIAL_PLATFORMS = [
    { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/{query}/', icon: 'instagram', color: 'bg-pink-600' },
    { id: 'twitter', name: 'Twitter/X', url: 'https://twitter.com/{query}', icon: 'twitter', color: 'bg-blue-500' },
    { id: 'tiktok', name: 'TikTok', url: 'https://www.tiktok.com/@{query}', icon: 'music', color: 'bg-slate-800' },
    { id: 'github', name: 'GitHub', url: 'https://github.com/{query}', icon: 'github', color: 'bg-slate-700' },
    { id: 'linkedin', name: 'LinkedIn', url: 'https://www.linkedin.com/in/{query}', icon: 'linkedin', color: 'bg-blue-700' },
    { id: 'facebook', name: 'Facebook', url: 'https://www.facebook.com/{query}', icon: 'facebook', color: 'bg-blue-600' },
    { id: 'pinterest', name: 'Pinterest', url: 'https://www.pinterest.com/{query}/', icon: 'pin', color: 'bg-red-600' },
    { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/@{query}', icon: 'youtube', color: 'bg-red-700' },
    { id: 'twitch', name: 'Twitch', url: 'https://www.twitch.tv/{query}', icon: 'video', color: 'bg-purple-600' },
    { id: 'behance', name: 'Behance', url: 'https://www.behance.net/{query}', icon: 'image', color: 'bg-blue-500' },
    { id: 'spotify', name: 'Spotify', url: 'https://open.spotify.com/user/{query}', icon: 'music', color: 'bg-green-500' },
    { id: 'medium', name: 'Medium', url: 'https://medium.com/@{query}', icon: 'file-text', color: 'bg-slate-900' }
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
        this.activeSearches = 0;
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
        if (metaEl) metaEl.textContent = `INVESTIGANDO: ${query.toUpperCase()}`;
        if (titleEl) titleEl.innerHTML = `<i data-lucide="${config.icon}" class="w-4 h-4"></i> ${config.title}`;

        if (grid) {
            grid.innerHTML = `<div id="loader" class="col-span-full py-12 flex flex-col items-center justify-center gap-4 animate-pulse">
                <div class="relative w-16 h-16">
                    <div class="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                    <div class="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
                    <i data-lucide="shield-search" class="absolute inset-0 m-auto w-6 h-6 text-blue-500"></i>
                </div>
                <p class="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Minerando Redes Sociais e Bancos de Dados...</p>
            </div>`;
            this.refreshIcons();
        }

        this.discoveredLinks.clear();

        // Standard tool buttons
        config.template.forEach(item => {
            this.renderBaseCard(item, query, grid);
        });

        // Parallel Extractions
        const handle = query.includes('@') ? query.split('@')[0] : query;
        this.performDeepSearches(type, query, handle, grid);

        this.addToHistory(query);
        this.showToast(`Investigação iniciada: ${query}`);
    }

    renderBaseCard(item, query, grid) {
        let url = item.url ? item.url.replace('{query}', encodeURIComponent(query)) : `https://www.google.com/search?q=${encodeURIComponent(item.dork.replace('{query}', query))}`;
        
        const card = document.createElement('div');
        card.className = "bg-slate-900/40 border border-slate-800/60 p-3 rounded-lg flex items-center justify-between gap-3 animate-in hover:bg-slate-900/60 transition-all";
        card.innerHTML = `
            <div class="min-w-0">
                <p class="text-[9px] font-black text-slate-500 uppercase truncate">${item.name}</p>
                <div class="flex items-center gap-1.5 mt-0.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span class="text-[7px] text-emerald-500/80 uppercase font-black tracking-widest">Base Conectada</span>
                </div>
            </div>
            <a href="${url}" target="_blank" class="p-1.5 bg-slate-800/50 rounded hover:bg-slate-700 transition-colors">
                <i data-lucide="external-link" class="w-3 h-3 text-slate-400"></i>
            </a>
        `;
        grid.prepend(card);
        this.refreshIcons();
    }

    async performDeepSearches(type, query, handle, grid) {
        // 1. Social Profile Sweep
        SOCIAL_PLATFORMS.forEach(p => this.checkSocialAccount(p, handle, grid));

        // 2. Dork Miner for Document discovery
        const config = TOOLS_CONFIG[type];
        config.template.filter(t => t.dork).forEach(item => this.mineDorkRecords(item, query, grid));

        // 3. Gravatar for Emails
        if (type === 'email') this.scanGravatar(query, grid);
    }

    async checkSocialAccount(platform, handle, grid) {
        const url = platform.url.replace('{query}', handle);
        try {
            const api = `https://api.microlink.io?url=${encodeURIComponent(url)}&meta=true`;
            const response = await fetch(api);
            const data = await response.json();
            
            if (data.status === 'success' && data.data.title && !data.data.title.toLowerCase().includes('404')) {
                this.renderAccountCard(platform, handle, data.data, grid);
            }
        } catch (e) {}
    }

    renderAccountCard(platform, handle, meta, grid) {
        const loader = document.getElementById('loader');
        if (loader) loader.remove();

        const card = document.createElement('div');
        card.className = "col-span-2 glass-card p-4 rounded-xl border border-blue-500/30 hover:border-blue-500 transition-all animate-in flex items-center gap-4 group cursor-default";
        card.innerHTML = `
            <div class="relative flex-shrink-0">
                <img src="${meta.image?.url || `https://unavatar.io/${platform.id}/${handle}`}" 
                     class="w-14 h-14 rounded-xl object-cover ring-2 ring-blue-500/20 group-hover:ring-blue-500/50 transition-all shadow-xl">
                <div class="absolute -bottom-1 -right-1 ${platform.color} p-1.5 rounded-lg shadow-2xl border border-white/10">
                    <i data-lucide="${platform.icon}" class="w-3 h-3 text-white"></i>
                </div>
            </div>
            <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                    <h4 class="text-xs font-black text-white truncate uppercase tracking-tighter">${meta.title || platform.name}</h4>
                    <span class="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[6px] font-black uppercase border border-blue-500/20">Verificado</span>
                </div>
                <p class="text-[9px] text-blue-400 font-mono mt-0.5">@${handle}</p>
                <div class="flex items-center gap-3 mt-2">
                    <a href="${platform.url.replace('{query}', handle)}" target="_blank" class="text-[9px] text-slate-100 font-bold hover:text-blue-400 transition-colors bg-blue-500/10 px-2 py-1 rounded">Ver Perfil</a>
                    <span class="text-[7px] text-slate-500 font-mono truncate">${new URL(platform.url).hostname}</span>
                </div>
            </div>
        `;
        grid.prepend(card);
        this.refreshIcons();
    }

    async mineDorkRecords(item, query, grid) {
        try {
            const searchDork = item.dork.replace('{query}', query);
            const api = `https://api.microlink.io?url=${encodeURIComponent(`https://duckduckgo.com/html/?q=${encodeURIComponent(searchDork)}`)}&data.results.selector=.result__a&data.results.type=list&data.results.attr=href`;
            const response = await fetch(api);
            const data = await response.json();
            
            if (data.status === 'success' && data.data.results) {
                data.data.results.forEach(linkUrl => {
                    const link = decodeURIComponent(linkUrl.split('uddg=')[1]?.split('&')[0] || linkUrl);
                    if (link.startsWith('http') && !this.discoveredLinks.has(link)) {
                        this.discoveredLinks.add(link);
                        this.renderDocumentCard(link, grid);
                    }
                });
            }
        } catch (e) {}
    }

    renderDocumentCard(link, grid) {
        const loader = document.getElementById('loader');
        if (loader) loader.remove();

        const host = new URL(link).hostname;
        const color = host.includes('gov') ? 'border-emerald-500/30' : 'border-slate-800';
        const card = document.createElement('div');
        card.className = `col-span-2 glass-card p-4 rounded-xl border ${color} hover:border-emerald-500/60 transition-all animate-in flex flex-col gap-2`;
        card.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <i data-lucide="file-text" class="w-4 h-4 text-emerald-400"></i>
                </div>
                <div class="min-w-0">
                    <h5 class="text-[9px] font-black text-white truncate uppercase">${host}</h5>
                    <p class="text-[8px] text-slate-500 truncate font-mono">${link}</p>
                </div>
            </div>
            <a href="${link}" target="_blank" class="mt-1 text-[9px] bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white py-1.5 rounded text-center font-black tracking-widest uppercase transition-all border border-emerald-500/20">
                Acessar Documento Direto
            </a>
        `;
        grid.prepend(card);
        this.refreshIcons();
    }

    async scanGravatar(email, grid) {
        try {
            const hash = CryptoJS.MD5(email.toLowerCase().trim()).toString();
            const response = await fetch(`https://en.gravatar.com/${hash}.json`);
            if (response.ok) {
                const profile = (await response.json()).entry[0];
                const loader = document.getElementById('loader');
                if (loader) loader.remove();

                const card = document.createElement('div');
                card.className = "col-span-2 glass-card p-4 rounded-xl border border-purple-500/30 animate-in flex items-center gap-4 bg-purple-500/5";
                card.innerHTML = `
                    <div class="relative">
                        <img src="${profile.thumbnailUrl}" class="w-14 h-14 rounded-full ring-2 ring-purple-500/30">
                        <div class="absolute -bottom-1 -right-1 bg-purple-600 p-1 rounded-full shadow-lg">
                            <i data-lucide="user" class="w-2.5 h-2.5 text-white"></i>
                        </div>
                    </div>
                    <div class="min-w-0 flex-1">
                        <h4 class="text-xs font-black text-white truncate uppercase">${profile.displayName || 'Usuário Gravatar'}</h4>
                        <p class="text-[9px] text-purple-400 font-mono">${profile.preferredUsername || email}</p>
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
            if (this.history.length === 0) list.innerHTML = `<span class="text-xs text-slate-600 italic">Nenhum registro recente.</span>`;
            else list.innerHTML = this.history.map(h => `<button class="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-[9px] text-slate-500 hover:text-white transition-all hover:bg-slate-800 uppercase font-black">${h}</button>`).join(' ');
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

// Full Start
window.addEventListener('load', () => {
    window.app = new OSINTApp();
    window.app.init();
});
