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
        title: "Deep Search & Dorking",
        icon: "search",
        description: "Bases de dados oficiais e motor de extração automatizada de registros.",
        template: [
            { name: "Listas ETEC / SP (Direto)", dork: 'site:vestibulinho.etec.sp.gov.br OR site:cps.sp.gov.br "{query}" "lista de classificação"' },
            { name: "Institutos Federais (IFSP/IF)", dork: 'site:ifsp.edu.br OR site:*.edu.br "{query}" "resultado" OR "classificação"' },
            { name: "Bancas & Vestibulares", dork: '"{query}" site:org.br OR site:com.br "resultado final" OR "lista de convocação" OR "aprovados"' },
            { name: "Jusbrasil (Processos)", url: "https://www.jusbrasil.com.br/busca?q={query}", dork: 'site:jusbrasil.com.br "{query}"' },
            { name: "Escavador (Histórico)", url: "https://www.escavador.com/busca?q={query}", dork: 'site:escavador.com "{query}"' },
            { name: "Portal da Transparência", dork: 'site:transparencia.gov.br "{query}"' },
            { name: "Diário Oficial (União)", dork: 'site:in.gov.br "{query}"' },
            { name: "CNPJ / Quadro Societário", dork: '"{query}" site:cnpj.biz OR site:casadosdados.com.br' },
            { name: "Tribunal Regional (TRF1)", dork: 'site:trf1.jus.br "{query}"' },
            { name: "Tribunal Regional (TRF2)", dork: 'site:trf2.jus.br "{query}"' },
            { name: "Tribunal Regional (TRF3)", dork: 'site:trf3.jus.br "{query}"' },
            { name: "Tribunal Regional (TRF4)", dork: 'site:trf4.jus.br "{query}"' },
            { name: "Tribunal Regional (TRF5)", dork: 'site:trf5.jus.br "{query}"' },
            { name: "Advogados (CNA/OAB)", dork: 'site:cna.oab.org.br "{query}"' },
            { name: "Médicos (Portal CRM)", dork: 'site:portal.cfm.org.br "{query}"' },
            { name: "Engenheiros (CREA)", dork: 'site:crea.org.br "{query}"' },
            { name: "Contadores (CFC)", dork: 'site:cfc.org.br "{query}"' },
            { name: "Dentistas (CFO)", dork: 'site:cfo.org.br "{query}"' },
            { name: "Transparência (SP)", dork: 'site:transparencia.sp.gov.br "{query}"' },
            { name: "Transparência (RJ)", dork: 'site:transparencia.rj.gov.br "{query}"' },
            { name: "Transparência (MG)", dork: 'site:transparencia.mg.gov.br "{query}"' },
            { name: "Transparência (RS)", dork: 'site:transparencia.rs.gov.br "{query}"' },
            { name: "MEC / Sisu Aprovados", dork: 'site:mec.gov.br "{query}"' },
            { name: "Acadêmico (Lattes)", dork: 'site:lattes.cnpq.br "{query}"' },
            { name: "Convocação / Aprovados", dork: '"{query}" "lista de chamada" OR "lista de convocação" OR "resultado final" 2024 2025' },
            { name: "Registros Gov (PDF/XLS)", dork: '"{query}" filetype:pdf OR filetype:xls OR filetype:doc site:gov.br' },
            { name: "Busca Global (Tudo)", dork: '"{query}" -site:twitter.com -site:facebook.com' }
        ]
    },
    email: {
        title: "Mail Intel",
        icon: "mail",
        description: "Encontre perfis e contas em redes sociais vinculadas diretamente a este e-mail.",
        template: [
            { name: "OSINT Industries (100+ Sites)", url: "https://osint.industries/search?query={query}", dork: '"{query}" site:osint.industries' },
            { name: "EPIEOS (Google/Social Link)", url: "https://epieos.com/?q={query}", dork: '"{query}" site:epieos.com' },
            { name: "Gravatar (Verified Assets)", url: "https://en.gravatar.com/{query}", dork: '"{query}" site:gravatar.com' },
            { name: "LinkedIn Identity", url: "https://www.google.com/search?q=site:linkedin.com \"{query}\"", dork: 'site:linkedin.com "{query}"' },
            { name: "Instagram / Social Dork", dork: '"{query}" site:instagram.com OR site:facebook.com OR site:tiktok.com' },
            { name: "Breach Directory (Leaks)", url: "https://breachdirectory.org/search?term={query}", dork: '"{query}" site:breachdirectory.org' }
        ]
    }
};

