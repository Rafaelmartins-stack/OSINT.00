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
            { name: "Listas ETEC / CPS (Direto)", url: "https://classificacao.vestibulinho.etec.sp.gov.br/", dork: 'site:classificacao.vestibulinho.etec.sp.gov.br "{query}"' },
            { name: "Jusbrasil (Processos)", url: "https://www.jusbrasil.com.br/busca?q={query}", dork: 'site:jusbrasil.com.br "{query}"' },
            { name: "Escavador (Histórico)", url: "https://www.escavador.com/busca?q={query}", dork: 'site:escavador.com "{query}"' },
            { name: "Diário Oficial (Consulta)", dork: '"{query}" site:imprensaoficial.com.br OR "diário oficial"' },
            { name: "Convocação / Aprovados", dork: '"{query}" "lista de convocação" OR "classificação" OR "vestibular" 2026' },
            { name: "Registros Gov (PDF/XLS)", dork: '"{query}" filetype:pdf OR filetype:xls site:gov.br' }
        ]
    },
    email: {
        title: "Mail Intel",
        icon: "mail",
        description: "Encontre perfis e contas em redes sociais vinculadas diretamente a este e-mail.",
        template: [
            { name: "OSINT Industries (100+ Sites)", url: "https://osint.industries/search?query={query}" },
            { name: "EPIEOS (Google/Social Link)", url: "https://epieos.com/?q={query}" },
            { name: "Gravatar (Verified Assets)", url: "https://en.gravatar.com/{query}" },
            { name: "LinkedIn Identity", url: "https://www.google.com/search?q=site:linkedin.com \"{query}\"" },
            { name: "Instagram / Social Dork", dork: '"{query}" site:instagram.com OR site:facebook.com OR site:tiktok.com' },
            { name: "Breach Directory (Leaks)", url: "https://breachdirectory.org/search?term={query}" }
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
    { id: 'behance', name: 'Behance', url: 'https://www.behance.net/{query}', icon: 'image', color: 'from-blue-500 to-blue-600' },
    { id: 'spotify', name: 'Spotify', url: 'https://open.spotify.com/user/{query}', icon: 'music', color: 'from-green-500 to-green-600' },
    { id: 'medium', name: 'Medium', url: 'https://medium.com/@{query}', icon: 'file-text', color: 'from-slate-900 to-black' },
    { id: 'vimeo', name: 'Vimeo', url: 'https://vimeo.com/{query}', icon: 'play', color: 'from-blue-400 to-blue-500' }
];

class OSINTApp {
    constructor() {
        this.history = JSON.parse(localStorage.getItem('osint_history') || '[]');
        this.currentIntel = {
            emails: new Set(),
            phones: new Set(),
            handles: new Set(),
            bestName: null,
            bestAvatar: null,
            location: null
        };
        this.currentTheme = localStorage.getItem('osint_theme') || 'dark';
        this.scannedHandles = new Set();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderHistory();
        this.applyTheme();
        this.refreshIcons();
        this.initInfoModal();
    }

    initInfoModal() {
        const modal = document.getElementById('infoModal');
        const openBtn = document.getElementById('infoToggle');
        const closeBtn = document.getElementById('closeInfo');

        if (!modal || !openBtn || !closeBtn) return;

        const openModal = () => {
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                const card = modal.querySelector('.glass-card');
                if (card) card.classList.remove('scale-95');
            }, 10);
        };

        const closeModal = () => {
            modal.classList.add('opacity-0');
            const card = modal.querySelector('.glass-card');
            if (card) card.classList.add('scale-95');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        };

        openBtn.addEventListener('click', openModal);
        closeBtn.addEventListener('click', closeModal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                closeModal();
            }
        });
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
        if (resultsSection) resultsSection.classList.remove('hidden');
        
        const metaEl = document.getElementById('resultMeta');
        if (metaEl) metaEl.textContent = `ALVO: ${query.toUpperCase()}`;

        const titleEl = document.getElementById('resultTitle');
        if (titleEl) {
            titleEl.innerHTML = `<i data-lucide="${config.icon}" class="w-5 h-5"></i> ${config.title} - Resultados`;
        }

        const grid = document.getElementById('resultsGrid');
        if (!grid) return;
        grid.innerHTML = `
            <div id="searchingArea" class="col-span-full border-2 border-dashed border-slate-800 rounded-2xl p-12 text-center animate-pulse">
                <div class="flex flex-col items-center gap-4">
                    <div class="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/20 mb-2">
                        <i data-lucide="shield-search" class="w-6 h-6 text-purple-400"></i>
                    </div>
                    <h3 class="text-white font-bold text-lg">Auditando Bases de Dados...</h3>
                    <p class="text-slate-400 text-sm max-w-sm mx-auto">Verificando a existência de registros para <span class="text-purple-400 font-mono">"${query}"</span> nas bases oficiais.</p>
                </div>
            </div>
        `;
        this.refreshIcons();

        Promise.all(config.template.map(item => this.validateAndRender(item, query, grid))).then(() => {
            const searchArea = document.getElementById('searchingArea');
            if (searchArea) {
                if (grid.children.length <= 1) {
                    searchArea.innerHTML = `
                        <div class="flex flex-col items-center gap-4">
                            <i data-lucide="search-x" class="w-12 h-12 text-slate-600"></i>
                            <h3 class="text-slate-200 font-bold text-lg">Nenhum registro encontrado</h3>
                            <p class="text-slate-500 text-sm max-w-sm mx-auto">Não foram detectados vínculos diretos nas bases auditadas.</p>
                        </div>
                    `;
                } else {
                    searchArea.remove();
                }
            }
            this.refreshIcons();
        });

        this.performLiveOSINT(type, query, grid);
        this.addToHistory(type, query);
        this.refreshIcons();

        if (resultsSection) resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.showToast(`Pesquisa iniciada para: ${query}`, 'info');
    }

    async validateAndRender(item, query, grid) {
        let finalUrl = '';
        let displayPath = '';

        if (item.url) {
            finalUrl = item.url.split('{query}').join(encodeURIComponent(query));
            displayPath = finalUrl;
        } else if (item.dork) {
            let dorkString = item.dork.split('{query}').join(query);
            finalUrl = `https://www.google.com/search?q=${encodeURIComponent(dorkString)}`;
            displayPath = dorkString;
        }

        if (item.dork) {
            try {
                const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(item.dork.split('{query}').join(query))}`;
                const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(searchUrl)}&data.results.selector=.result__title&data.results.type=list`);
                const data = await response.json();
                if (!data.status === 'success' || !data.data.results || data.data.results.length === 0) {
                    return;
                }
            } catch (e) {}
        }

        const dorkString = item.dork ? item.dork.split('{query}').join(query) : '';
        const safeDork = dorkString.replace(/"/g, '&quot;').replace(/'/g, '&#39;');

        const mineBtn = item.dork ? `
            <button data-dork="${safeDork}" onclick="window.osintApp.mineDorkResults(this.getAttribute('data-dork'), this)" 
                class="mt-1 inline-flex items-center justify-center gap-2 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-[10px] font-bold py-2 px-4 rounded-lg transition-all w-full">
                <i data-lucide="microscope" class="w-3.5 h-3.5"></i> Minerar Todos Links
            </button>
        ` : '';

        const card = document.createElement('div');
        card.className = 'glass-card p-4 rounded-xl result-item animate-in flex flex-col justify-between h-full';
        card.innerHTML = `
            <div class="mb-3 overflow-hidden">
                <h4 class="font-bold text-sm text-slate-200">${item.name}</h4>
                <p class="text-[10px] text-slate-500 truncate mt-1 mono-font" title="${displayPath}">${displayPath}</p>
            </div>
            <div class="flex flex-col gap-2 mt-auto">
                ${mineBtn}
                <a href="${finalUrl}" target="_blank" rel="noopener noreferrer" 
                    class="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold py-2 px-4 rounded-lg transition-colors border border-slate-700">
                    Abrir Ferramenta <i data-lucide="external-link" class="w-3 h-3"></i>
                </a>
            </div>
        `;
        grid.appendChild(card);
        this.refreshIcons();
    }

    async mineDorkResults(dork, btn) {
        const originalHtml = btn.innerHTML;
        btn.innerHTML = `<i data-lucide="refresh-cw" class="w-3.5 h-3.5 animate-spin"></i> Minerando...`;
        this.refreshIcons();
        try {
            const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(dork)}`;
            const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(searchUrl)}&data.results.selector=.result__title&data.results.type=list&data.results.attr=href`);
            const data = await response.json();
            if (data.status === 'success' && data.data.results) {
                const results = data.data.results;
                this.showToast(`Sucesso! Encontrados ${results.length} links diretos.`, 'success');
                let findingsGrid = document.getElementById('deepFindingsGrid');
                if (!findingsGrid) {
                    const section = document.createElement('div');
                    section.className = 'col-span-full mt-8 animate-in';
                    section.innerHTML = `
                        <div class="flex items-center gap-3 mb-6">
                            <i data-lucide="database" class="w-4 h-4 text-emerald-400"></i>
                            <h3 class="text-xs font-black uppercase tracking-widest text-emerald-400">Registros Identificados via Deep Search</h3>
                            <div class="h-px flex-1 bg-gradient-to-r from-emerald-500/30 to-transparent"></div>
                        </div>
                        <div id="deepFindingsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
                    `;
                    document.getElementById('resultsGrid').after(section);
                    findingsGrid = document.getElementById('deepFindingsGrid');
                }
                results.slice(0, 10).forEach(async (encodedLink) => {
                    const link = decodeURIComponent(encodedLink.split('uddg=')[1]?.split('&')[0] || encodedLink);
                    if (link.startsWith('http')) {
                        const metaRes = await fetch(`https://api.microlink.io?url=${encodeURIComponent(link)}&meta=true`);
                        const metaData = await metaRes.json();
                        if (metaData.status === 'success') {
                            const result = metaData.data;
                            const card = document.createElement('div');
                            card.className = 'glass-card p-4 rounded-xl border border-emerald-500/20 hover:border-emerald-500/50 transition-all flex flex-col gap-3 relative overflow-hidden';
                            card.innerHTML = `
                                <div class="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500 opacity-5 blur-2xl rounded-full"></div>
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                        <i data-lucide="file-text" class="w-4 h-4 text-emerald-400"></i>
                                    </div>
                                    <div class="min-w-0">
                                        <h5 class="text-xs font-bold text-white truncate">${result.title || 'Documento sem título'}</h5>
                                        <p class="text-[9px] text-slate-500 truncate font-mono">${new URL(link).hostname}</p>
                                    </div>
                                </div>
                                <p class="text-[10px] text-slate-400 line-clamp-2">${result.description || 'Nenhuma descrição disponível para este registro.'}</p>
                                <a href="${link}" target="_blank" class="mt-2 w-full bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-[10px] font-bold py-2 rounded transition-all text-center">
                                    Visualizar Registro Completo
                                </a>
                                <div class="absolute top-2 right-2 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[8px] text-emerald-500 font-bold uppercase">PROVA</div>
                            `;
                            findingsGrid.prepend(card);
                            this.refreshIcons();
                        }
                    }
                });
            }
        } catch (e) {
            this.showToast('Erro ao minerar links.', 'error');
        } finally {
            btn.innerHTML = originalHtml;
            this.refreshIcons();
        }
    }

    addToHistory(type, query) {
        this.history = this.history.filter(item => !(item.type === type && item.query === query));
        this.history.unshift({ type, query, timestamp: new Date().toISOString() });
        this.history = this.history.slice(0, 5);
        localStorage.setItem('osint_history', JSON.stringify(this.history));
        this.renderHistory();
    }

    extractUsername(query) {
        return query.includes('@') ? query.split('@')[0] : query;
    }

    extractRealName(title, id) {
        if (!title) return null;
        let name = decodeURIComponent(title);
        if (id === 'instagram' || id === 'twitter') {
            const match = name.match(/^(.*?) \(@/i);
            if (match) name = match[1];
        } else if (id === 'tiktok') {
            const parts = title.split(' - ');
            if (parts.length > 2) name = parts[parts.length - 1];
        }
        name = name.replace(/ • Instagram.*/i, '').replace(/ \| GitHub/i, '').replace(/ \/ X/i, '').trim();
        if (name.toLowerCase().includes('instagram') || name.toLowerCase().includes('twitter') || name.length < 2) return null;
        return name;
    }

    pivotToPersonSearch(name) {
        const input = document.getElementById('usernameInput');
        if (input) {
            input.value = name;
            this.handleSearch('username');
            this.showToast(`Pivoting: "${name}"`, 'success');
        }
    }

    parseIntel(source, data) {
        const text = `${data.title} ${data.description}`.toLowerCase();
        const emails = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
        if (emails) emails.forEach(e => this.currentIntel.emails.add(e));
        const phones = text.match(/(?:\(?\d{2}\)?\s?)?9\d{4}[-\s]?\d{4}/g);
        if (phones) phones.forEach(p => this.currentIntel.phones.add(p));
        const handles = text.match(/@([a-zA-Z0-9._]+)/g);
        if (handles) handles.forEach(h => this.currentIntel.handles.add(h));
        if (data.realName && (!this.currentIntel.bestName || data.realName.length > this.currentIntel.bestName.length)) {
            this.currentIntel.bestName = data.realName;
        }
        if (data.image && !this.currentIntel.bestAvatar) {
            this.currentIntel.bestAvatar = data.image;
        }
        this.updateIntelligenceReport();
    }

    updateIntelligenceReport() {
        let reportContainer = document.getElementById('intelligenceReport');
        if (!reportContainer) {
            reportContainer = document.createElement('div');
            reportContainer.id = 'intelligenceReport';
            reportContainer.className = 'col-span-full order-last mt-8 animate-in';
            const grid = document.getElementById('resultsGrid');
            if (grid) grid.appendChild(reportContainer);
        }
        const emailList = Array.from(this.currentIntel.emails);
        const phoneList = Array.from(this.currentIntel.phones);
        if (emailList.length === 0 && phoneList.length === 0 && !this.currentIntel.bestName) {
            reportContainer.innerHTML = '';
            return;
        }
        reportContainer.innerHTML = `
            <div class="glass-card p-8 rounded-2xl border-2 border-purple-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-900/20 shadow-2xl relative overflow-hidden">
                <div class="flex flex-col md:flex-row gap-8 items-start relative z-10">
                    <div class="shrink-0">
                        <img src="${this.currentIntel.bestAvatar || 'https://via.placeholder.com/150'}" class="w-32 h-32 rounded-2xl object-cover border-4 border-slate-800">
                    </div>
                    <div class="flex-1">
                        <h2 class="text-3xl font-black text-white mb-2">${this.currentIntel.bestName || 'Perfil Consolidado'}</h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                            <div>
                                <h4 class="text-[10px] text-slate-500 uppercase font-bold mb-3">E-mails</h4>
                                <div class="space-y-2">${emailList.map(e => `<div class="text-sm text-slate-200 font-mono bg-slate-800/50 p-2 rounded">${e}</div>`).join('')}</div>
                            </div>
                            <div>
                                <h4 class="text-[10px] text-slate-500 uppercase font-bold mb-3">Telefones</h4>
                                <div class="space-y-2">${phoneList.map(p => `<div class="text-sm text-slate-200 font-mono bg-slate-800/50 p-2 rounded">${p}</div>`).join('')}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.refreshIcons();
    }

    async performLiveOSINT(type, query, grid) {
        const username = this.extractUsername(query);
        this.scannedHandles = new Set([username]);
        this.currentIntel = { emails: new Set(), phones: new Set(), handles: new Set(), bestName: null, bestAvatar: null };
        if (type === 'email') {
            this.scanGravatar(query, grid);
            this.scanEmailCorrelations(query, grid);
        } else if (type === 'username') {
            this.scanSocialPlatforms(username, grid);
            this.harvestSocialProfiles(query, 'instagram', grid);
        }
    }

    async harvestSocialProfiles(query, platformId, grid) {
        const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId);
        if (!platform) return;
        try {
            const dork = `site:${new URL(platform.url.replace('{query}', 'abc')).hostname} "${query}"`;
            const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(dork)}`;
            const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(searchUrl)}&data.results.selector=.result__title&data.results.type=list&data.results.attr=href`);
            const data = await response.json();
            if (data.status === 'success' && data.data.results) {
                const links = [...new Set(data.data.results)].filter(link => link.toLowerCase().includes(platformId));
                links.slice(0, 5).forEach(async (encodedLink) => {
                    const link = decodeURIComponent(encodedLink.split('uddg=')[1]?.split('&')[0] || encodedLink);
                    const handle = link.split('/').filter(p => p).pop().split('?')[0];
                    if (handle && !this.scannedHandles.has(handle)) {
                        this.scannedHandles.add(handle);
                        const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(link)}&meta=true`);
                        const profileData = await res.json();
                        if (profileData.status === 'success' && profileData.data.title) {
                            const profile = profileData.data;
                            if (!profile.title.toLowerCase().includes('login') && !profile.title.toLowerCase().includes('404')) {
                                this.injectSocialResult(grid, {
                                    ...platform,
                                    handle: handle,
                                    title: profile.title,
                                    realName: this.extractRealName(profile.title, platform.id),
                                    description: profile.description,
                                    image: profile.image?.url || `https://unavatar.io/${platform.id}/${handle}`,
                                    url: link,
                                    color: "from-cyan-400 to-blue-600"
                                });
                            }
                        }
                    }
                });
            }
        } catch (e) {}
    }

    async scanSocialPlatforms(username, grid, confirmed = false) {
        SOCIAL_PLATFORMS.forEach(platform => {
            if (confirmed || platform.id !== 'instagram') {
                this.checkPlatform(username, platform, grid);
            }
        });
    }

    async checkPlatform(username, platform, grid) {
        const url = platform.url.replace('{query}', username);
        try {
            const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}&meta=true`);
            const data = await response.json();
            if (data.status === 'success' && data.data.title) {
                const profile = data.data;
                const titleLower = profile.title.toLowerCase();
                const isNotFound = titleLower.includes('404') || titleLower.includes('not found') || titleLower.includes('login');
                if (!isNotFound) {
                    this.injectSocialResult(grid, {
                        ...platform,
                        handle: username,
                        title: profile.title,
                        realName: this.extractRealName(profile.title, platform.id),
                        description: profile.description,
                        image: profile.image?.url || `https://unavatar.io/${platform.id}/${username}`,
                        url: url
                    });
                }
            }
        } catch (e) {}
    }

    injectSocialResult(grid, data) {
        const card = document.createElement('div');
        card.className = `glass-card p-5 rounded-2xl animate-in border border-white/5 hover:border-white/20 relative overflow-hidden group`;
        card.innerHTML = `
            <div class="absolute inset-0 bg-gradient-to-br ${data.color || 'from-purple-500/10 to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative z-10 flex items-start gap-4">
                <img src="${data.image}" class="w-14 h-14 rounded-xl object-cover bg-slate-800 border border-white/10 shadow-lg" onerror="this.src='https://via.placeholder.com/150'">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                        <i data-lucide="${data.icon || 'user'}" class="w-3.5 h-3.5 text-white/70"></i>
                        <span class="text-[10px] font-bold uppercase tracking-wider text-white/50">${data.name}</span>
                    </div>
                    <h4 class="font-bold text-white truncate">${data.realName || data.handle}</h4>
                    <p class="text-[11px] text-white/60 truncate italic mb-2">@${data.handle}</p>
                    <a href="${data.url}" target="_blank" class="inline-flex items-center gap-2 text-[10px] font-black uppercase text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all">
                        Ver Perfil <i data-lucide="external-link" class="w-3 h-3"></i>
                    </a>
                </div>
            </div>
        `;
        grid.prepend(card);
        this.refreshIcons();
        this.parseIntel(data.name, data);
    }

    async scanGravatar(email, grid) {
        try {
            const hash = CryptoJS.MD5(email.toLowerCase().trim()).toString();
            const response = await fetch(`https://en.gravatar.com/${hash}.json`);
            if (response.ok) {
                const data = await response.json();
                const profile = data.entry[0];
                this.injectLiveCard(grid, {
                    platform: "Gravatar",
                    avatar: profile.thumbnailUrl,
                    name: profile.displayName || "Identidade Confirmada",
                    username: profile.preferredUsername,
                    about: profile.aboutMe || "Conta ativa encontrada para este e-mail."
                });
            }
        } catch (e) {}
    }

    injectLiveCard(grid, data) {
        const card = document.createElement('div');
        card.className = 'glass-card p-5 rounded-2xl border border-emerald-500/20';
        card.innerHTML = `
            <div class="flex gap-4">
                <img src="${data.avatar}" class="w-12 h-12 rounded-full border-2 border-emerald-500/20">
                <div>
                    <h4 class="font-bold text-white text-sm">${data.name}</h4>
                    <p class="text-xs text-slate-400">@${data.username}</p>
                    <p class="text-[11px] text-slate-500 mt-2">${data.about}</p>
                </div>
            </div>
        `;
        grid.prepend(card);
        this.refreshIcons();
    }

    renderHistory() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;
        if (this.history.length === 0) {
            historyList.innerHTML = '<span class="text-xs text-slate-600 italic">Nenhuma atividade recente.</span>';
            return;
        }
        historyList.innerHTML = this.history.map(item => `
            <button onclick="document.getElementById('${item.type === 'dorking' ? 'dork' : item.type}Input').value='${item.query}'; window.osintApp.handleSearch('${item.type}')" 
                class="px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg text-xs text-slate-400 transition-all hover:text-white flex items-center gap-2">
                <i data-lucide="clock" class="w-3 h-3"></i> ${item.query}
            </button>
        `).join('');
        this.refreshIcons();
    }

    clearHistory() {
        this.history = [];
        localStorage.removeItem('osint_history');
        this.renderHistory();
        this.showToast('Histórico limpo.', 'info');
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('osint_theme', this.currentTheme);
        this.applyTheme();
    }

    applyTheme() {
        const body = document.body;
        const toggleIcon = document.querySelector('#themeToggle i');
        if (this.currentTheme === 'light') {
            body.classList.add('light-mode');
            if (toggleIcon) toggleIcon.setAttribute('data-lucide', 'sun');
        } else {
            body.classList.remove('light-mode');
            if (toggleIcon) toggleIcon.setAttribute('data-lucide', 'moon');
        }
        this.refreshIcons();
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const msgEl = document.getElementById('toastMessage');
        if (!toast || !msgEl) return;
        msgEl.textContent = message;
        toast.classList.remove('opacity-0', 'translate-y-10');
        toast.classList.add('opacity-100', 'translate-y-0');
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-10');
            toast.classList.remove('opacity-100', 'translate-y-0');
        }, 3000);
    }
}

(function() {
    const startApp = () => { window.osintApp = new OSINTApp(); };
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', startApp); }
    else { startApp(); }
})();
