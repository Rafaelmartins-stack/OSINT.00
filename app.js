/**
 * OSINT Toolkit - Email Pivot Engine v1.7
 * Specialization: Pure Email-to-Account Correlation
 */

const TOOLS_CONFIG = {
    username: {
        title: "Person Search",
        icon: "fingerprint",
        template: [
            { name: "Escavador", url: "https://www.escavador.com/busca?q={query}" },
            { name: "Jusbrasil", url: "https://www.jusbrasil.com.br/busca?q={query}" },
            { name: "LinkedIn", dork: 'site:linkedin.com/in/ "{query}"' },
            { name: "Instagram", dork: 'site:instagram.com "{query}"' },
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
            { name: "Institutos Federais", dork: 'site:edu.br "{query}" "resultado"' },
            { name: "Diários Oficiais", dork: 'site:in.gov.br "{query}"' }
        ]
    },
    email: {
        title: "Mail Intel (Account Discovery)",
        icon: "mail",
        template: [
            // HEAVY DORKS FOR EMAIL REGISTRATION
            { name: "GitHub Accounts", dork: 'site:github.com "{query}"' },
            { name: "Instagram Profiles", dork: 'site:instagram.com "{query}"' },
            { name: "Facebook Profiles", dork: 'site:facebook.com "{query}"' },
            { name: "Twitter/X Linking", dork: 'site:twitter.com "{query}"' },
            { name: "LinkedIn Identity", dork: 'site:linkedin.com "{query}"' },
            { name: "Gravatar (Global)", url: "https://en.gravatar.com/{query}" },
            { name: "EPIEOS (Direct Search)", url: "https://epieos.com/?q={query}" },
            { name: "OSINT Industries (Direct Search)", url: "https://osint.industries/search?query={query}" },
            { name: "Leak Check (Google Dork)", dork: '"{query}" password OR "data breach" OR leak' },
            { name: "Social Media Master Dork", dork: '"{query}" (site:instagram.com OR site:facebook.com OR site:tiktok.com OR site:twitter.com)' }
        ]
    }
};

