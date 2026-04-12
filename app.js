/**
 * OSINT Toolkit - Hyper-Match v1.9.0 Platinum
 * Engine: Direct Correlation and Identity Mapping
 */

const TOOLS_CONFIG = {
    username: {
        title: "Person Search",
        icon: "fingerprint",
        template: [
            { name: "Escavador", url: "https://www.escavador.com/busca?q={query}" },
            { name: "Jusbrasil", url: "https://www.jusbrasil.com.br/busca?q={query}" },
            { name: "LinkedIn", dork: 'site:linkedin.com/in/ "{query}"' },
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
            { name: "Diários Oficiais", dork: 'site:in.gov.br "{query}"' }
        ]
    },
    email: {
        title: "Mail Intel Platinum",
        icon: "mail",
        template: [
            { name: "GitHub Link", dork: 'site:github.com "{query}"' },
            { name: "Instagram Link", dork: 'site:instagram.com "{query}"' },
            { name: "LinkedIn Link", dork: 'site:linkedin.com "{query}"' },
            { name: "Facebook Link", dork: 'site:facebook.com "{query}"' },
            { name: "Twitter Link", dork: 'site:twitter.com "{query}"' },
            { name: "EPIEOS", url: "https://epieos.com/?q={query}" },
            { name: "OSINT Industries", url: "https://osint.industries/search?query={query}" }
        ]
    }
};

