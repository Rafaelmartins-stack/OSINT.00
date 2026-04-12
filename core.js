/**
 * OSINT Toolkit - Core v3.1 (Force Sync Edition)
 */

const TOOLS_CONFIG = {
    username: {
        title: "Person Search",
        icon: "fingerprint",
        template: [
            { id: 'instagram', name: "Instagram", exactUrl: 'https://instagram.com/{username}' },
            { id: 'twitter', name: "Twitter/X", exactUrl: 'https://twitter.com/{username}' },
            { id: 'tiktok', name: "TikTok", exactUrl: 'https://tiktok.com/@{username}' },
            { id: 'github', name: "GitHub", exactUrl: 'https://github.com/{username}' },
            { name: "Escavador", url: "https://www.escavador.com/busca?q={query}" },
            { name: "Jusbrasil", url: "https://www.jusbrasil.com.br/busca?q={query}" },
            { name: "LinkedIn", dork: 'site:linkedin.com/in/ "{query}"' },
            { id: 'gov_docs', name: "Diários e Listas (PDF)", dork: 'filetype:pdf "{query}"' },
            { id: 'spreadsheets', name: "Planilhas de Dados (XLS/CSV)", dork: '(filetype:xls OR filetype:xlsx OR filetype:csv) "{query}"' },
            { id: 'txt_leaks', name: "Vazamentos em Texto (TXT)", dork: 'filetype:txt "{query}"' },
            { id: 'global_person', name: "Deep Mentions em Sites", dork: '"{query}"' }
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
            { id: 'epieos', name: "Epieos (Deep Reverse Mail)", exactUrl: 'https://epieos.com/?q={query}' },
            { id: 'intelx', name: "IntelligenceX (Data Leaks)", exactUrl: 'https://intelx.io/?s={query}' },
            { id: 'thatsthem', name: "ThatsThem Directory", exactUrl: 'https://thatsthem.com/email/{query}' },
            { id: 'gravatar', name: "Gravatar Search", exactUrl: 'https://en.gravatar.com/site/check/{query}' },
            { id: 'github_dork', name: "GitHub Mentions", dork: 'site:github.com "{query}"' },
            { id: 'pastebin_dork', name: "Pastebin Leaks", dork: 'site:pastebin.com "{query}"' },
            { id: 'google_dork', name: "Global Web Mentions", dork: '"{query}" -site:google.com' },
            { id: 'leak', name: "Generic Data Breaches", dork: '"{query}" password OR "data leak"' }
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
        try {
            this.setupEventListeners();
            this.renderHistory();
            this.applyTheme();
            this.refreshIcons();
            console.log("Core v3.1 Loaded Successfully");
        } catch (e) {
            console.error("Initialization failed:", e);
        }
    }

    refreshIcons() { if (window.lucide) window.lucide.createIcons(); }

    setupEventListeners() {
        // Search Buttons
        document.querySelectorAll('.search-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleSearch(e.currentTarget.getAttribute('data-type')));
        });

        // Enter Key listeners
        ['usernameInput', 'domainInput', 'dorkInput', 'emailInput', 'scraperTargetInput', 'scraperUrlInput'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('keypress', (e) => { 
                if (e.key === 'Enter') {
                    if (id.includes('scraper')) this.handleSearch('scraper');
                    else this.handleSearch(id.replace('Input', '')); 
                }
            });
        });

        // Toggle Theme
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) themeBtn.addEventListener('click', () => {
            this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('osint_theme', this.currentTheme);
            this.applyTheme();
            this.showToast(`Mode: ${this.currentTheme}`, 'info');
        });

        // Clear History
        const clearBtn = document.getElementById('clearHistory');
        if (clearBtn) clearBtn.addEventListener('click', () => {
            if (confirm('Clear search history?')) {
                this.history = [];
                localStorage.removeItem('osint_history');
                this.renderHistory();
                this.showToast('History cleared', 'info');
            }
        });
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const msgEl = document.getElementById('toastMessage');
        if (!toast || !msgEl) return;
        
        msgEl.textContent = message.toUpperCase();
        toast.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
        setTimeout(() => toast.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none'), 3000);
    }

    handleSearch(type) {
        if (type === 'scraper') {
            const nameEl = document.getElementById('scraperTargetInput');
            const urlEl = document.getElementById('scraperUrlInput');
            if (!nameEl || !urlEl || !nameEl.value.trim() || !urlEl.value.trim()) {
                this.showToast('Please provide both Target Name and PDF URL.', 'error');
                return;
            }
            this.extractDocumentEvidence(urlEl.value.trim(), nameEl.value.trim());
            return;
        }

        const id = type === 'email' ? 'emailInput' : 
                   (type === 'username' ? 'usernameInput' : 
                   (type === 'dorking' ? 'dorkInput' : `${type}Input`));
        const inputEl = document.getElementById(id);
        if (!inputEl || !inputEl.value.trim()) return;
        this.executeSearch(type, inputEl.value.trim());
    }

    async extractDocumentEvidence(url, query) {
        const resultsSection = document.getElementById('resultsSection');
        const grid = document.getElementById('resultsGrid');
        const metaEl = document.getElementById('resultMeta');
        
        if (resultsSection) resultsSection.classList.remove('hidden');
        if (metaEl) metaEl.textContent = `SCRAPING: ${query.toUpperCase()}`;

        if (grid) {
            grid.innerHTML = `
                <div id="loader" class="col-span-full py-16 flex flex-col items-center justify-center gap-4 animate-pulse">
                    <div class="relative w-20 h-20">
                        <div class="absolute inset-0 border-4 border-rose-500/10 rounded-full"></div>
                        <div class="absolute inset-0 border-4 border-t-rose-500 rounded-full animate-spin"></div>
                    </div>
                    <p class="text-[10px] font-black uppercase tracking-[0.4em] text-rose-400">Bypassing Security & Memory-Parsing PDF...</p>
                </div>
            `;
            this.refreshIcons();
        }

        this.showToast(`Scraping Document...`, 'info');

        try {
            if (!window.pdfjsLib) throw new Error("PDF Engine not loaded yet.");
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
            const loadingTask = pdfjsLib.getDocument(proxyUrl);
            const pdf = await loadingTask.promise;
            
            let fullText = '';
            for(let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\\n';
            }

            const searchIndex = fullText.toLowerCase().indexOf(query.toLowerCase());
            
            if (searchIndex !== -1) {
                const snippetStart = Math.max(0, searchIndex - 250);
                const snippetEnd = Math.min(fullText.length, searchIndex + query.length + 250);
                let snippet = fullText.substring(snippetStart, snippetEnd);
                
                const regex = new RegExp(`(${query.replace(/[-/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&')})`, 'gi');
                const highlightedSnippet = snippet.replace(regex, '<span class="bg-rose-500 text-white px-1 font-black rounded-sm shadow-lg shadow-rose-500/50 scale-105 inline-block">$1</span>');

                grid.innerHTML = `
                    <div class="col-span-full glass-card p-8 rounded-3xl border border-rose-500/50 bg-rose-500/5 transition-all">
                        <div class="flex items-center justify-between mb-6">
                            <div class="flex items-center gap-4">
                                <i data-lucide="file-check-2" class="w-8 h-8 text-rose-400"></i>
                                <div>
                                    <h4 class="text-sm font-black text-rose-400 uppercase tracking-widest">EVIDENCE EXTRACTED</h4>
                                    <a href="${url}" target="_blank" class="text-[9px] text-slate-400 font-mono hover:text-rose-300">View Original File</a>
                                </div>
                            </div>
                            <span class="text-[10px] bg-slate-900 border border-rose-500/30 px-3 py-1 rounded-md text-rose-300 mono-font">Scanned ${pdf.numPages} Pages</span>
                        </div>
                        <div class="bg-slate-950 p-6 rounded-2xl border border-rose-500/20 shadow-inner font-mono text-[10px] text-slate-300 leading-relaxed whitespace-pre-wrap">${highlightedSnippet}</div>
                    </div>
                `;
            } else {
                throw new Error("Target name not found in the parsed document.");
            }
        } catch (e) {
            grid.innerHTML = `
                <div class="col-span-full glass-card p-6 rounded-3xl border border-red-500/40 text-center">
                    <i data-lucide="alert-triangle" class="w-8 h-8 text-red-500 mx-auto mb-3"></i>
                    <p class="text-xs text-slate-400 uppercase font-black mb-2">Extraction Failed</p>
                    <p class="text-[9px] text-slate-500 font-mono">${e.message}</p>
                </div>
            `;
        }
        this.refreshIcons();
    }

    executeSearch(type, query) {
        const config = TOOLS_CONFIG[type];
        if (!config) return;

        const resultsSection = document.getElementById('resultsSection');
        const grid = document.getElementById('resultsGrid');
        const metaEl = document.getElementById('resultMeta');
        const titleEl = document.getElementById('resultTitle');
        
        if (resultsSection) resultsSection.classList.remove('hidden');
        if (metaEl) metaEl.textContent = `QUERY: ${query.toUpperCase()}`;
        if (titleEl) titleEl.innerHTML = `${config.title} <span class="text-xs font-normal text-slate-500">(${type})</span>`;

        if (grid) {
            grid.innerHTML = `
                <div id="loader" class="col-span-full py-8 flex flex-col items-center justify-center gap-4 animate-pulse border-b border-indigo-500/20 mb-4">
                    <p class="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Deep Scan Active...</p>
                </div>
            `;
            this.refreshIcons();
        }

        this.discoveredLinks.clear();
        this.addToHistory(query);
        this.showToast(`Scanning: ${query}`, 'info');

        if (type === 'email') this.checkGravatar(query);

        // Render manual links IMMEDIATELY
        config.template.forEach(item => {
            if (grid) this.renderAuditStatus(item, query, grid);
        });

        // Trigger deep SERP aggregation
        this.performNativeDiscovery(query, grid, config);
    }

    async performNativeDiscovery(query, grid, config) {
        const isMail = query.includes('@');
        let searchString = `"${query}"`;
        
        if (!isMail && !query.includes('.') && query.includes(' ')) {
            searchString = `"${query}" (filetype:pdf OR filetype:xls OR site:sp.gov.br OR site:jusbrasil.com.br)`;
        }

        const rawUrl = `https://searx.be/search?q=${encodeURIComponent(searchString)}&format=json`;
        
        const fallbackApis = [
            `https://corsproxy.io/?${encodeURIComponent(rawUrl)}`,
            `https://api.allorigins.win/raw?url=${encodeURIComponent(rawUrl)}`,
            rawUrl
        ];

        let data = null;
        for (let api of fallbackApis) {
            try {
                const response = await fetch(api, { cache: 'no-store' });
                if (response.ok) {
                    const text = await response.text();
                    try {
                        // AllOrigins might wrap in contents, Searx / corsproxy returns raw JSON
                        data = JSON.parse(text);
                        if (data.contents) data = JSON.parse(data.contents); // Unpack allorigins
                        if (data.results && data.results.length > 0) break;
                    } catch (e) {
                         // invalid json
                    }
                }
            } catch (e) { console.warn("API Tunnel Failed: " + api); }
        }

        const loader = document.getElementById('loader');
        if (loader) loader.remove();

        if (data && data.results && data.results.length > 0) {
            const separatorHtml = `
            <div class="col-span-full border-b border-indigo-500/30 pb-2 mb-4 mt-8 flex items-center gap-2">
                <i data-lucide="radar" class="w-4 h-4 text-indigo-400"></i>
                <span class="text-[10px] font-black uppercase tracking-widest text-indigo-400">Deep Web Hits (Native SERP)</span>
            </div>`;
            grid.insertAdjacentHTML('afterbegin', separatorHtml);

            // Render top 12 results
            data.results.slice(0, 12).reverse().forEach(result => {
                const isPdf = result.url.toLowerCase().endsWith('.pdf');
                const icon = isPdf ? 'file-text' : 'link-2';
                const color = isPdf ? 'rose' : 'indigo';
                
                const cardHtml = `
                <div class="col-span-full md:col-span-2 lg:col-span-3 glass-card p-5 rounded-2xl border border-${color}-500/20 hover:border-${color}-500/60 hover:shadow-lg hover:shadow-${color}-500/10 transition-all flex flex-col h-full bg-slate-900/40">
                    <div class="flex items-start gap-3 mb-3">
                        <div class="p-2 bg-${color}-500/10 rounded-lg">
                            <i data-lucide="${icon}" class="w-4 h-4 text-${color}-400"></i>
                        </div>
                        <h4 class="text-xs font-bold text-slate-200 line-clamp-2 leading-snug" title="${result.title}">${result.title}</h4>
                    </div>
                    <p class="text-[10px] text-slate-400 font-mono mb-4 line-clamp-3 leading-relaxed flex-grow opacity-80">${result.content || 'Content restricted or unavailable.'}</p>
                    
                    <div class="mt-auto flex justify-between items-center pt-3 border-t border-slate-800">
                        <a href="${result.url}" target="_blank" class="text-[9px] text-${color}-400 bg-${color}-500/10 px-2 py-1 rounded-md truncate max-w-[60%] hover:underline flex items-center gap-1">
                            <i data-lucide="external-link" class="w-3 h-3"></i> Open Source
                        </a>
                        <button onclick="document.getElementById('scraperUrlInput').value='${result.url}'; document.getElementById('scraperTargetInput').value='${query}'; document.getElementById('scraperUrlInput').scrollIntoView();" class="text-[9px] font-black uppercase text-rose-400 hover:text-white transition-all flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/40 px-2 py-1 rounded-md cursor-pointer">
                            <i data-lucide="scan" class="w-3 h-3"></i> Scan
                        </button>
                    </div>
                </div>
                `;
                grid.insertAdjacentHTML('afterbegin', cardHtml);
            });
            this.refreshIcons();
        }
    }

    async performDiscovery(item, query) {
        const confirmedGrid = document.getElementById('confirmedGrid');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        try {
            const searchDork = item.dork.replace('{query}', query);
            const searchApi = `https://api.microlink.io?url=${encodeURIComponent(`https://duckduckgo.com/html/?q=${encodeURIComponent(searchDork)}`)}&data.results.selector=.result__a&data.results.type=list&data.results.attr=href`;
            
            const response = await fetch(searchApi, { signal: controller.signal });
            if (!response.ok) throw new Error('API Blocked');
            
            const data = await response.json();
            if (data.status === 'success' && data.data.results) {
                for (const encodedLink of data.data.results) {
                    const link = decodeURIComponent(encodedLink.split('uddg=')[1]?.split('&')[0] || encodedLink);
                    if (link.startsWith('http') && !this.discoveredLinks.has(link)) {
                        await this.processResultLink(link, confirmedGrid, controller.signal);
                    }
                }
            }
        } catch (e) {
            console.warn(`Search failed for ${item.name}`);
        } finally {
            clearTimeout(timeoutId);
        }
    }

    async processResultLink(link, grid, signal) {
        this.discoveredLinks.add(link);
        try {
            const metaApi = `https://api.microlink.io?url=${encodeURIComponent(link)}&meta=true`;
            const resp = await fetch(metaApi, { signal });
            const metaData = await resp.json();
            
            if (metaData.status === 'success') {
                this.renderIdentityCard(link, metaData.data, grid);
            } else {
                throw new Error('Meta fail');
            }
        } catch (e) {
            this.renderIdentityCard(link, { title: new URL(link).hostname }, grid);
        }
    }

    renderIdentityCard(link, meta, grid) {
        const loader = document.getElementById('loader');
        if (loader) loader.remove();

        const host = new URL(link).hostname;
        const platform = SOCIAL_PLATFORMS.find(p => host.includes(p.domain)) || { name: host, color: 'bg-slate-700', icon: 'user' };

        const card = document.createElement('div');
        card.className = "glass-card p-6 rounded-3xl border border-indigo-500/40 hover:border-indigo-400 bg-indigo-500/5 transition-all flex flex-col gap-5";
        card.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="${platform.color} w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl">
                    <i data-lucide="${platform.icon || 'link'}" class="w-8 h-8 text-white"></i>
                </div>
                <div class="min-w-0">
                    <h4 class="text-sm font-black text-white uppercase tracking-widest truncate">${meta.title || platform.name}</h4>
                    <span class="bg-indigo-600/20 text-indigo-400 text-[7px] px-2 py-0.5 rounded-full border border-indigo-500/20 uppercase font-black">Direct Match</span>
                </div>
            </div>
            <div class="bg-slate-950/60 p-4 rounded-2xl border border-white/5">
                <p class="text-[10px] text-slate-200 font-mono break-all line-clamp-2">${link}</p>
            </div>
            <a href="${link}" target="_blank" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl text-center text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/30 transition-all border border-indigo-400/20">
                Access Profile
            </a>
        `;
        grid.prepend(card);
        this.refreshIcons();
    }

    renderAuditStatus(item, query, grid) {
        if (!grid) grid = document.getElementById('statusGrid');
        
        let url;
        const username = query.includes('@') ? query.split('@')[0] : query.replace(/\s+/g, '').toLowerCase();

        if (item.exactUrl) {
            url = item.exactUrl.replace('{username}', encodeURIComponent(username)).replace('{query}', encodeURIComponent(query));
        } else if (item.url) {
            url = item.url.replace('{query}', encodeURIComponent(query));
        } else {
            url = `https://www.google.com/search?q=${encodeURIComponent(item.dork.replace('{query}', query))}`;
        }
        
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.target = "_blank";
        anchor.className = "status-link group bg-slate-900 border border-indigo-500/30 p-4 rounded-2xl flex justify-between items-center hover:border-indigo-500 transition-all";
        anchor.innerHTML = `
            <span class="text-[9px] text-slate-300 font-bold uppercase truncate">${item.name}</span>
            <i data-lucide="external-link" class="w-4 h-4 text-indigo-500 group-hover:text-white transition-colors"></i>
        `;
        grid.appendChild(anchor);
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
                            <h4 class="text-sm font-black text-white uppercase tracking-widest">${profile.displayName || 'Global Identity'}</h4>
                            <p class="text-[9px] text-purple-400 font-black uppercase">Gravatar Profile</p>
                        </div>
                    </div>
                    <a href="${profile.profileUrl}" target="_blank" class="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest transition-all">View Identity</a>`;
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
        if (!list) return;
        
        if (this.history.length === 0) {
            list.innerHTML = `<span class="text-xs text-slate-600 italic">No activity.</span>`;
            return;
        }

        list.innerHTML = this.history.map(h => `
            <button class="history-item bg-slate-900 border border-indigo-500/20 px-3 py-1.5 rounded-lg text-[9px] text-indigo-400 hover:bg-indigo-600 hover:text-white uppercase font-black transition-all" data-query="${h}">
                ${h}
            </button>
        `).join(' ');

        list.querySelectorAll('.history-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.getAttribute('data-query');
                const type = query.includes('@') ? 'email' : (query.includes('.') ? 'domain' : 'username');
                const inputEl = document.getElementById(`${type}Input`);
                if (inputEl) {
                    inputEl.value = query;
                    this.executeSearch(type, query);
                }
            });
        });
    }

    applyTheme() { document.body.classList.toggle('light-mode', this.currentTheme === 'light'); }
}

window.addEventListener('load', () => { window.app = new OSINTApp(); window.app.init(); });
