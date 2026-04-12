/**
 * OSINT Toolkit - Pure Correlation v2.1 Platinum
 * Engine: String-Matching Discovery (No Handle Guessing)
 */

const TOOLS_CONFIG = {
    username: {
        title: "Person Search",
        icon: "fingerprint",
        template: [
            { name: "Escavador", url: "https://www.escavador.com/busca?q={query}" },
            { name: "Jusbrasil", url: "https://www.jusbrasil.com.br/busca?q={query}" },
            { name: "LinkedIn", dork: 'site:linkedin.com/in/ "{query}"' }
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
            { name: "IFSP / Federal", dork: 'site:ifsp.edu.br "{query}"' }
        ]
    },
    email: {
        title: "Mail Intel (Identity Discovery)",
        icon: "mail",
        template: [
            // PURE CORRELATION DORKS (NO HANDLE GUESSING)
            { id: 'github', name: "GitHub Matches", dork: 'site:github.com "{query}"' },
            { id: 'instagram', name: "Instagram Matches", dork: 'site:instagram.com "{query}"' },
            { id: 'facebook', name: "Facebook Matches", dork: 'site:facebook.com "{query}"' },
            { id: 'twitter', name: "Twitter Matches", dork: 'site:twitter.com "{query}"' },
            { id: 'linkedin', name: "LinkedIn Matches", dork: 'site:linkedin.com "{query}"' },
            { id: 'twitch', name: "Twitch Matches", dork: 'site:twitch.tv "{query}"' },
            { id: 'youtube', name: "YouTube Matches", dork: 'site:youtube.com "{query}"' },
            { id: 'leak', name: "Leak Repositories", dork: '"{query}" password OR "data leak"' }
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
        ['usernameInput', 'domainInput', 'dorkInput', 'emailInput'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.onkeypress = (e) => { if (e.key === 'Enter') this.handleSearch(id.replace('Input', '')); };
        });
    }

    handleSearch(type) {
        const id = type === 'email' ? 'emailInput' : (type === 'username' ? 'usernameInput' : (type === 'dork' ? 'dorkInput' : `${type}Input`));
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
        
        if (resultsSection) resultsSection.classList.remove('hidden');
        if (metaEl) metaEl.textContent = `CORRELAÇÃO: ${query.toUpperCase()}`;

        if (grid) {
            grid.innerHTML = `
                <div id="loader" class="col-span-full py-16 flex flex-col items-center justify-center gap-4 animate-pulse">
                    <div class="relative w-20 h-20">
                        <div class="absolute inset-0 border-4 border-indigo-500/10 rounded-full"></div>
                        <div class="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
                    </div>
                    <p class="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Escaneando Web para Vínculos Diretos...</p>
                </div>
                <div id="confirmedGrid" class="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"></div>
                <div id="statusGrid" class="col-span-full grid grid-cols-2 lg:grid-cols-4 gap-2 opacity-30 border-t border-white/5 pt-8"></div>
            `;
            this.refreshIcons();
        }

        this.discoveredLinks.clear();
        this.addToHistory(query);

        // START DISCOVERY (ONLY FOR EMAILS - NO HANDLE GUESSING)
        if (type === 'email') {
            this.checkGravatar(query);
            config.template.forEach(item => this.performPureCorrelation(item, query));
        } else {
            // Standard person/domain logic
            config.template.forEach(item => {
                if (item.dork) this.mineDorks(item, query);
                else this.renderAuditStatus(item, query);
            });
        }
    }

    /**
     * CORE v2.0 LOGIC: Find actual email mentions on sites
     * This identifies accounts with DIFFERENT handles.
     */
    async performPureCorrelation(item, email) {
        const confirmedGrid = document.getElementById('confirmedGrid');
        const statusGrid = document.getElementById('statusGrid');
        this.renderAuditStatus(item, email, statusGrid);

        try {
            const searchDork = item.dork.replace('{query}', email);
            // Search DuckDuckGo specifically for the literal string
            const searchApi = `https://api.microlink.io?url=${encodeURIComponent(`https://duckduckgo.com/html/?q=${encodeURIComponent(searchDork)}`)}&data.results.selector=.result__a&data.results.type=list&data.results.attr=href`;
            
            const response = await fetch(searchApi);
            const data = await response.json();
            
            if (data.status === 'success' && data.data.results) {
                // For each found URL, crawl its metadata to see the REAL profile name
                data.data.results.forEach(async (encodedLink) => {
                    const link = decodeURIComponent(encodedLink.split('uddg=')[1]?.split('&')[0] || encodedLink);
                    if (link.startsWith('http') && !this.discoveredLinks.has(link)) {
                        this.discoveredLinks.add(link);
                        
                        // Verification: Get the real title of the profile found
                        try {
                            const metaApi = `https://api.microlink.io?url=${encodeURIComponent(link)}&meta=true`;
                            const metaResp = await fetch(metaApi);
                            const metaData = await metaResp.json();
                            
                            if (metaData.status === 'success') {
                                this.renderIdentityCard(link, metaData.data, confirmedGrid);
                            }
                        } catch (e) {
                            // Fallback if metadata fails
                            this.renderIdentityCard(link, { title: new URL(link).hostname }, confirmedGrid);
                        }
                    }
                });
            }
        } catch (e) {}
    }

    renderIdentityCard(link, meta, grid) {
        const loader = document.getElementById('loader');
        if (loader) loader.remove();

        const host = new URL(link).hostname;
        const platform = SOCIAL_PLATFORMS.find(p => host.includes(p.domain)) || { name: host, color: 'bg-slate-700', icon: 'user' };

        const card = document.createElement('div');
        card.className = "glass-card p-6 rounded-3xl border border-indigo-500/40 hover:border-indigo-400 bg-indigo-500/5 transition-all animate-in flex flex-col gap-5";
        card.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="${platform.color} w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl">
                    <i data-lucide="${platform.icon || 'link'}" class="w-8 h-8 text-white"></i>
                </div>
                <div class="min-w-0">
                    <h4 class="text-sm font-black text-white uppercase tracking-widest truncate">${meta.title || platform.name}</h4>
                    <span class="bg-indigo-600/20 text-indigo-400 text-[7px] px-2 py-0.5 rounded-full border border-indigo-500/20 uppercase font-black">Vínculo Direto via E-mail</span>
                </div>
            </div>
            <div class="bg-slate-950/60 p-4 rounded-2xl border border-white/5">
                <p class="text-[8px] text-slate-500 font-mono uppercase font-black mb-1">Caminho da Conta:</p>
                <p class="text-[10px] text-slate-200 font-mono break-all line-clamp-2">${link}</p>
            </div>
            <a href="${link}" target="_blank" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl text-center text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/30 transition-all border border-indigo-400/20 active:scale-95">
                Acessar Perfil Logado
            </a>
        `;
        grid.prepend(card);
        this.refreshIcons();
    }

    renderAuditStatus(item, query, grid) {
        if (!grid) grid = document.getElementById('statusGrid');
        const url = item.url ? item.url.replace('{query}', encodeURIComponent(query)) : `https://www.google.com/search?q=${encodeURIComponent(item.dork.replace('{query}', query))}`;
        const div = document.createElement('div');
        div.className = "bg-slate-900/50 border border-slate-800 p-2.5 rounded-xl flex justify-between items-center group animate-in";
        div.innerHTML = `<span class="text-[8px] text-slate-500 font-bold uppercase truncate">${item.name}</span><a href="${url}" target="_blank"><i data-lucide="external-link" class="w-3.5 h-3.5 text-slate-700 hover:text-white"></i></a>`;
        grid.appendChild(div);
        this.refreshIcons();
    }

    async checkGravatar(email) {
        const grid = document.getElementById('confirmedGrid');
        try {
            const hash = CryptoJS.MD5(email.toLowerCase().trim()).toString();
            const resp = await fetch(`https://en.gravatar.com/${hash}.json`);
            if (resp.ok) {
                const profile = (await resp.json()).entry[0];
                const loader = document.getElementById('loader');
                if (loader) loader.remove();
                
                const card = document.createElement('div');
                card.className = "glass-card p-6 rounded-3xl border border-purple-500/40 animate-in flex flex-col gap-5 bg-purple-500/5";
                card.innerHTML = `
                    <div class="flex items-center gap-4">
                        <img src="${profile.thumbnailUrl}" class="w-16 h-16 rounded-2xl ring-2 ring-purple-500/30 shadow-2xl object-cover">
                        <div>
                            <h4 class="text-sm font-black text-white uppercase tracking-widest">${profile.displayName || 'Vínculo Global'}</h4>
                            <p class="text-[9px] text-purple-400 font-black uppercase">Gravatar ID</p>
                        </div>
                    </div>
                    <a href="${profile.profileUrl}" target="_blank" class="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest transition-all">Ver Identidade Digital</a>`;
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
        if (list) list.innerHTML = this.history.map(h => `<span class="bg-indigo-950/20 border border-indigo-500/20 px-3 py-1.5 rounded-lg text-[9px] text-indigo-400 uppercase font-black">${h}</span>`).join(' ');
    }

    applyTheme() { document.body.classList.toggle('light-mode', this.currentTheme === 'light'); }
}

window.addEventListener('load', () => { window.app = new OSINTApp(); window.app.init(); });