const SOCIAL_PLATFORMS = [
    { id: 'instagram', name: 'Instagram', icon: 'instagram', color: 'bg-pink-600', domain: 'instagram.com' },
    { id: 'twitter', name: 'Twitter/X', icon: 'twitter', color: 'bg-indigo-500', domain: 'twitter.com' },
    { id: 'tiktok', name: 'TikTok', icon: 'music', color: 'bg-slate-800', domain: 'tiktok.com' },
    { id: 'github', name: 'GitHub', icon: 'github', color: 'bg-slate-700', domain: 'github.com' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin', color: 'bg-blue-700', domain: 'linkedin.com' },
    { id: 'facebook', name: 'Facebook', icon: 'facebook', color: 'bg-blue-600', domain: 'facebook.com' },
    { id: 'youtube', name: 'YouTube', icon: 'youtube', color: 'bg-red-700', domain: 'youtube.com' },
    { id: 'twitch', name: 'Twitch', icon: 'video', color: 'bg-purple-600', domain: 'twitch.tv' }
];

class OSINTApp {
    constructor() {
        this.history = JSON.parse(localStorage.getItem('osint_history') || '[]');
        this.currentTheme = localStorage.getItem('osint_theme') || 'dark';
        this.discoveredLinks = new Set();
        console.log("OSINT Engine v1.9.0 Loaded Successfully.");
    }

    init() {
        this.setupEventListeners();
        this.renderHistory();
        this.applyTheme();
        this.refreshIcons();
    }

    refreshIcons() { if (window.lucide) window.lucide.createIcons(); }

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
        const id = type === 'dork' ? 'dorkInput' : (type === 'email' ? 'emailInput' : (type === 'username' ? 'usernameInput' : `${type}Input`));
        const inputEl = document.getElementById(id);
        if (!inputEl || !inputEl.value.trim()) return;
        this.executeSearch(type === 'dork' ? 'dorking' : type, inputEl.value.trim());
    }

    executeSearch(type, query) {
        const config = TOOLS_CONFIG[type];
        if (!config) return;

        console.log(`Starting deep extraction for [${type}]: ${query}`);

        const resultsSection = document.getElementById('resultsSection');
        const grid = document.getElementById('resultsGrid');
        const metaEl = document.getElementById('resultMeta');
        
        if (resultsSection) resultsSection.classList.remove('hidden');
        if (metaEl) metaEl.textContent = `TARGET: ${query}`;

        if (grid) {
            grid.innerHTML = `
                <div id="loader" class="col-span-full py-16 flex flex-col items-center justify-center gap-4 animate-pulse">
                    <div class="relative w-20 h-20">
                        <div class="absolute inset-0 border-4 border-indigo-500/10 rounded-full"></div>
                        <div class="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
                    </div>
                    <p class="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">Varredura v1.9 em Tempo Real...</p>
                </div>
                <div id="confirmedGrid" class="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 order-1"></div>
                <div id="statusGrid" class="col-span-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 opacity-40 order-2 border-t border-slate-800 pt-8"></div>
            `;
            this.refreshIcons();
        }

        this.discoveredLinks.clear();
        this.addToHistory(query);

        // 1. Instant Digital Identity Detection (Non-Scraping)
        this.instantDetect(query, type);

        // 2. Dork Miner (Deep Web Records)
        config.template.forEach(item => {
            if (item.dork) this.mineDorks(item, query);
            else this.renderAuditStatus(item, query);
        });
    }

    async instantDetect(query, type) {
        const grid = document.getElementById('confirmedGrid');
        const handle = type === 'email' ? query.split('@')[0] : query;

        // Verify gravatar immediately
        if (type === 'email') this.checkGravatar(query, grid);

        // Instant platform checks per social ID
        SOCIAL_PLATFORMS.forEach(async (p) => {
            const profileUrl = `https://${p.domain}/${handle}`;
            try {
                // Use unavatar as a lightning fast verification
                const checkUrl = `https://unavatar.io/${p.id}/${query}`;
                const resp = await fetch(checkUrl, { method: 'HEAD' });
                if (resp.ok) {
                    this.renderResultCard(profileUrl, p.name, grid, p);
                }
            } catch (e) {}
        });
    }

    async mineDorks(item, query) {
        const grid = document.getElementById('confirmedGrid');
        const statusGrid = document.getElementById('statusGrid');
        this.renderAuditStatus(item, query, statusGrid);

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
                        const platform = SOCIAL_PLATFORMS.find(p => link.includes(p.domain)) || { name: 'External Resource', icon: 'link', color: 'bg-indigo-600' };
                        this.renderResultCard(link, platform.name, grid, platform);
                    }
                });
            }
        } catch (e) {}
    }

    renderResultCard(link, platformName, grid, platform) {
        const loader = document.getElementById('loader');
        if (loader) loader.remove();

        const card = document.createElement('div');
        card.className = "glass-card p-6 rounded-3xl border border-indigo-500/30 hover:border-indigo-400 bg-indigo-500/5 transition-all animate-in flex flex-col gap-5 group";
        card.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="${platform.color || 'bg-indigo-600'} w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform">
                    <i data-lucide="${platform.icon || 'user'}" class="w-8 h-8 text-white"></i>
                </div>
                <div>
                    <h4 class="text-sm font-black text-white uppercase tracking-widest">Identidade Confirmada</h4>
                    <p class="text-[10px] text-indigo-400 font-mono font-black mt-1 uppercase">${platformName}</p>
                </div>
            </div>
            <div class="bg-indigo-950/40 p-3 rounded-xl border border-indigo-500/10">
                <p class="text-[8px] text-indigo-500 font-bold uppercase mb-1">Localização do Vínculo:</p>
                <p class="text-[9px] text-slate-300 font-mono break-all line-clamp-2">${link}</p>
            </div>
            <a href="${link}" target="_blank" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl text-center text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 transition-all border border-indigo-400/20">
                Ver Perfil Logar
            </a>
        `;
        grid.prepend(card);
        this.refreshIcons();
    }

    renderAuditStatus(item, query, grid) {
        if (!grid) grid = document.getElementById('statusGrid');
        if (!grid) return;
        const loader = document.getElementById('loader');
        if (loader) loader.remove();
        const url = item.url ? item.url.replace('{query}', encodeURIComponent(query)) : `https://www.google.com/search?q=${encodeURIComponent(item.dork.replace('{query}', query))}`;
        const div = document.createElement('div');
        div.className = "bg-slate-900 border border-slate-800 p-2 rounded-lg flex justify-between items-center group animate-in";
        div.innerHTML = `<span class="text-[8px] text-slate-500 font-bold uppercase truncate">${item.name}</span><a href="${url}" target="_blank"><i data-lucide="external-link" class="w-3 h-3 text-slate-700 hover:text-white"></i></a>`;
        grid.appendChild(div);
        this.refreshIcons();
    }

    async checkGravatar(email, grid) {
        try {
            const hash = CryptoJS.MD5(email.toLowerCase().trim()).toString();
            const response = await fetch(`https://en.gravatar.com/${hash}.json`);
            if (response.ok) {
                const profile = (await response.json()).entry[0];
                const card = document.createElement('div');
                card.className = "glass-card p-6 rounded-3xl border border-purple-500/40 animate-in flex flex-col gap-4 bg-purple-500/5";
                card.innerHTML = `
                    <div class="flex items-center gap-4">
                        <img src="${profile.thumbnailUrl}" class="w-16 h-16 rounded-2xl ring-2 ring-purple-500/30 object-cover shadow-2xl">
                        <div>
                            <h4 class="text-sm font-black text-white uppercase tracking-widest">${profile.displayName || 'Usuário'}</h4>
                            <p class="text-[9px] text-purple-400 font-black uppercase">Gravatar Global</p>
                        </div>
                    </div>
                    <a href="${profile.profileUrl}" target="_blank" class="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest border border-purple-400/20">Acessar Identidade Digital</a>`;
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
        if (list) list.innerHTML = this.history.map(h => `<span class="bg-indigo-950/30 border border-indigo-500/20 px-3 py-1.5 rounded-lg text-[9px] text-indigo-400 uppercase font-black">${h}</span>`).join(' ');
    }

    applyTheme() { document.body.classList.toggle('light-mode', this.currentTheme === 'light'); this.refreshIcons(); }
    toggleTheme() { this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark'; localStorage.setItem('osint_theme', this.currentTheme); this.applyTheme(); }
}

window.addEventListener('load', () => { window.app = new OSINTApp(); window.app.init(); });
