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
        this.renderHistory();
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

        // Separate tools into those that need verification and those that don't
        Promise.all(config.template.map(item => this.validateAndRender(item, query, grid))).then(() => {
            const searchArea = document.getElementById('searchingArea');
            if (searchArea) {
                // Check if any results were added. If still empty (besides loader), show "No results"
                if (grid.children.length <= 1) {
                    searchArea.innerHTML = `
                        <div class="flex flex-col items-center gap-4">
                            <i data-lucide="search-x" class="w-12 h-12 text-slate-600"></i>
                            <h3 class="text-slate-200 font-bold text-lg">Nenhum registro encontrado</h3>
                            <p class="text-slate-500 text-sm max-w-sm mx-auto">Não foram detectados vínculos diretos para este nome nas bases auditadas.</p>
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
        this.showToast(`Auditoria de registros iniciada para: ${query}`, 'info');
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

        // If it's a dorking tool, we MUST verify results before showing the card
        if (item.dork) {
            try {
                const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(item.dork.split('{query}').join(query))}`;
                const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(searchUrl)}&data.results.selector=.result__title&data.results.type=list`);
                const data = await response.json();

                // If no results are found, skip this card
                if (!data.status === 'success' || !data.data.results || data.data.results.length === 0) {
                    return;
                }
            } catch (e) {
                // If the check fails (API down), we show it anyway as fallback
            }
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
            // Using DuckDuckGo as a reliable SERP source for background scraping
            const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(dork)}`;
            const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(searchUrl)}&data.results.selector=.result__title&data.results.type=list&data.results.attr=href`);
            const data = await response.json();

            if (data.status === 'success' && data.data.results) {
                const results = data.data.results;
                this.showToast(`Sucesso! Encontrados ${results.length} links diretos.`, 'success');
                
                // Create a results container if it doesn't exist
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
                    this.refreshIcons();
                }

                results.slice(0, 10).forEach(async (encodedLink) => {
                    // DuckDuckGo HTML links often come with proxying, but we can try to clean or fetch meta
                    const link = decodeURIComponent(encodedLink.split('uddg=')[1]?.split('&')[0] || encodedLink);
                    if (link.startsWith('http')) {
                        // Fetch meta for each link to show a nice card
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
            } else {
                this.showToast('Nenhum link direto encontrado nesta varredura.', 'info');
            }
        } catch (e) {
            this.showToast('Erro ao minerar links. Tente novamente.', 'error');
        } finally {
            btn.innerHTML = originalHtml;
            this.refreshIcons();
        }
    }

    addToHistory(type, query) {
        this.history = this.history.filter(item => !(item.type === type && item.query === query));
        this.history.unshift({ type, query, timestamp: new Date().toISOString() });
        if (this.history.length > 5) this.history = this.history.slice(0, 5);
        localStorage.setItem('osint_history', JSON.stringify(this.history));
        this.renderHistory();
    }

    extractUsername(query) {
        if (query.includes('@')) {
            return query.split('@')[0];
        }
        return query;
    }

    extractRealName(title, id) {
        if (!title) return null;
        let name = decodeURIComponent(title);
        // Instagram: "Full Name (@username) • Instagram photos"
        if (id === 'instagram') {
            const match = name.match(/^(.*?) \(@/i);
            if (match) name = match[1];
        }
        // Twitter: "Username (@handle) / X"
        else if (id === 'twitter') {
            const match = name.match(/^(.*?) \(@/i);
            if (match) name = match[1];
        }
        // TikTok: "TikTok - @handle - Full Name" or similar
        else if (id === 'tiktok') {
            const parts = title.split(' - ');
            if (parts.length > 2) name = parts[parts.length - 1];
        }
        
        // Clean up common suffixes
        name = name.replace(/ • Instagram.*/i, '')
                   .replace(/ \| GitHub/i, '')
                   .replace(/ \/ X/i, '')
                   .trim();
        
        // If the "name" is just the username or generic, return null
        if (name.toLowerCase().includes('instagram') || name.toLowerCase().includes('twitter') || name.length < 2) return null;
        return name;
    }

    pivotToPersonSearch(name) {
        const decodedName = decodeURIComponent(name);
        const input = document.getElementById('usernameInput');
        if (input) {
            input.value = decodedName;
            this.handleSearch('username');
            this.showToast(`Pivoting: Investigating "${decodedName}"`, 'success');
        }
    }

    // --- Intelligence Parsing Engine ---
    parseIntel(source, data) {
        const text = `${data.title} ${data.description}`.toLowerCase();
        
        // Extract Emails
        const emails = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
        if (emails) emails.forEach(e => this.currentIntel.emails.add(e));

        // Extract Brazilian Phones
        const phones = text.match(/(?:\(?\d{2}\)?\s?)?9\d{4}[-\s]?\d{4}/g);
        if (phones) phones.forEach(p => this.currentIntel.phones.add(p));

        // Extract handles (@name)
        const handles = text.match(/@([a-zA-Z0-9._]+)/g);
        if (handles) handles.forEach(h => this.currentIntel.handles.add(h));

        // Identity
        if (data.realName && (!this.currentIntel.bestName || data.realName.length > this.currentIntel.bestName.length)) {
            this.currentIntel.bestName = data.realName;
        }
        if (data.image && !this.currentIntel.bestAvatar) {
            this.currentIntel.bestAvatar = data.image;
        }

        // Deep Search recursively if we find new leads
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
        const handleList = Array.from(this.currentIntel.handles);

        if (emailList.length === 0 && phoneList.length === 0 && !this.currentIntel.bestName) {
            reportContainer.innerHTML = '';
            return;
        }

        reportContainer.innerHTML = `
            <div class="glass-card p-8 rounded-2xl border-2 border-purple-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-900/20 shadow-2xl relative overflow-hidden">
                <div class="absolute top-0 right-0 p-4 opacity-10">
                    <i data-lucide="shield-check" class="w-24 h-24 text-purple-500"></i>
                </div>
                
                <div class="flex flex-col md:flex-row gap-8 items-start relative z-10">
                    <div class="shrink-0">
                        <img src="${this.currentIntel.bestAvatar || 'https://via.placeholder.com/150'}" class="w-32 h-32 rounded-2xl object-cover border-4 border-slate-800 shadow-2xl shadow-purple-500/20">
                    </div>
                    
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                             <span class="px-2 py-0.5 bg-purple-500 text-white text-[10px] font-bold rounded uppercase tracking-wider">Perfil Consolidado</span>
                        </div>
                        <h2 class="text-3xl font-black text-white mb-2">${this.currentIntel.bestName || 'Identidade em Analise'}</h2>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                            <div>
                                <h4 class="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-3 flex items-center gap-2">
                                    <i data-lucide="mail" class="w-3 h-3 text-purple-400"></i> Contatos de E-mail
                                </h4>
                                <div class="space-y-2">
                                    ${emailList.length ? emailList.map(e => `<div class="text-sm text-slate-200 font-mono bg-slate-800/50 p-2 rounded border border-slate-700/50">${e}</div>`).join('') : '<span class="text-slate-600 text-xs italic">Nenhum email direto encontrado...</span>'}
                                </div>
                            </div>
                            
                            <div>
                                <h4 class="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-3 flex items-center gap-2">
                                    <i data-lucide="phone" class="w-3 h-3 text-purple-400"></i> Telefonia / WhatsApp
                                </h4>
                                <div class="space-y-2">
                                    ${phoneList.length ? phoneList.map(p => `
                                        <div class="flex items-center justify-between bg-slate-800/50 p-2 rounded border border-slate-700/50">
                                            <span class="text-sm text-slate-200 font-mono">${p}</span>
                                            <a href="https://wa.me/${p.replace(/\D/g, '')}" target="_blank" class="text-emerald-400 hover:text-emerald-300 transition-colors">
                                                <i data-lucide="message-circle" class="w-4 h-4"></i>
                                            </a>
                                        </div>
                                    `).join('') : '<span class="text-slate-600 text-xs italic">Nenhum telefone direto encontrado...</span>'}
                                </div>
                            </div>
                        </div>

                        <div class="mt-8 pt-6 border-t border-slate-800/50">
                            <h4 class="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-3">Próximos Passos de Investigação</h4>
                            <div class="flex flex-wrap gap-2">
                                <button onclick="window.osintApp.pivotToPersonSearch('${(this.currentIntel.bestName || "").replace(/'/g, "\\'")}')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded transition-all border border-slate-700 flex items-center gap-2">
                                    <i data-lucide="search" class="w-3 h-3"></i> Pesquisa Jurídica
                                </button>
                                ${emailList.map(e => `
                                    <button onclick="document.getElementById('emailInput').value='${e}'; window.osintApp.handleSearch('email')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded transition-all border border-slate-700 flex items-center gap-2">
                                        <i data-lucide="mail" class="w-3 h-3"></i> Validar ${e.split('@')[0]}...
                                    </button>
                                `).join('')}
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
        this.scannedHandles = new Set();
        this.scannedHandles.add(username);
        
        // Reset local intel for a fresh scan
        this.currentIntel = {
            emails: new Set(),
            phones: new Set(),
            handles: new Set(),
            bestName: null,
            bestAvatar: null,
            location: null
        };

        // 1. Email Specific Path: No guessing, only technical bridges
        if (type === 'email') {
            this.showToast("Iniciando Varredura de Identidade Técnica...", "info");
            this.scanGravatar(query, grid);
            this.scanEmailCorrelations(query, grid);
            this.scanGitHubByEmail(query, grid);
            // We NO LONGER call scanSocialPlatforms(username) here to avoid guesses.
            // scanSocialPlatforms will only be called IF a bridge finds a confirmed handle.
        }

        // 2. Social Media Handle Scan: Only if specifically requested as a handle
        if (type === 'username') {
            this.scanSocialPlatforms(username, grid);
            // DEEP HARVEST: Crawl Instagram for ALL linked accounts
            this.harvestSocialProfiles(query, 'instagram', grid);
            this.harvestSocialProfiles(query, 'linkedin', grid);
        }
    }

    async harvestSocialProfiles(query, platformId, grid) {
        const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId);
        if (!platform) return;

        try {
            // Dork to find multiple profiles indexed on the site
            const dork = `site:${new URL(platform.url.replace('{query}', 'abc')).hostname} "${query}"`;
            const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(dork)}`;
            const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(searchUrl)}&data.results.selector=.result__title&data.results.type=list&data.results.attr=href`);
            const data = await response.json();

            if (data.status === 'success' && data.data.results) {
                // Deduplicate and filter out non-profile links
                const links = [...new Set(data.data.results)]
                    .filter(link => {
                        const l = link.toLowerCase();
                        return l.includes(platformId) && 
                               !l.includes('/p/') && // Skip posts
                               !l.includes('/explore/') && // Skip explore
                               !l.includes('/tags/') && // Skip tags
                               !l.includes('/search'); // Skip search
                    });

                links.slice(0, 5).forEach(async (encodedLink) => {
                    const link = decodeURIComponent(encodedLink.split('uddg=')[1]?.split('&')[0] || encodedLink);
                    const handle = link.split('/').filter(p => p).pop().split('?')[0];

                    if (handle && !this.scannedHandles.has(handle)) {
                        this.scannedHandles.add(handle);
                        
                        // Validate this specific harvested handle
                        const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(link)}&meta=true`);
                        const profileData = await res.json();

                        if (profileData.status === 'success' && profileData.data.title) {
                            const profile = profileData.data;
                            const titleLower = profile.title.toLowerCase();
                            const descLower = (profile.description || '').toLowerCase();

                            // Strict validation for existence
                            const isNotFound = titleLower.includes('404') || 
                                             titleLower.includes('page not found') || 
                                             descLower.includes('não perca o que está acontecendo') ||
                                             descLower === 'tiktok pwa' ||
                                             profile.title.trim() === platform.name ||
                                             (platform.id === 'instagram' && !titleLower.includes('instagram')) ||
                                             (platform.id === 'instagram' && (titleLower === 'instagram' || descLower.includes('login')));

                            if (!isNotFound) {
                                this.injectSocialResult(grid, {
                                    ...platform,
                                    handle: handle,
                                    title: profile.title,
                                    realName: this.extractRealName(profile.title, platform.id),
                                    description: profile.description,
                                    image: profile.image?.url || `https://unavatar.io/${platform.id}/${handle}`,
                                    url: link,
                                    isBridgeMatch: true, // Mark as discovered via scan
                                    color: "from-cyan-400 to-blue-600", // Distinguishing color for harvested results
                                    icon: "search"
                                });
                            }
                        }
                    }
                });
            }
        } catch (e) {}
    }

    async scanGitHubByEmail(email, grid) {
        try {
            // Commit Searching is much more powerful - it finds the author-email even in private-settings profiles
            const response = await fetch(`https://api.github.com/search/commits?q=author-email:${encodeURIComponent(email)}`, {
                headers: { 'Accept': 'application/vnd.github.cloak-preview+json' }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.total_count > 0) {
                    const commit = data.items[0];
                    const user = commit.author; // This contains the login/username
                    
                    if (user) {
                        this.injectSocialResult(grid, {
                            id: 'github',
                            name: 'GitHub',
                            handle: user.login,
                            title: `ID Técnico: ${user.login}`,
                            description: `Vínculo técnico confirmado via código-fonte (Commit History).`,
                            image: user.avatar_url,
                            url: user.html_url,
                            isBridgeMatch: true,
                            color: "from-amber-400 to-orange-600",
                            icon: "code"
                        });
                        
                        // Auto-Pivot to this new technical identity
                        this.pivotDeepScan(user.login, grid);

                        // DEEP MINING: Mine public events for hidden emails in commits
                        this.mineGitHubEvents(user.login, grid);
                    }
                }
            }
        } catch(e) {}
    }

    async mineGitHubEvents(handle, grid) {
        try {
            const response = await fetch(`https://api.github.com/users/${handle}/events/public`);
            if (response.ok) {
                const events = await response.json();
                events.forEach(event => {
                    if (event.type === 'PushEvent' && event.payload.commits) {
                        event.payload.commits.forEach(commit => {
                            if (commit.author && commit.author.email) {
                                const email = commit.author.email;
                                if (!this.currentIntel.emails.has(email)) {
                                    this.currentIntel.emails.add(email);
                                    this.showToast(`Deep Mining: Extraído e-mail do histórico de código!`, 'success');
                                    this.updateIntelligenceReport();
                                    
                                    // Recursive Pivot: Scan this newly found email!
                                    const gridRes = document.getElementById('resultsGrid');
                                    this.performLiveOSINT('email', email, gridRes);
                                }
                            }
                        });
                    }
                });
            }
        } catch(e) {}
    }

    pivotDeepScan(newHandle, grid) {
        if (!this.scannedHandles.has(newHandle)) {
            this.scannedHandles.add(newHandle);
            this.showToast(`Pivoting: Investigating new handle "${newHandle}"`, 'success');
            // When pivoting from a confirmed bridge, every result found is also confirmed
            this.scanSocialPlatforms(newHandle, grid, true);
        }
    }

    async scanEmailCorrelations(email, grid) {
        // Targeted platforms for Email in Bio (Dork-based via Microlink)
        const targets = [
            { id: 'instagram', site: 'instagram.com', regex: /instagram\.com\/([a-zA-Z0-9._]+)/i },
            { id: 'twitter', site: 'twitter.com', regex: /twitter\.com\/([a-zA-Z0-9._]+)/i },
            { id: 'tiktok', site: 'tiktok.com', regex: /tiktok\.com\/@([a-zA-Z0-9._]+)/i },
            { id: 'pinterest', site: 'pinterest.com', regex: /pinterest\.com\/([a-zA-Z0-9._]+)/i },
            { id: 'youtube', site: 'youtube.com', regex: /youtube\.com\/@([a-zA-Z0-9._]+)/i }
        ];

        targets.forEach(async (t) => {
            try {
                const dork = `site:${t.site} "${email}"`;
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(dork)}`;
                const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(searchUrl)}&meta=true`);
                const data = await response.json();

                if (data.status === 'success' && data.data.title && !data.data.title.includes('Google Search')) {
                    // Extract potential handle from the result URL if found
                    const match = data.data.url.match(t.regex);
                    const handle = match ? match[1] : "Vínculo Direto";

                    this.injectSocialResult(grid, {
                        id: t.id,
                        name: t.id.charAt(0).toUpperCase() + t.id.slice(1),
                        handle: handle,
                        title: `Vínculo: ${data.data.title}`,
                        description: `Deteção por varredura de metadados: "${data.data.description.substring(0, 100)}..."`,
                        image: `https://unavatar.io/${t.id}/${handle}`,
                        url: data.data.url,
                        isEmailMatch: true,
                        color: "from-emerald-500 to-teal-600",
                        icon: "mail-search"
                    });

                    // If we found a real handle, pivot to it!
                    if (handle !== "Vínculo Direto") {
                        this.pivotDeepScan(handle, grid);
                    }
                }
            } catch (e) {}
        });
    }

    async scanGravatar(email, grid) {
        try {
            const hash = CryptoJS.MD5(email.toLowerCase().trim()).toString();
            const response = await fetch(`https://en.gravatar.com/${hash}.json`);
            if (response.ok) {
                const data = await response.json();
                const profile = data.entry[0];
                
                // Show Main Gravatar Card
                this.injectLiveCard(grid, {
                    platform: "Gravatar Profile",
                    icon: "fingerprint",
                    avatar: profile.thumbnailUrl,
                    name: profile.displayName || profile.preferredUsername || "Email Ativo",
                    username: profile.preferredUsername || "N/A",
                    details: [{ label: "Profile", value: profile.profileUrl, link: true }],
                    about: profile.aboutMe || "Identidade confirmada vinculada a este e-mail."
                });

                // --- SOCIAL BRIDGE: Verified Accounts ---
                if (profile.verifiedAccounts && profile.verifiedAccounts.length > 0) {
                    profile.verifiedAccounts.forEach(acc => {
                        const serviceId = acc.shortname || acc.service_type;
                        const handle = acc.url.split('/').pop().split('?')[0];

                        this.injectSocialResult(grid, {
                            id: serviceId,
                            name: acc.service_label || serviceId,
                            handle: handle,
                            title: `Verificado: ${acc.service_label}`,
                            description: `Esta conta foi vinculada e verificada pelo dono do e-mail no Gravatar.`,
                            image: acc.service_icon || `https://unavatar.io/${serviceId}/${handle}`,
                            url: acc.url,
                            isBridgeMatch: true,
                            color: "from-amber-400 to-orange-600",
                            icon: "link-2"
                        });

                        // Important: Auto-Pivot to discover more on this specific handle
                        this.pivotDeepScan(handle, grid);
                    });
                }
            }
        } catch(e) {}
    }

    async scanSocialPlatforms(username, grid, isConfirmed = false) {
        // Remove manual variation chips if they left artifacts
        const oldVars = document.getElementById('variantContainer');
        if (oldVars) oldVars.remove();

        // Prepare a container for social results
        const socialGridId = `social-results-${Date.now()}`;
        const container = document.createElement('div');
        container.className = 'col-span-1 md:col-span-2 lg:col-span-3 lg:col-span-4 animate-in mt-2 mb-6';
        const accentColor = isConfirmed ? "amber-500" : "purple-500";
        const title = isConfirmed ? "VÍNCULO CONFIRMADO: REDE DE IDENTIDADE" : "Cross-Platform Account Scan (Fuzzy Mode)";
        const icon = isConfirmed ? "shield-check" : "shield-search";

        container.innerHTML = `
            <div class="flex items-center gap-3 mb-4 px-2">
                <div class="h-px flex-1 bg-gradient-to-r from-transparent via-${accentColor}/30 to-transparent"></div>
                <h3 class="text-[10px] font-bold uppercase tracking-widest text-${accentColor} flex items-center gap-2">
                    <i data-lucide="${icon}" class="w-3 h-3"></i> ${title}
                </h3>
                <div class="h-px flex-1 bg-gradient-to-r from-transparent via-${accentColor}/30 to-transparent"></div>
            </div>
            <div id="${socialGridId}" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-2">
                <!-- Platform results will pop in here -->
            </div>
        `;
        grid.prepend(container);
        this.refreshIcons();

        const socialGrid = document.getElementById(socialGridId);
        
        // If confirmed, search ONLY for the exact handle. If fuzzy, generate variations.
        const variants = isConfirmed ? [username] : this.generateVariations(username);
        if (!isConfirmed) variants.unshift(username);

        // Scan all variants across all platforms
        variants.forEach((variant) => {
            SOCIAL_PLATFORMS.forEach(async (platform) => {
                try {
                    const targetUrl = platform.url.replace('{query}', variant);
                    const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(targetUrl)}&screenshot=false&meta=true`);
                    const data = await response.json();

                    if (data.status === 'success' && data.data.title) {
                        const profile = data.data;
                        const titleLower = profile.title.toLowerCase();
                        const descLower = (profile.description || '').toLowerCase();
                        
                        const isNotFound = titleLower.includes('404') || 
                                         titleLower.includes('page not found') || 
                                         titleLower.includes('página não encontrada') || 
                                         titleLower.includes('content not available') || 
                                         titleLower.includes('couldn\'t find this account') ||
                                         titleLower.includes('visit tiktok to discover') ||
                                         titleLower.includes('faça o seu dia') ||
                                         titleLower.includes('não perca o que está acontecendo') ||
                                         titleLower.includes('buy this domain') ||
                                         titleLower.includes('authorization') ||
                                         titleLower.includes('unauthorized') ||
                                         titleLower.includes('sign in') ||
                                         profile.title.trim() === platform.name ||
                                         profile.title === 'X' ||
                                         profile.title === 'Perfil / X' ||
                                         descLower.includes('não perca o que está acontecendo') ||
                                         descLower === 'tiktok pwa' ||
                                         (platform.id === 'twitter' && (profile.title === 'X' || profile.title === 'Twitter')) ||
                                         (platform.id === 'instagram' && !profile.title.includes('• Instagram')) ||
                                         (platform.id === 'tiktok' && (!profile.title.includes('TikTok') || titleLower.includes('faça o seu dia'))) ||
                                         (platform.id === 'twitch' && descLower.includes('twitch is the world')) ||
                                         (platform.id === 'behance' && titleLower.includes('behance.net')) ||
                                         (platform.id === 'linkedin' && (titleLower.includes('google search') || titleLower.includes('pre-auth')));

                        if (!isNotFound) {
                            const realName = this.extractRealName(profile.title, platform.id);
                            const resultData = {
                                ...platform,
                                handle: variant, // Show the actual variation found
                                title: profile.title,
                                realName: realName,
                                description: profile.description,
                                image: profile.image?.url || `https://unavatar.io/${platform.id}/${variant}`,
                                url: targetUrl,
                                // ONLY Force Bridge style if isConfirmed is truly true (Email Bridge detected it)
                                isBridgeMatch: isConfirmed,
                                color: isConfirmed ? "from-amber-400 to-orange-600" : platform.color,
                                icon: isConfirmed ? "link-2" : platform.icon
                            };
                            
                            this.injectSocialResult(socialGrid, resultData);
                            this.parseIntel(platform.id, resultData);
                        }
                    }
                } catch (e) {}
            });
        });
    }

    injectSocialResult(parent, data) {
        const item = document.createElement('div');
        item.className = 'glass-card p-5 rounded-xl border border-slate-800 hover:border-purple-500/50 transition-all group overflow-hidden relative flex flex-col justify-between h-full';
        
        let statsHtml = '';
        if (data.description && data.id === 'instagram') {
            const match = data.description.match(/([\d.kmb]+) Followers/i);
            if (match) {
                statsHtml = `<div class="mt-2 py-1 px-2 bg-purple-500/10 border border-purple-500/20 rounded text-[10px] text-purple-300 w-fit flex items-center gap-1.5"><i data-lucide="users" class="w-3 h-3"></i> ${match[0]}</div>`;
            }
        }

        const pivotBtn = data.realName ? `
            <button data-name="${data.realName.replace(/"/g, '&quot;')}" onclick="window.osintApp.pivotToPersonSearch(this.getAttribute('data-name'))" 
                class="w-full mt-3 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-[10px] font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2">
                <i data-lucide="crosshair" class="w-3 h-3"></i> Investigar: ${data.realName}
            </button>
        ` : '';

        const badgeHtml = data.isEmailMatch ? `
            <div class="absolute top-3 right-3 px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded text-[9px] text-emerald-400 font-bold uppercase tracking-tighter flex items-center gap-1 z-20">
                <i data-lucide="check-circle" class="w-2.5 h-2.5"></i> Vínculo por E-mail
            </div>
        ` : (data.isBridgeMatch ? `
            <div class="absolute top-3 right-3 px-2 py-1 bg-amber-500/20 border border-amber-500/30 rounded text-[9px] text-amber-400 font-bold uppercase tracking-tighter flex items-center gap-1 z-20">
                <i data-lucide="link-2" class="w-2.5 h-2.5"></i> Vínculo Confirmado
            </div>
        ` : '');

        const cardStyle = data.isBridgeMatch ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-slate-800';

        item.innerHTML = `
            ${badgeHtml}
            <div class="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br ${data.color} opacity-5 blur-2xl rounded-full group-hover:opacity-20 transition-opacity"></div>
            
            <div class="relative z-10">
                <div class="flex items-center gap-4 mb-4">
                    <div class="relative">
                        <img src="${data.image}" class="w-12 h-12 rounded-xl object-cover border-2 ${data.isBridgeMatch ? 'border-amber-500' : 'border-slate-700'} group-hover:border-purple-500/50 transition-colors shadow-lg" onerror="this.src='https://unavatar.io/${data.id}/${data.handle}?fallback=https://via.placeholder.com/100'">
                        <div class="absolute -bottom-1 -right-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
                             <i data-lucide="${data.icon}" class="w-3 h-3 text-slate-300"></i>
                        </div>
                    </div>
                    <div class="min-w-0">
                        <h4 class="font-bold text-sm text-white truncate">${data.realName || data.name}</h4>
                        <p class="text-[11px] text-slate-500 font-mono">@${data.handle}</p>
                    </div>
                </div>

                ${statsHtml}

                <p class="text-[10px] text-slate-400 line-clamp-2 mt-3 leading-relaxed">
                    ${data.description || 'Perfil identificado e validado.'}
                </p>
            </div>
            
            <div class="mt-6 flex flex-col gap-2 relative z-10">
                ${pivotBtn}
                <a href="${data.url}" target="_blank" class="w-full ${data.isBridgeMatch ? 'bg-amber-600/20 hover:bg-amber-600 text-amber-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'} border border-slate-700 text-[10px] text-center py-2 rounded-lg transition-all hover:text-white flex items-center justify-center gap-2">
                    <i data-lucide="external-link" class="w-3 h-3"></i> Acessar Perfil
                </a>
            </div>
        `;
        parent.appendChild(item);
        this.refreshIcons();
    }

    injectLiveCard(grid, data) {
        const card = document.createElement('div');
        // Make it span all columns, distinctive border, vibrant background
        card.className = 'glass-card p-6 rounded-xl border border-purple-500/50 result-item animate-in flex flex-col md:col-span-2 lg:col-span-3 lg:col-span-4 bg-slate-900/60 shadow-[0_0_20px_rgba(168,85,247,0.15)] relative overflow-hidden mb-4';
        
        let detailsHtml = '';
        if (data.details && data.details.length) {
             detailsHtml = `<div class="flex flex-wrap gap-4 mt-4">` + 
                 data.details.map(d => {
                     const val = d.link ? `<a href="${d.value}" target="_blank" class="text-purple-400 hover:text-purple-300 hover:underline break-all transition-colors">${d.value}</a>` : `<span class="font-bold text-slate-100 text-lg">${d.value}</span>`;
                     return `<div class="bg-slate-950/80 rounded-lg px-4 py-2 border border-slate-700/50 shadow-inner flex flex-col justify-center"><span class="text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5">${d.label}</span>${val}</div>`;
                 }).join('') + `</div>`;
        }

        const iconStr = data.icon === 'code' ? `<i data-lucide="code" class="w-5 h-5"></i>` : `<i data-lucide="${data.icon}" class="w-5 h-5"></i>`;

        card.innerHTML = `
            <!-- Accent Bar -->
            <div class="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-purple-500 to-cyan-500"></div>
            
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5 z-10 w-full pl-2">
                ${data.avatar ? `<div class="relative"><img src="${data.avatar}" alt="Avatar" class="w-20 h-20 rounded-full border-2 border-purple-500/30 object-cover shadow-lg shadow-purple-500/20"><div class="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-slate-900 rounded-full"></div></div>` : `<div class="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700 shadow-lg"><i data-lucide="user" class="w-10 h-10 text-slate-500"></i></div>`}
                
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 text-purple-400 mb-1.5">
                        ${iconStr}
                        <h4 class="font-bold text-[11px] uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">${data.platform} <span class="bg-purple-600/20 border border-purple-500/30 text-purple-300 text-[9px] px-1.5 py-0.5 rounded ml-2 tracking-normal font-mono">LIVE INTELLIGENCE</span></h4>
                    </div>
                    <div class="flex items-center gap-3">
                        <h3 class="text-2xl font-bold text-white truncate">${data.name}</h3>
                        ${data.link ? `<a href="${data.link}" target="_blank" class="shrink-0 bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white p-1.5 rounded-md transition-all shadow-sm group">
                            <i data-lucide="external-link" class="w-4 h-4 group-hover:scale-110 transition-transform"></i>
                        </a>` : ''}
                    </div>
                    <p class="text-sm text-slate-400 font-mono mt-1 flex items-center gap-1.5">
                        <i data-lucide="at-sign" class="w-3.5 h-3.5"></i>${data.username}
                    </p>
                    
                    ${data.about ? `<p class="text-sm text-slate-300 mt-3 bg-slate-800/40 p-3 rounded-lg border border-slate-700/50 italic w-full sm:w-11/12">"${data.about}"</p>` : ''}
                    
                    ${detailsHtml}
                </div>
            </div>
        `;
        // Prepend so it shows at the top of results
        grid.prepend(card);
        this.refreshIcons();
    }

    renderHistory() {
        const list = document.getElementById('historyList');
        if (!list) return;
        if (this.history.length === 0) {
            list.innerHTML = `<span class="text-xs text-slate-600 italic">Sem histórico recente.</span>`;
            return;
        }

        list.innerHTML = this.history.map(item => `
            <button class="history-item text-[10px] bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800 px-3 py-1 rounded-full flex items-center gap-2 transition-all"
                data-type="${item.type}" data-query="${item.query}">
                <span class="opacity-40 uppercase">${item.type}</span>
                <span class="font-medium">${item.query}</span>
            </button>
        `).join('');

        list.querySelectorAll('.history-item').forEach(btn => {
            btn.onclick = (e) => {
                const { type, query } = e.currentTarget.dataset;
                const inputId = type === 'dorking' ? 'dorkInput' : (type === 'username' ? 'usernameInput' : `${type}Input`);
                const el = document.getElementById(inputId);
                if (el) el.value = query;
                this.executeSearch(type, query);
            };
        });
    }

    clearHistory() {
        this.history = [];
        localStorage.removeItem('osint_history');
        this.renderHistory();
        this.showToast('Histórico limpo.');
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

// Inicialização segura
(function() {
    const startApp = () => {
        window.osintApp = new OSINTApp();
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startApp);
    } else {
        startApp();
    }
})();