const SOCIAL_PLATFORMS = [
    { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/{query}/', icon: 'instagram', color: 'from-pink-500 to-purple-500' },
    { id: 'twitter', name: 'Twitter/X', url: 'https://twitter.com/{query}', icon: 'twitter', color: 'from-blue-400 to-blue-600' },
    { id: 'tiktok', name: 'TikTok', url: 'https://www.tiktok.com/@{query}', icon: 'music', color: 'from-slate-900 to-slate-700' },
    { id: 'github', name: 'GitHub', url: 'https://github.com/{query}', icon: 'github', color: 'from-slate-800 to-black' },
    { id: 'linkedin', name: 'LinkedIn', url: 'https://www.linkedin.com/in/{query}', icon: 'linkedin', color: 'from-blue-700 to-blue-800' },
    { id: 'pinterest', name: 'Pinterest', url: 'https://www.pinterest.com/{query}/', icon: 'pin', color: 'from-red-600 to-red-500' },
    { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/@{query}', icon: 'youtube', color: 'from-red-700 to-red-800' },
    { id: 'twitch', name: 'Twitch', url: 'https://www.twitch.tv/{query}', icon: 'video', color: 'from-purple-600 to-purple-700' },
    { id: 'behance', name: 'Behance', url: 'https://www.behance.net/{query}', icon: 'image', color: 'from-blue-500 to-blue-600' },
    { id: 'spotify', name: 'Spotify', url: 'https://open.spotify.com/user/{query}', icon: 'music', color: 'from-green-500 to-green-600' },
    { id: 'medium', name: 'Medium', url: 'https://medium.com/@{query}', icon: 'file-text', color: 'from-slate-900 to-black' },
    { id: 'vimeo', name: 'Vimeo', url: 'https://vimeo.com/{query}', icon: 'play', color: 'from-blue-400 to-blue-500' }
];

class OSINTApp {
    constructor() {
        try {
            const saved = localStorage.getItem('osint_history');
            this.history = saved ? JSON.parse(saved) : [];
        } catch (e) {
            this.history = [];
        }
        
        this.currentIntel = { emails: new Set(), phones: new Set(), handles: new Set() };
        this.currentTheme = localStorage.getItem('osint_theme') || 'dark';
        this.scannedHandles = new Set();
        this.discoveredLinks = new Set();
        this.activeExtractions = 0;
        
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        try {
            this.setupEventListeners();
            this.renderHistory();
            this.applyTheme();
            this.refreshIcons();
            console.log("OSINT Toolkit Initialized");
        } catch (e) {
            console.error("Initialization Failed:", e);
        }
    }

    refreshIcons() {
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    }

    setupEventListeners() {
        document.querySelectorAll('.search-btn').forEach(btn => {
            btn.onclick = (e) => {
                const type = e.currentTarget.getAttribute('data-type');
                this.handleSearch(type);
            };
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
        if (!inputEl) return;

        const query = inputEl.value.trim();
        if (!query) {
            this.showToast('Digite um alvo para investigar.', 'error');
            return;
        }

        this.executeSearch(type, query);
    }

    executeSearch(type, query) {
        const config = TOOLS_CONFIG[type];
        if (!config) return;

        const resultsSection = document.getElementById('resultsSection');
        const grid = document.getElementById('resultsGrid');
        const globalGrid = document.getElementById('globalFindingsGrid');
        const investigationSection = document.getElementById('investigationSection');
        const resultCountEl = document.getElementById('globalResultCount');
        
        if (!grid || !globalGrid) return;
        
        if (resultsSection) resultsSection.classList.remove('hidden');
        if (investigationSection) investigationSection.classList.remove('hidden');
        
        const metaEl = document.getElementById('resultMeta');
        if (metaEl) metaEl.textContent = `ALVO: ${query.toUpperCase()}`;

        const titleEl = document.getElementById('resultTitle');
        if (titleEl) titleEl.innerHTML = `<i data-lucide="${config.icon}" class="w-5 h-5"></i> ${config.title} - Resultados`;

        this.discoveredLinks.clear();
        this.activeExtractions = 0;
        if (resultCountEl) resultCountEl.textContent = '0';
        globalGrid.innerHTML = '';
        
        grid.innerHTML = `
            <div id="searchingArea" class="col-span-full border border-slate-800 rounded-xl p-4 text-center animate-pulse bg-slate-900/40">
                <div class="flex items-center justify-center gap-3">
                    <i data-lucide="shield-search" class="w-4 h-4 text-purple-400"></i>
                    <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Extração Direta em 40+ Fontes...</span>
                </div>
            </div>
        `;
        this.refreshIcons();

        config.template.forEach(item => {
            this.activeExtractions++;
            this.validateAndRender(item, query, grid, globalGrid);
        });

        this.performLiveOSINT(type, query, globalGrid);
        this.addToHistory(type, query);
        this.refreshIcons();

        if (investigationSection) investigationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.showToast(`Hiper-mineração iniciada para: ${query}`, 'info');
    }

    async validateAndRender(item, query, grid, globalGrid) {
        let finalUrl = '';
        if (item.url) finalUrl = item.url.split('{query}').join(encodeURIComponent(query));
        else if (item.dork) finalUrl = `https://www.google.com/search?q=${encodeURIComponent(item.dork.split('{query}').join(query))}`;

        if (item.dork) {
            try {
                const searchDork = item.dork.split('{query}').join(query);
                const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(searchDork)}`;
                const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(searchUrl)}&data.results.selector=.result__title&data.results.type=list`);
                const data = await response.json();
                
                if (data.status === 'success' && data.data.results && data.data.results.length > 0) {
                    this.renderToolStatus(item, finalUrl, grid);
                    this.mineDorkResults(searchDork, globalGrid);
                }
            } catch (e) {
            } finally {
                this.activeExtractions--;
                if (this.activeExtractions <= 0) {
                    const searchArea = document.getElementById('searchingArea');
                    if (searchArea) searchArea.remove();
                }
            }
        }
    }

    renderToolStatus(item, url, grid) {
        const card = document.createElement('div');
        card.className = 'bg-slate-900/50 border border-slate-800 p-2 rounded-lg flex items-center justify-between gap-3 animate-in';
        card.innerHTML = `
            <div class="min-w-0">
                <p class="text-[9px] font-bold text-slate-300 truncate">${item.name}</p>
                <p class="text-[7px] text-emerald-500 font-mono uppercase tracking-widest mt-0.5">Ativo</p>
            </div>
            <a href="${url}" target="_blank" class="text-slate-500 hover:text-emerald-400"><i data-lucide="external-link" class="w-3.5 h-3.5"></i></a>
        `;
        grid.prepend(card);
        this.refreshIcons();
    }

    async mineDorkResults(dork, grid) {
        try {
            const countEl = document.getElementById('globalResultCount');
            const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(dork)}`;
            const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(searchUrl)}&data.results.selector=.result__title&data.results.type=list&data.results.attr=href`);
            const data = await response.json();
            
            if (data.status === 'success' && data.data.results) {
                data.data.results.slice(0, 15).forEach(async (encodedLink) => {
                    const link = decodeURIComponent(encodedLink.split('uddg=')[1]?.split('&')[0] || encodedLink);
                    if (link.startsWith('http') && !this.discoveredLinks.has(link)) {
                        this.discoveredLinks.add(link);
                        
                        const metaRes = await fetch(`https://api.microlink.io?url=${encodeURIComponent(link)}&meta=true`);
                        const metaData = await metaRes.json();
                        
                        if (metaData.status === 'success') {
                            const res = metaData.data;
                            if (countEl) countEl.textContent = parseInt(countEl.textContent) + 1;
                            
                            const titleLower = (res.title || '').toLowerCase();
                            const isHigh = titleLower.includes('aprovado') || titleLower.includes('lista') || titleLower.includes('federal') || titleLower.includes('etec');
                            
                            const card = document.createElement('div');
                            card.className = "glass-card p-4 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col gap-2 relative animate-in";
                            card.innerHTML = `
                                ${isHigh ? '<div class="absolute top-2 right-2 px-1 py-0.5 bg-emerald-500 text-white rounded text-[7px] font-black uppercase">HIT</div>' : ''}
                                <div class="flex items-center gap-2">
                                    <div class="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center">
                                        <i data-lucide="link" class="w-3 h-3 text-emerald-400"></i>
                                    </div>
                                    <h5 class="text-[10px] font-bold text-white truncate">${res.title || 'Registro'}</h5>
                                </div>
                                <p class="text-[9px] text-slate-400 line-clamp-1">${res.description || 'Extraído via OSINT.'}</p>
                                <a href="${link}" target="_blank" class="text-[9px] font-bold text-emerald-400 hover:underline mt-1">Acessar Registro</a>
                            `;
                            grid.prepend(card);
                            this.refreshIcons();
                        }
                    }
                });
            }
        } catch (e) {}
    }

    async performLiveOSINT(type, query, grid) {
        const username = query.includes('@') ? query.split('@')[0] : query;
        if (type === 'email') {
            this.scanGravatar(query, grid);
            this.scanEmailCorrelations(query, grid);
        }
        if (type === 'username' || type === 'dorking') {
            this.scanSocialPlatforms(username, grid);
        }
    }

    async scanGravatar(email, grid) {
        try {
            const hash = CryptoJS.MD5(email.toLowerCase().trim()).toString();
            const response = await fetch(`https://en.gravatar.com/${hash}.json`);
            if (response.ok) {
                const profile = (await response.json()).entry[0];
                this.injectLiveCard(grid, { platform: "Gravatar", icon: "user", avatar: profile.thumbnailUrl, name: profile.displayName || "Email Ativo", username: profile.preferredUsername, about: profile.aboutMe });
            }
        } catch(e) {}
    }

    async scanEmailCorrelations(email, grid) {
        const platform = { id: 'instagram', site: 'instagram.com', regex: /instagram\.com\/([a-zA-Z0-9._]+)/i };
        try {
            const searchUrl = `https://api.microlink.io?url=${encodeURIComponent(`https://www.google.com/search?q=site:${platform.site} "${email}"`)}&meta=true`;
            const data = await (await fetch(searchUrl)).json();
            if (data.status === 'success' && data.data.title && !data.data.title.includes('Google')) {
                const handle = (data.data.url.match(platform.regex) || [])[1] || "Vínculo";
                this.injectSocialResult(grid, { id: platform.id, name: platform.id, handle, title: data.data.title, image: `https://unavatar.io/${platform.id}/${handle}`, url: data.data.url });
            }
        } catch (e) {}
    }

    async scanSocialPlatforms(username, grid) {
        const platforms = SOCIAL_PLATFORMS.slice(0, 4); // Limit for performance
        platforms.forEach(async (platform) => {
            const targetUrl = platform.url.replace('{query}', username);
            try {
                const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(targetUrl)}&meta=true`);
                const data = await response.json();
                if (data.status === 'success' && data.data.title && !data.data.title.toLowerCase().includes('404')) {
                    this.injectSocialResult(grid, { ...platform, handle: username, title: data.data.title, image: data.data.image?.url || `https://unavatar.io/${platform.id}/${username}`, url: targetUrl });
                }
            } catch (e) {}
        });
    }

    injectSocialResult(parent, data) {
        const item = document.createElement('div');
        item.className = `glass-card p-3 rounded-lg border border-slate-800 flex flex-col gap-2 animate-in`;
        item.innerHTML = `<div class="flex items-center gap-2"><img src="${data.image}" class="w-8 h-8 rounded-md"><div class="min-w-0"><h4 class="text-[10px] font-bold text-white truncate">${data.title}</h4><p class="text-[8px] text-slate-500 font-mono">@${data.handle}</p></div></div><a href="${data.url}" target="_blank" class="text-[9px] bg-slate-800 text-center py-1 rounded">Perfil</a>`;
        parent.prepend(item);
        this.refreshIcons();
    }

    injectLiveCard(grid, data) {
        const card = document.createElement('div');
        card.className = 'glass-card p-4 rounded-xl border border-purple-500/30 md:col-span-2 bg-slate-900/60 animate-in';
        card.innerHTML = `<div class="flex items-center gap-4"><img src="${data.avatar}" class="w-12 h-12 rounded-full border border-purple-500/20"><div><h3 class="text-sm font-bold text-white">${data.name}</h3><p class="text-[10px] text-slate-400 font-mono">@${data.username}</p></div></div>`;
        grid.prepend(card);
        this.refreshIcons();
    }

    renderHistory() {
        const list = document.getElementById('historyList');
        if (!list) return;
        if (this.history.length === 0) { list.innerHTML = `<span class="text-xs text-slate-600 italic">Sem histórico recente.</span>`; return; }
        list.innerHTML = this.history.map(item => `<button class="text-[9px] bg-slate-900 border border-slate-800 px-2 py-1 rounded-full text-slate-400">${item.query}</button>`).join('');
    }

    clearHistory() { this.history = []; localStorage.removeItem('osint_history'); this.renderHistory(); }
    toggleTheme() { this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark'; localStorage.setItem('osint_theme', this.currentTheme); this.applyTheme(); }
    applyTheme() { 
        const body = document.body; 
        if (!body) return;
        if (this.currentTheme === 'light') body.classList.add('light-mode'); 
        else body.classList.remove('light-mode'); 
        this.refreshIcons(); 
    }
    showToast(message) { 
        const toast = document.getElementById('toast'); 
        const msgEl = document.getElementById('toastMessage'); 
        if (!toast || !msgEl) return; 
        msgEl.textContent = message; 
        toast.style.opacity = '1'; 
        toast.style.transform = 'translateY(0)';
        setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(20px)'; }, 3000); 
    }
}

// Start App
new OSINTApp();