const SOCIAL_PLATFORMS = [
    { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/{query}/', icon: 'instagram', color: 'bg-pink-600' },
    { id: 'twitter', name: 'Twitter/X', url: 'https://twitter.com/{query}', icon: 'twitter', color: 'bg-blue-500' },
    { id: 'tiktok', name: 'TikTok', url: 'https://www.tiktok.com/@{query}', icon: 'music', color: 'bg-slate-800' },
    { id: 'github', name: 'GitHub', url: 'https://github.com/{query}', icon: 'github', color: 'bg-slate-700' },
    { id: 'twitch', name: 'Twitch', url: 'https://www.twitch.tv/{query}', icon: 'video', color: 'bg-purple-600' },
    { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/@{query}', icon: 'youtube', color: 'bg-red-700' }
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
        if (metaEl) metaEl.textContent = `Vínculos do E-mail: ${query.toUpperCase()}`;
        if (titleEl) titleEl.innerHTML = `<i data-lucide="${config.icon}" class="w-4 h-4"></i> ${config.title}`;

        if (grid) {
            grid.innerHTML = `<div id="loader" class="col-span-full py-20 flex flex-col items-center justify-center gap-4 animate-pulse">
                <i data-lucide="shield-search" class="w-12 h-12 text-blue-500"></i>
                <p class="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 text-center px-4">Analisando Registros de Contas para este E-mail...</p>
            </div>`;
            this.refreshIcons();
        }

        this.discoveredLinks.clear();

        // 1. Kick off Dork Miner (THE MOST POWERFUL PART FOR EMAILS)
        config.template.forEach(item => {
            this.runExtraction(item, query, grid);
        });

        // 2. Pivot search for Gravatar if it's an email
        if (type === 'email') this.scanGravatar(query, grid);

        this.addToHistory(query);
    }

    async runExtraction(item, query, grid) {
        let url = item.url ? item.url.replace('{query}', encodeURIComponent(query)) : `https://www.google.com/search?q=${encodeURIComponent(item.dork.replace('{query}', query))}`;

        // Just add the basic indicator
        this.addToolStatus(item, url, grid);

        if (item.dork) {
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
                            this.renderFoundAccount(link, item.name, grid);
                        }
                    });
                }
            } catch (e) {}
        }
    }

    addToolStatus(item, url, grid) {
        const loader = document.getElementById('loader');
        if (loader) loader.remove();

        const card = document.createElement('div');
        card.className = "bg-slate-900/60 border border-slate-800 p-3 rounded-lg flex items-center justify-between gap-3 animate-in hover:border-slate-700 transition-all";
        card.innerHTML = `
            <div class="min-w-0">
                <p class="text-[9px] font-black text-slate-400 uppercase truncate">${item.name}</p>
                <div class="flex items-center gap-1.5 mt-0.5"><span class="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></span> <span class="text-[7px] text-blue-400 uppercase font-black">Escaneando Registro</span></div>
            </div>
            <a href="${url}" target="_blank"><i data-lucide="external-link" class="w-3.5 h-3.5 text-slate-500 hover:text-white"></i></a>
        `;
        grid.appendChild(card);
        this.refreshIcons();
    }

    renderFoundAccount(link, sourceName, grid) {
        const hostname = new URL(link).hostname;
        const platform = SOCIAL_PLATFORMS.find(p => hostname.includes(p.id)) || { id: 'globe', name: hostname, color: 'bg-slate-700', icon: 'link' };
        
        const card = document.createElement('div');
        card.className = "col-span-2 glass-card p-4 rounded-xl border border-emerald-500/40 hover:border-emerald-500 transition-all animate-in flex items-center gap-4 group";
        card.innerHTML = `
            <div class="relative flex-shrink-0">
                <div class="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center ring-2 ring-emerald-500/20 shadow-2xl">
                    <i data-lucide="${platform.icon || 'link'}" class="w-6 h-6 text-emerald-400"></i>
                </div>
                <div class="absolute -bottom-1 -right-1 ${platform.color || 'bg-emerald-600'} p-1.5 rounded-lg border border-white/10 shadow-lg">
                    <i data-lucide="check-circle" class="w-2.5 h-2.5 text-white"></i>
                </div>
            </div>
            <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                    <h4 class="text-xs font-black text-white truncate uppercase tracking-tighter">Conta Vinculada Detectada</h4>
                </div>
                <p class="text-[9px] text-emerald-400 font-mono mt-0.5 truncate">${hostname}</p>
                <div class="flex items-center gap-3 mt-2">
                    <a href="${link}" target="_blank" class="text-[9px] text-slate-100 font-bold bg-emerald-600/20 px-3 py-1.5 rounded border border-emerald-500/30 hover:bg-emerald-600 transition-all">Ver Link Direto</a>
                    <span class="text-[7px] text-slate-500 font-mono uppercase font-black">Match via ${sourceName}</span>
                </div>
            </div>
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
                const card = document.createElement('div');
                card.className = "col-span-2 glass-card p-4 rounded-xl border border-purple-500/40 animate-in flex items-center gap-4 bg-purple-500/5";
                card.innerHTML = `
                    <div class="relative flex-shrink-0"><img src="${profile.thumbnailUrl}" class="w-14 h-14 rounded-xl ring-2 ring-purple-500/30 object-cover shadow-2xl"></div>
                    <div class="min-w-0 flex-1">
                        <h4 class="text-xs font-black text-white truncate uppercase tracking-tighter">Perfil Global Detectado</h4>
                        <p class="text-[9px] text-purple-400 font-mono">${profile.displayName || email}</p>
                        <a href="${profile.profileUrl}" target="_blank" class="text-[9px] text-slate-100 font-bold bg-purple-600/20 px-3 py-1.5 rounded border border-purple-500/30 mt-2 block w-max">Abrir Identidade Digital</a>
                    </div>
                `;
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
        if (list) {
            list.innerHTML = this.history.map(h => `<button class="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-[9px] text-slate-500 hover:text-white transition-all uppercase font-black">${h}</button>`).join(' ');
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
}

// Global Launcher
window.addEventListener('load', () => {
    window.app = new OSINTApp();
    window.app.init();
});
