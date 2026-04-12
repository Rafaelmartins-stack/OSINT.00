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
            { name: "Listas ETEC / CTS (Direto)", url: "https://classificacao.vestibulinho.etec.sp.gov.br/", dork: 'site:classificacao.vestibulinho.etec.sp.gov.br OR site:cps.sp.gov.br "{query}"' },
            { name: "Institutos Federais (IFSP/IF)", dork: 'site:ifsp.edu.br OR site:*.edu.br "{query}" "resultado" OR "classificação"' },
            { name: "Bancas & Vestibulares", dork: '"{query}" site:org.br OR site:com.br "resultado final" OR "lista de convocação" OR "aprovados"' },
            { name: "Jusbrasil (Processos)", url: "https://www.jusbrasil.com.br/busca?q={query}", dork: 'site:jusbrasil.com.br "{query}"' },
            { name: "Escavador (Histórico)", url: "https://www.escavador.com/busca?q={query}", dork: 'site:escavador.com "{query}"' },
            { name: "Portal da Transparência", dork: 'site:transparencia.gov.br "{query}"' },
            { name: "Diário Oficial (União)", dork: 'site:in.gov.br "{query}"' },
            { name: "CNPJ / Quadro Societário", dork: '"{query}" site:cnpj.biz OR site:casadosdados.com.br' },
            { name: "Tribunal de Justiça (TJ)", dork: 'site:jus.br "{query}"' },
            { name: "MEC / Aprovados Sisu", dork: 'site:mec.gov.br "{query}"' },
            { name: "Conselhos Profissionais", dork: 'site:org.br "{query}" "registro profissional" OR "conselho"' },
            { name: "Diário Oficial (Estados)", dork: '"{query}" site:imprensaoficial.com.br OR "diário oficial"' },
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
    { id: 'twitch', name: 'Twitch', url: 'https://www.twitch.tv/{query}', icon: 'video', color: 'from-purple-600 to-purple-700' },
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

    generateVariations(base) {
        const clean = base.toLowerCase().replace(/[^a-z0-9]/g, '');
        const variants = new Set();
        if (base.length > 2) {
            variants.add(base);
            variants.add(`${base}_`);
            variants.add(`${base}1`);
            variants.add(`_${base}`);
            variants.add(`${base}.`);
            variants.add(`${base}-`);
            if (base.length > 5) {
                variants.add(`${base.substring(0, base.length - 1)}`);
            }
            if (base !== clean && clean.length > 2) variants.add(clean);
        }
        return Array.from(variants);
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
                    <p class="text-slate-400 text-sm max-w-sm mx-auto">Verificando a existência de registros para <span class="text-purple-400 font-mono">"${query}"</span> nas bases oficiais. Este processo garante que apenas ferramentas com dados reais sejam exibidas.</p>
                </div>
            </div>
        `;
        this.refreshIcons();

        Promise.all(config.template.map(item => this.validateAndRender(item, query, grid))).then(() => {
            const searchArea = document.getElementById('searchingArea');
            if (searchArea) {
                if (grid.querySelectorAll('.result-card-item').length === 0) {
                    searchArea.innerHTML = `
                        <div class="flex flex-col items-center gap-4">
                            <i data-lucide="search-x" class="w-12 h-12 text-slate-600"></i>
                            <h3 class="text-slate-200 font-bold text-lg">Nenhum registro encontrado</h3>
                            <p class="text-slate-500 text-sm max-w-sm mx-auto">Não foram detectados vínculos diretos para este nome nas bases auditadas.</p>
                            <button onclick="window.osintApp.showFallbackTools('${type}', '${query}')" class="mt-4 text-xs text-purple-400 hover:underline">Exibir todas as ferramentas disponíveis (Busca Manual)</button>
                        </div>
                    `;
                } else {
                    searchArea.remove();
                    const footer = document.createElement('div');
                    footer.className = 'col-span-full pt-8 text-center border-t border-slate-800 mt-8';
                    footer.innerHTML = `<button onclick="window.osintApp.showFallbackTools('${type}', '${query}')" class="text-xs text-slate-500 hover:text-purple-400 transition-all">Não encontrou o que procurava? Exibir todas as ferramentas de busca.</button>`;
                    grid.appendChild(footer);
                }
            }
            this.refreshIcons();
        });

        this.performLiveOSINT(type, query, grid);
        this.addToHistory(type, query);
        this.refreshIcons();

        if (resultsSection) resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.showToast(`Auditoria e mineração automática de registros iniciada para: ${query}`, 'info');

        // AUTO-MINING: If this is a dorking search, automatically trigger mining for key tools
        if (type === 'dorking') {
            config.template.forEach(item => {
                if (item.dork && (item.name.includes("Aprovados") || item.name.includes("ETEC") || item.name.includes("IFSP") || item.name.includes("Bancas") || item.name.includes("Gov") || item.name.includes("Global"))) {
                    const dork = item.dork.split('{query}').join(query);
                    // Pass null as the button since it's an automated call
                    this.mineDorkResults(dork, null);
                }
            });
        }
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

        // DYNAMIC DISCOVERY: We probe the source. If 0 hits are found, we don't render the card.
        const isDorking = item.dork && !item.url;
        if (item.dork) {
            try {
                const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(item.dork.split('{query}').join(query))}`;
                const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(searchUrl)}&data.results.selector=.result__title&data.results.type=list`);
                const data = await response.json();
                // If it's a confirmed empty result, we skip rendering this card for this specific search
                if (!data.status === 'success' || !data.data.results || data.data.results.length === 0) return;
            } catch (e) {
                // On error, we show it anyway to be safe, but only if it's not a secondary dork
                if (isDorking) return;
            }
        }

        const dorkStringForEscaping = item.dork ? item.dork.split('{query}').join(query) : '';
        const safeDork = dorkStringForEscaping.replace(/"/g, '&quot;').replace(/'/g, '&#39;');

        const mineBtn = item.dork ? `
            <button data-dork="${safeDork}" onclick="window.osintApp.mineDorkResults(this.getAttribute('data-dork'), this)" 
                class="mt-1 inline-flex items-center justify-center gap-2 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-[10px] font-bold py-2 px-4 rounded-lg transition-all w-full">
                <i data-lucide="microscope" class="w-3.5 h-3.5"></i> Minerar Todos Links
            </button>
        ` : '';

        const card = document.createElement('div');
        card.className = 'glass-card p-4 rounded-xl result-item result-card-item animate-in flex flex-col justify-between h-full';
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
        const originalHtml = btn ? btn.innerHTML : null;
        if (btn) {
            btn.innerHTML = `<i data-lucide="refresh-cw" class="w-3.5 h-3.5 animate-spin"></i> Minerando...`;
            this.refreshIcons();
        }
        try {
            const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(dork)}`;
            const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(searchUrl)}&data.results.selector=.result__title&data.results.type=list&data.results.attr=href`);
            const data = await response.json();
            if (data.status === 'success' && data.data.results) {
                const results = data.data.results;
                let findingsGrid = document.getElementById('deepFindingsGrid');
                if (!findingsGrid) {
                    const section = document.createElement('div');
                    section.className = 'col-span-full mt-8 animate-in';
                    section.innerHTML = `<div class="flex items-center gap-3 mb-6"><i data-lucide="database" class="w-4 h-4 text-emerald-400"></i><h3 class="text-xs font-black uppercase tracking-widest text-emerald-400">Registros via Deep Search</h3><div class="h-px flex-1 bg-gradient-to-r from-emerald-500/30 to-transparent"></div></div><div id="deepFindingsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>`;
                    document.getElementById('resultsGrid').after(section);
                    findingsGrid = document.getElementById('deepFindingsGrid');
                    this.refreshIcons();
                }
                results.slice(0, 10).forEach(async (encodedLink) => {
                    const link = decodeURIComponent(encodedLink.split('uddg=')[1]?.split('&')[0] || encodedLink);
                    if (link.startsWith('http')) {
                        const metaRes = await fetch(`https://api.microlink.io?url=${encodeURIComponent(link)}&meta=true`);
                        const metaData = await metaRes.json();
                        if (metaData.status === 'success') {
                            const res = metaData.data;
                            const titleLower = (res.title || '').toLowerCase();
                            const isHighRelevance = titleLower.includes('aprovado') || titleLower.includes('classifica') || titleLower.includes('convoca') || titleLower.includes('resultado') || titleLower.includes('lista') || titleLower.includes('ifsp') || titleLower.includes('federal') || titleLower.includes('instituto');
                            
                            const badge = isHighRelevance ? `<div class="absolute top-2 right-2 px-1.5 py-0.5 bg-emerald-500 text-white rounded text-[8px] font-black uppercase tracking-widest animate-pulse">ALTA RELEVÂNCIA</div>` : '';
                            
                            const card = document.createElement('div');
                            card.className = `glass-card p-4 rounded-xl border ${isHighRelevance ? 'border-emerald-400 bg-emerald-500/5 shadow-lg shadow-emerald-500/10' : 'border-emerald-500/20'} hover:border-emerald-500/50 transition-all flex flex-col gap-3 relative overflow-hidden`;
                            card.innerHTML = `
                                ${badge}
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded ${isHighRelevance ? 'bg-emerald-500' : 'bg-emerald-500/10'} flex items-center justify-center border border-emerald-500/20">
                                        <i data-lucide="${link.endsWith('.pdf') ? 'file-text' : 'scroll'}" class="w-4 h-4 ${isHighRelevance ? 'text-white' : 'text-emerald-400'}"></i>
                                    </div>
                                    <div class="min-w-0">
                                        <h5 class="text-xs font-bold text-white truncate">${res.title || 'Documento'}</h5>
                                        <p class="text-[9px] text-slate-500 truncate font-mono">${new URL(link).hostname}</p>
                                    </div>
                                </div>
                                <p class="text-[10px] text-slate-400 line-clamp-2">${res.description || 'Registro oficial identificado via rastreamento de documentos.'}</p>
                                <a href="${link}" target="_blank" class="mt-2 w-full ${isHighRelevance ? 'bg-emerald-600 shadow-lg shadow-emerald-600/30' : 'bg-emerald-600/10'} hover:bg-emerald-600 text-${isHighRelevance ? 'white' : 'emerald-400'} hover:text-white border border-emerald-500/30 text-[10px] font-bold py-2 rounded text-center transition-all">
                                    Abrir Registro Encontrado
                                </a>
                            `;
                            
                            if (isHighRelevance) findingsGrid.prepend(card);
                            else findingsGrid.appendChild(card);
                            this.refreshIcons();
                        }
                    }
                });
            }
        } catch (e) {} finally {
            if (btn) {
                btn.innerHTML = originalHtml;
                this.refreshIcons();
            }
        }
    }

    addToHistory(type, query) {
        this.history = this.history.filter(item => !(item.type === type && item.query === query));
        this.history.unshift({ type, query, timestamp: new Date().toISOString() });
        if (this.history.length > 5) this.history = this.history.slice(0, 5);
        localStorage.setItem('osint_history', JSON.stringify(this.history));
        this.renderHistory();
    }

    async performLiveOSINT(type, query, grid) {
        const username = query.includes('@') ? query.split('@')[0] : query;
        this.scannedHandles = new Set();
        this.scannedHandles.add(username);
        this.currentIntel = { emails: new Set(), phones: new Set(), handles: new Set(), bestName: null, bestAvatar: null };

        if (type === 'email') {
            this.scanGravatar(query, grid);
            this.scanEmailCorrelations(query, grid);
            this.scanGitHubByEmail(query, grid);
        }
        if (type === 'username' || type === 'dorking') {
            if (type === 'username') this.scanSocialPlatforms(username, grid);
            this.harvestSocialProfiles(query, 'instagram', grid);
            this.harvestSocialProfiles(query, 'linkedin', grid);
            this.harvestSocialProfiles(query, 'twitch', grid);
            this.harvestSocialProfiles(query, 'twitter', grid);
            this.harvestSocialProfiles(query, 'github', grid);
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
                const links = [...new Set(data.data.results)].filter(link => link.toLowerCase().includes(platformId) && !link.includes('/p/') && !link.includes('/explore/') && !link.includes('/tags/'));
                links.slice(0, 5).forEach(async (encodedLink) => {
                    const link = decodeURIComponent(encodedLink.split('uddg=')[1]?.split('&')[0] || encodedLink);
                    const handle = link.split('/').filter(p => p).pop().split('?')[0];
                    if (handle && !this.scannedHandles.has(handle)) {
                        this.scannedHandles.add(handle);
                        const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(link)}&meta=true`);
                        const profileData = await res.json();
                        if (profileData.status === 'success' && profileData.data.title) {
                            const profile = profileData.data;
                            const titleLower = profile.title.toLowerCase();
                            const descLower = (profile.description || '').toLowerCase();
                            const isNotFound = titleLower.includes('404') || 
                                             titleLower.includes('page not found') || 
                                             titleLower.includes('profile / x') ||
                                             titleLower.includes('perfil / x') ||
                                             (platform.id === 'twitter' && titleLower.endsWith('on x')) ||
                                             descLower.includes('não perca o que está acontecendo') ||
                                             descLower.includes('don\'t miss what\'s happening') ||
                                             descLower === 'tiktok pwa' ||
                                             profile.title.trim() === platform.name ||
                                             profile.title === 'X' ||
                                             profile.title === 'Perfil / X' ||
                                             (platform.id === 'instagram' && (titleLower === 'instagram' || descLower.includes('login') || titleLower.includes('entrar'))) ||
                                             (platform.id === 'spotify' && (link.includes('?app=desktop') || titleLower.includes('spotify - web player')));

                            if (!isNotFound) {
                                this.injectSocialResult(grid, { ...platform, handle: handle, title: profile.title, realName: this.extractRealName(profile.title, platform.id), description: profile.description, image: profile.image?.url || `https://unavatar.io/${platform.id}/${handle}`, url: link, isBridgeMatch: true, color: "from-cyan-400 to-blue-600", icon: "search" });
                            }
                        }
                    }
                });
            }
        } catch (e) {}
    }

    async scanGitHubByEmail(email, grid) {
        try {
            const response = await fetch(`https://api.github.com/search/commits?q=author-email:${encodeURIComponent(email)}`, { headers: { 'Accept': 'application/vnd.github.cloak-preview+json' } });
            if (response.ok) {
                const data = await response.json();
                if (data.total_count > 0) {
                    const user = data.items[0].author;
                    if (user) {
                        this.injectSocialResult(grid, { id: 'github', name: 'GitHub', handle: user.login, title: `ID Técnico: ${user.login}`, description: `Vínculo técnico via Commit History.`, image: user.avatar_url, url: user.html_url, isBridgeMatch: true, color: "from-amber-400 to-orange-600", icon: "code" });
                        this.pivotDeepScan(user.login, grid);
                    }
                }
            }
        } catch(e) {}
    }

    pivotDeepScan(newHandle, grid) {
        if (!this.scannedHandles.has(newHandle)) {
            this.scannedHandles.add(newHandle);
            this.scanSocialPlatforms(newHandle, grid, true);
        }
    }

    async scanEmailCorrelations(email, grid) {
        const targets = [{ id: 'instagram', site: 'instagram.com', regex: /instagram\.com\/([a-zA-Z0-9._]+)/i }, { id: 'twitter', site: 'twitter.com', regex: /twitter\.com\/([a-zA-Z0-9._]+)/i }, { id: 'tiktok', site: 'tiktok.com', regex: /tiktok\.com\/@([a-zA-Z0-9._]+)/i }];
        targets.forEach(async (t) => {
            try {
                const searchUrl = `https://api.microlink.io?url=${encodeURIComponent(`https://www.google.com/search?q=site:${t.site} "${email}"`)}&meta=true`;
                const data = await (await fetch(searchUrl)).json();
                if (data.status === 'success' && data.data.title && !data.data.title.includes('Google Search')) {
                    const handle = (data.data.url.match(t.regex) || [])[1] || "Vínculo Direto";
                    this.injectSocialResult(grid, { id: t.id, name: t.id, handle: handle, title: data.data.title, description: data.data.description, image: `https://unavatar.io/${t.id}/${handle}`, url: data.data.url, isEmailMatch: true, color: "from-emerald-500 to-teal-600", icon: "mail-search" });
                    if (handle !== "Vínculo Direto") this.pivotDeepScan(handle, grid);
                }
            } catch (e) {}
        });
    }

    async scanGravatar(email, grid) {
        try {
            const hash = CryptoJS.MD5(email.toLowerCase().trim()).toString();
            const response = await fetch(`https://en.gravatar.com/${hash}.json`);
            if (response.ok) {
                const profile = (await response.json()).entry[0];
                this.injectLiveCard(grid, { platform: "Gravatar", icon: "fingerprint", avatar: profile.thumbnailUrl, name: profile.displayName || "Email Ativo", username: profile.preferredUsername, details: [{ label: "Profile", value: profile.profileUrl, link: true }], about: profile.aboutMe || "Identidade confirmada vinculada a este e-mail." });
                if (profile.verifiedAccounts) {
                    profile.verifiedAccounts.forEach(acc => {
                        const handle = acc.url.split('/').pop();
                        this.injectSocialResult(grid, { id: acc.shortname, name: acc.service_label, handle: handle, title: `Verificado: ${acc.service_label}`, description: `Conta vinculada no Gravatar.`, image: acc.service_icon, url: acc.url, isBridgeMatch: true, color: "from-amber-400 to-orange-600", icon: "link-2" });
                        this.pivotDeepScan(handle, grid);
                    });
                }
            }
        } catch(e) {}
    }

    async scanSocialPlatforms(username, grid, isConfirmed = false) {
        const socialGridId = `social-results-${Date.now()}`;
        const container = document.createElement('div');
        container.className = 'col-span-1 md:col-span-2 lg:col-span-3 lg:col-span-4 animate-in mt-2 mb-6';
        const accentColor = isConfirmed ? "amber-500" : "purple-500";
        container.innerHTML = `<div class="flex items-center gap-3 mb-4 px-2"><div class="h-px flex-1 bg-gradient-to-r from-transparent via-${accentColor}/30 to-transparent"></div><h3 class="text-[10px] font-bold uppercase tracking-widest text-${accentColor}">${isConfirmed ? "VÍNCULO CONFIRMADO" : "Fuzzy Scan"}</h3><div class="h-px flex-1 bg-gradient-to-r from-transparent via-${accentColor}/30 to-transparent"></div></div><div id="${socialGridId}" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-2"></div>`;
        grid.prepend(container);
        this.refreshIcons();
        const socialGrid = document.getElementById(socialGridId);
        const variants = isConfirmed ? [username] : this.generateVariations(username);
        SOCIAL_PLATFORMS.forEach(platform => {
            variants.forEach(async (variant) => {
                const targetUrl = platform.url.replace('{query}', variant);
                try {
                    const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(targetUrl)}&meta=true`);
                    const data = await response.json();
                    if (data.status === 'success' && data.data.title) {
                        const profile = data.data;
                        const titleLower = profile.title.toLowerCase();
                        const descLower = (profile.description || '').toLowerCase();
                        
                        const isNotFound = titleLower.includes('404') || 
                                         titleLower.includes('page not found') || 
                                         titleLower.includes('faça o seu dia') || 
                                         titleLower.includes('profile / x') ||
                                         titleLower.includes('perfil / x') ||
                                         (platform.id === 'twitter' && titleLower.endsWith('on x')) ||
                                         descLower.includes('não perca o que está acontecendo') || 
                                         descLower.includes('don\'t miss what\'s happening') ||
                                         profile.title.trim() === platform.name || 
                                         profile.title === 'X' ||
                                         profile.title === 'Perfil / X' ||
                                         (platform.id === 'instagram' && (titleLower === 'instagram' || descLower.includes('login') || titleLower.includes('entrar'))) ||
                                         (platform.id === 'spotify' && (targetUrl.includes('?app=desktop') || titleLower.includes('spotify - web player')));

                        if (!isNotFound) {
                            const realName = this.extractRealName(profile.title, platform.id);
                            this.injectSocialResult(socialGrid, { ...platform, handle: variant, title: profile.title, realName: realName, description: profile.description, image: profile.image?.url || `https://unavatar.io/${platform.id}/${variant}`, url: targetUrl, isBridgeMatch: isConfirmed, color: isConfirmed ? "from-amber-400 to-orange-600" : platform.color, icon: isConfirmed ? "link-2" : platform.icon });
                        }
                    }
                } catch (e) {}
            });
        });
    }

    injectSocialResult(parent, data) {
        if (!parent) return;
        const item = document.createElement('div');
        item.className = `glass-card p-4 rounded-xl border border-slate-800 hover:border-${data.isBridgeMatch ? 'amber-500' : 'purple-500'}/50 transition-all flex flex-col gap-2 relative overflow-hidden`;
        const badge = data.isBridgeMatch ? `<div class="absolute top-2 right-2 px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[7px] text-amber-500 font-bold uppercase tracking-tighter">🔗 Vínculo Confirmado</div>` : '';
        const pivotBtn = data.realName ? `<button data-name="${data.realName.replace(/"/g, '&quot;')}" onclick="window.osintApp.pivotToPersonSearch(this.getAttribute('data-name'))" class="w-full mt-3 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-[10px] font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2">Investigar: ${data.realName}</button>` : '';
        item.innerHTML = `${badge}<div class="flex items-center gap-3"><img src="${data.image}" class="w-10 h-10 rounded-lg border border-slate-700 object-cover shadow-lg shadow-black/50"><div class="min-w-0"><h4 class="text-xs font-bold text-white truncate">${data.title}</h4><p class="text-[9px] text-slate-500 truncate mono-font">@${data.handle}</p></div></div><p class="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">${data.description || 'Perfil identificado.'}</p><div class="mt-auto flex flex-col gap-2">${pivotBtn}<a href="${data.url}" target="_blank" class="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] text-center py-2 rounded-lg transition-all flex items-center justify-center gap-2">Acessar Perfil</a></div>`;
        parent.appendChild(item);
        this.refreshIcons();
    }

    injectLiveCard(grid, data) {
        const card = document.createElement('div');
        card.className = 'glass-card p-6 rounded-xl border border-purple-500/50 result-item animate-in flex flex-col md:col-span-2 lg:col-span-3 lg:col-span-4 bg-slate-900/60 shadow-2xl relative overflow-hidden mb-4';
        const detailsHtml = data.details ? `<div class="flex flex-wrap gap-4 mt-4">${data.details.map(d => `<div class="bg-slate-950 px-4 py-2 border border-slate-700 rounded-lg shadow-inner"><span class="text-[10px] uppercase text-slate-400 block mb-0.5">${d.label}</span>${d.link ? `<a href="${d.value}" target="_blank" class="text-purple-400 hover:underline">${d.value}</a>` : `<span class="font-bold text-white">${d.value}</span>`}</div>`).join('')}</div>` : '';
        card.innerHTML = `<div class="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-purple-500 to-cyan-500"></div><div class="flex flex-col sm:flex-row items-start sm:items-center gap-5 z-10 w-full pl-2">${data.avatar ? `<img src="${data.avatar}" class="w-20 h-20 rounded-full border-2 border-purple-500/30 object-cover shadow-lg">` : `<div class="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center"><i data-lucide="user" class="w-10 h-10 text-slate-500"></i></div>`}<div><h4 class="font-bold text-[11px] uppercase text-purple-400 mb-1">${data.platform} <span class="bg-purple-600/20 text-purple-300 px-1.5 py-0.5 rounded ml-2">LIVE INTEL</span></h4><h3 class="text-2xl font-bold text-white">${data.name}</h3><p class="text-sm text-slate-400 font-mono mt-1">@${data.username}</p>${data.about ? `<p class="text-sm text-slate-300 mt-3 italic">"${data.about}"</p>` : ''}${detailsHtml}</div></div>`;
        grid.prepend(card);
        this.refreshIcons();
    }

    renderHistory() {
        const list = document.getElementById('historyList');
        if (!list) return;
        if (this.history.length === 0) { list.innerHTML = `<span class="text-xs text-slate-600 italic">Sem histórico recente.</span>`; return; }
        list.innerHTML = this.history.map(item => `<button class="history-item text-[10px] bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800 px-3 py-1 rounded-full flex items-center gap-2 transition-all" data-type="${item.type}" data-query="${item.query}"><span class="opacity-40 uppercase">${item.type}</span><span class="font-medium">${item.query}</span></button>`).join('');
        list.querySelectorAll('.history-item').forEach(btn => {
            btn.onclick = (e) => {
                const { type, query } = e.currentTarget.dataset;
                const inputId = type === 'dorking' ? 'dorkInput' : (type === 'username' ? 'usernameInput' : `${type}Input`);
                if (document.getElementById(inputId)) document.getElementById(inputId).value = query;
                this.executeSearch(type, query);
            };
        });
    }

    clearHistory() { this.history = []; localStorage.removeItem('osint_history'); this.renderHistory(); this.showToast('Histórico limpo.'); }
    toggleTheme() { this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark'; localStorage.setItem('osint_theme', this.currentTheme); this.applyTheme(); }
    applyTheme() { const body = document.body; const toggleIcon = document.querySelector('#themeToggle i'); if (this.currentTheme === 'light') { body.classList.add('light-mode'); if (toggleIcon) toggleIcon.setAttribute('data-lucide', 'sun'); } else { body.classList.remove('light-mode'); if (toggleIcon) toggleIcon.setAttribute('data-lucide', 'moon'); } this.refreshIcons(); }
    showToast(message, type = 'info') { const toast = document.getElementById('toast'); const msgEl = document.getElementById('toastMessage'); if (!toast || !msgEl) return; msgEl.textContent = message; toast.classList.remove('opacity-0', 'translate-y-10'); toast.classList.add('opacity-100', 'translate-y-0'); setTimeout(() => { toast.classList.add('opacity-0', 'translate-y-10'); toast.classList.remove('opacity-100', 'translate-y-0'); }, 3000); }
    showFallbackTools(type, query) {
        const grid = document.getElementById('resultsGrid');
        const config = TOOLS_CONFIG[type];
        if (!grid || !config) return;
        
        this.showToast("Exibindo catálogo completo de ferramentas.");
        config.template.forEach(item => {
            // Check if already rendered
            const exists = Array.from(grid.querySelectorAll('h4')).some(h => h.textContent === item.name);
            if (!exists) {
                this.renderToolCard(item, query, grid);
            }
        });
    }

    renderToolCard(item, query, grid) {
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
        const dorkStringForEscaping = item.dork ? item.dork.split('{query}').join(query) : '';
        const safeDork = dorkStringForEscaping.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        const mineBtn = item.dork ? `<button data-dork="${safeDork}" onclick="window.osintApp.mineDorkResults(this.getAttribute('data-dork'), this)" class="mt-1 inline-flex items-center justify-center gap-2 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-[10px] font-bold py-2 px-4 rounded-lg transition-all w-full"><i data-lucide="microscope" class="w-3.5 h-3.5"></i> Minerar Todos Links</button>` : '';

        const card = document.createElement('div');
        card.className = 'glass-card p-4 rounded-xl result-item result-card-item animate-in flex flex-col justify-between h-full border-dashed border-slate-700';
        card.innerHTML = `<div class="mb-3 overflow-hidden"><h4 class="font-bold text-sm text-slate-200">${item.name}</h4><p class="text-[10px] text-slate-500 truncate mt-1 mono-font" title="${displayPath}">${displayPath}</p></div><div class="flex flex-col gap-2 mt-auto">${mineBtn}<a href="${finalUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold py-2 px-4 rounded-lg transition-colors border border-slate-700">Abrir Ferramenta <i data-lucide="external-link" class="w-3 h-3"></i></a></div>`;
        grid.appendChild(card);
        this.refreshIcons();
    }

    extractRealName(title, id) { if (!title) return null; let name = decodeURIComponent(title); if (id === 'instagram' || id === 'twitter') { const match = name.match(/^(.*?) \(@/i); if (match) name = match[1]; } else if (id === 'tiktok') { const parts = title.split(' - '); if (parts.length > 2) name = parts[parts.length - 1]; } name = name.replace(/ • Instagram.*/i, '').replace(/ \| GitHub/i, '').replace(/ \/ X/i, '').trim(); if (name.toLowerCase().includes('instagram') || name.toLowerCase().includes('twitter') || name.length < 2) return null; return name; }
}

(function() {
    const startApp = () => { window.osintApp = new OSINTApp(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startApp); else startApp();
})();
