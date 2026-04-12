/**
 * OSINT Toolkit - Deep Discovery Engine v1.6
 * Stability: Aggressive Social Link Correlation
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
            { name: "FaceCheck.ID (Photo Search)", url: "https://facecheck.id/" }
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
            { name: "ETEC / CPS", dork: 'site:vestibulinho.etec.sp.gov.br OR site:cps.sp.gov.br "{query}"' },
            { name: "IFSP / Federal", dork: 'site:ifsp.edu.br "{query}" "resultado"' },
            { name: "Diários Oficiais", dork: 'site:in.gov.br "{query}"' },
            { name: "Transparência Brasil", dork: 'site:transparencia.gov.br "{query}"' },
            { name: "Empresas / CNPJ", dork: '"{query}" site:cnpj.biz OR site:casadosdados.com.br' }
        ]
    },
    email: {
        title: "Mail Intel",
        icon: "mail",
        template: [
            { name: "EPIEOS", dork: '"{query}" site:epieos.com' },
            { name: "OSINT Industries", dork: '"{query}" site:osint.industries' },
            { name: "Gravatar", url: "https://en.gravatar.com/{query}" },
            { name: "LinkedIn Identity", dork: 'site:linkedin.com "{query}"' },
            { name: "Breach Directory", url: "https://breachdirectory.org/search?term={query}" }
        ]
    }
};

const SOCIAL_PLATFORMS = [
    { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/{query}/', icon: 'instagram', color: 'bg-pink-600' },
    { id: 'twitter', name: 'Twitter/X', url: 'https://twitter.com/{query}', icon: 'twitter', color: 'bg-blue-500' },
    { id: 'tiktok', name: 'TikTok', url: 'https://www.tiktok.com/@{query}', icon: 'music', color: 'bg-slate-800' },
    { id: 'github', name: 'GitHub', url: 'https://github.com/{query}', icon: 'github', color: 'bg-slate-700' },
    { id: 'twitch', name: 'Twitch', url: 'https://www.twitch.tv/{query}', icon: 'video', color: 'bg-purple-600' },
    { id: 'facebook', name: 'Facebook', url: 'https://www.facebook.com/{query}', icon: 'facebook', color: 'bg-blue-600' },
    { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/@{query}', icon: 'youtube', color: 'bg-red-700' }
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
        if (metaEl) metaEl.textContent = `VINCULAÇÕES PARA: ${query.toUpperCase()}`;
        if (titleEl) titleEl.innerHTML = `<i data-lucide="${config.icon}" class="w-4 h-4"></i> ${config.title}`;

        if (grid) {
            grid.innerHTML = `<div id="loader" class="col-span-full py-10 flex flex-col items-center justify-center gap-4 animate-pulse">
                <i data-lucide="shield-search" class="w-12 h-12 text-blue-500"></i>
                <p class="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Minerando Contas e Perfis Relacionados...</p>
            </div>`;
            this.refreshIcons();
        }

        this.discoveredLinks.clear();

        // Standard tool cards
        config.template.forEach(item => this.renderBaseCard(item, query, grid));

        // Start Deep Scans
        if (type === 'email') {
            this.scanEmailSocialLinks(query, grid);
            this.scanGravatar(query, grid);
        } else if (type === 'username') {
            const handle = query.includes('@') ? query.split('@')[0] : query;
            SOCIAL_PLATFORMS.forEach(p => this.verifyAccountByHandle(p, handle, grid));
        }

        this.addToHistory(query);
        this.showToast(`Motor de rastreamento ativado.`);
    }

    /**
     * SEARCH SITES FOR THE EMAIL STRING
     * This finds accounts that aren't just prefix/handle based.
     */
    async scanEmailSocialLinks(email, grid) {
        const handle = email.split('@')[0];
        
        // 1. Direct handle-based verification (Fast)
        SOCIAL_PLATFORMS.forEach(p => this.verifyAccountByHandle(p, handle, grid));

        // 2. Deep Dork Investigation for the FULL EMAIL
        // Search specific platforms for the email string
        SOCIAL_PLATFORMS.forEach(async (platform) => {
            try {
                const searchDork = `site:${new URL(platform.url).hostname} "${email}"`;
                const api = `https://api.microlink.io?url=${encodeURIComponent(`https://duckduckgo.com/html/?q=${encodeURIComponent(searchDork)}`)}&data.results.selector=.result__a&data.results.type=list&data.results.attr=href`;
                
                const response = await fetch(api);
                const data = await response.json();
                
                if (data.status === 'success' && data.data.results && data.data.results.length > 0) {
                    data.data.results.forEach(link => {
                        if (!this.discoveredLinks.has(link)) {
                            this.discoveredLinks.add(link);
                            this.renderInferredAccount(platform, link, email, grid);
                        }
                    });
                }
            } catch (e) {}
        });
    }

    async verifyAccountByHandle(platform, handle, grid) {
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
                <h4 class="text-xs font-black text-white truncate uppercase tracking-tighter">${meta.title || platform.name}</h4>
                <p class="text-[9px] text-blue-400 font-mono mt-0.5">@${handle}</p>
                <div class="flex items-center gap-3 mt-2">
                    <a href="${platform.url.replace('{query}', handle)}" target="_blank" class="text-[9px] text-slate-100 font-bold hover:text-blue-400 transition-colors bg-blue-500/10 px-2 py-1 rounded">Ver Perfil</a>
                    <span class="text-[7px] text-slate-500 font-mono uppercase font-black">Link Confirmado</span>
                </div>
            </div>
        `;
        grid.prepend(card);
        this.refreshIcons();
    }

    renderInferredAccount(platform, link, email, grid) {
        const loader = document.getElementById('loader');
        if (loader) loader.remove();

        const card = document.createElement('div');
        card.className = "col-span-2 glass-card p-4 rounded-xl border border-emerald-500/30 animate-in flex items-center gap-4 cursor-default";
        card.innerHTML = `
            <div class="relative flex-shrink-0">
                <img src="https://unavatar.io/${platform.id}/${email}" 
                     class="w-14 h-14 rounded-xl object-cover ring-2 ring-emerald-500/20 shadow-xl">
                <div class="absolute -bottom-1 -right-1 ${platform.color} p-1.5 rounded-lg border border-white/10">
                    <i data-lucide="${platform.icon}" class="w-3 h-3 text-white"></i>
                </div>
            </div>
            <div class="min-w-0 flex-1">
                <h4 class="text-xs font-black text-white truncate uppercase tracking-tighter">Vínculo Detectado</h4>
                <p class="text-[9px] text-emerald-400 font-mono mt-0.5">${email}</p>
                <div class="flex items-center gap-3 mt-2">
                    <a href="${link}" target="_blank" class="text-[9px] text-slate-100 font-bold hover:text-emerald-400 transition-colors bg-emerald-500/10 px-2 py-1 rounded">Abrir Perfil</a>
                    <span class="text-[7px] text-slate-500 font-mono uppercase font-black">Descoberta Profunda</span>
                </div>
            </div>
        `;
        grid.prepend(card);
        this.refreshIcons();
    }

    renderBaseCard(item, query, grid) {
        let url = item.url ? item.url.replace('{query}', encodeURIComponent(query)) : `https://www.google.com/search?q=${encodeURIComponent(item.dork.replace('{query}', query))}`;
        const card = document.createElement('div');
        card.className = "bg-slate-900 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between gap-3 animate-in hover:border-slate-700 transition-all";
        card.innerHTML = `
            <div class="min-w-0"><p class="text-[9px] font-black text-slate-500 uppercase truncate">${item.name}</p></div>
            <a href="${url}" target="_blank"><i data-lucide="external-link" class="w-3.5 h-3.5 text-slate-600 hover:text-white"></i></a>
        `;
        grid.appendChild(card);
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
                    <div class="relative"><img src="${profile.thumbnailUrl}" class="w-14 h-14 rounded-full ring-2 ring-purple-500/30"></div>
                    <div class="min-w-0 flex-1">
                        <h4 class="text-xs font-black text-white truncate uppercase">${profile.displayName || 'Usuário Gravatar'}</h4>
                        <p class="text-[9px] text-purple-400 font-mono">${email}</p>
                        <a href="${profile.profileUrl}" target="_blank" class="text-[8px] text-slate-500 hover:text-white underline font-bold mt-1 block">Identidade Digital Global</a>
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
            if (this.history.length === 0) list.innerHTML = `<span class="text-xs text-slate-600 italic">Nenhum registro.</span>`;
            else list.innerHTML = this.history.map(h => `<button class="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-[9px] text-slate-500 hover:text-white transition-all hover:bg-slate-800 uppercase font-bold">${h}</button>`).join(' ');
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
