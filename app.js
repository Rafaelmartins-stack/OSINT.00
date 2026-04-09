import TOOLS_CONFIG from './tools.js';

class OSINTApp {
    constructor() {
        this.history = JSON.parse(localStorage.getItem('osint_history')) || [];
        this.currentTheme = localStorage.getItem('osint_theme') || 'dark';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderHistory();
        this.applyTheme();
        
        // Refresh icons initially
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    setupEventListeners() {
        // Search buttons
        document.querySelectorAll('.search-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                this.handleSearch(type);
            });
        });

        // Clear history
        document.getElementById('clearHistory').addEventListener('click', () => {
            this.clearHistory();
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Input enter keys
        const inputs = ['usernameInput', 'domainInput', 'dorkInput', 'emailInput'];
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        const type = id.replace('Input', '');
                        this.handleSearch(type === 'dork' ? 'dorking' : type);
                    }
                });
            }
        });
    }

    handleSearch(type) {
        const inputId = type === 'dorking' ? 'dorkInput' : `${type}Input`;
        const inputEl = document.getElementById(inputId);
        const query = inputEl.value.trim();

        if (!query) {
            this.showToast('Please enter a target to investigate.', 'error');
            return;
        }

        if (type === 'email' && !this.validateEmail(query)) {
            this.showToast('Please enter a valid email address.', 'error');
            return;
        }

        this.executeSearch(type, query);
    }

    executeSearch(type, query) {
        const config = TOOLS_CONFIG[type];
        if (!config) return;

        // Show results section
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.classList.remove('hidden');
        
        // Update Meta
        document.getElementById('resultMeta').textContent = `QUERY: ${query.toUpperCase()}`;
        document.getElementById('resultTitle').innerHTML = `
            <i data-lucide="${config.icon}" class="w-5 h-5"></i>
            ${config.title} Results
        `;

        // Clear and fill grid
        const grid = document.getElementById('resultsGrid');
        grid.innerHTML = '';

        config.template.forEach(item => {
            const card = document.createElement('div');
            card.className = 'glass-card p-4 rounded-xl result-item animate-in flex flex-col justify-between';
            
            let finalUrl = '';
            let actionText = 'Visit Tool';

            if (item.url) {
                finalUrl = item.url.replace('{query}', encodeURIComponent(query));
            } else if (item.dork) {
                let dorkString = item.dork.replace('{query}', query);
                // Auto-fix: If query looks like a name (has spaces) and template uses site:{query}
                if (query.includes(' ') && dorkString.includes(`site:${query}`)) {
                    dorkString = dorkString.replace(`site:${query}`, `"${query}"`);
                }
                finalUrl = `https://www.google.com/search?q=${encodeURIComponent(dorkString)}`;
                actionText = 'Run Dork';
            }


            card.innerHTML = `
                <div class="mb-3">
                    <h4 class="font-bold text-sm text-slate-200">${item.name}</h4>
                    <p class="text-xs text-slate-500 truncate mt-1 mono-font">${item.dork || finalUrl}</p>
                </div>
                <a href="${finalUrl}" target="_blank" rel="noopener noreferrer" 
                    class="mt-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold py-2 px-4 rounded-lg transition-colors border border-slate-700">
                    ${actionText} <i data-lucide="external-link" class="w-3 h-3"></i>
                </a>
            `;
            grid.appendChild(card);
        });

        // Add to history
        this.addToHistory(type, query);
        
        // Re-init icons for dynamic content
        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        this.showToast(`Results generated for ${query}`, 'success');
    }

    addToHistory(type, query) {
        // Remove duplicate if exists
        this.history = this.history.filter(item => !(item.type === type && item.query === query));
        
        // Prepend new item
        this.history.unshift({ type, query, timestamp: new Date().toISOString() });
        
        // Keep only top 5
        if (this.history.length > 5) {
            this.history = this.history.slice(0, 5);
        }

        localStorage.setItem('osint_history', JSON.stringify(this.history));
        this.renderHistory();
    }

    renderHistory() {
        const list = document.getElementById('historyList');
        if (!list) return;

        if (this.history.length === 0) {
            list.innerHTML = `<span class="text-xs text-slate-600 italic">No recent activity found.</span>`;
            return;
        }

        list.innerHTML = this.history.map(item => `
            <button class="history-item text-xs bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800 px-3 py-1.5 rounded-full flex items-center gap-2 transition-all"
                data-type="${item.type}" data-query="${item.query}">
                <span class="opacity-50">${item.type}</span>
                <span class="font-medium">${item.query}</span>
            </button>
        `).join('');

        // Handle history clicks
        list.querySelectorAll('.history-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const { type, query } = e.currentTarget.dataset;
                const inputId = type === 'dorking' ? 'dorkInput' : `${type}Input`;
                const el = document.getElementById(inputId);
                if (el) el.value = query;
                this.executeSearch(type, query);
            });
        });
    }

    clearHistory() {
        this.history = [];
        localStorage.removeItem('osint_history');
        this.renderHistory();
        this.showToast('History cleared.');
    }

    validateEmail(email) {
        return String(email)
            .toLowerCase()
            .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
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
        
        if (window.lucide) window.lucide.createIcons();
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const msgEl = document.getElementById('toastMessage');
        const icon = toast.querySelector('i');

        msgEl.textContent = message;
        
        // Reset animation
        toast.classList.remove('opacity-0', 'translate-y-10');
        toast.classList.add('opacity-100', 'translate-y-0');

        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-10');
            toast.classList.remove('opacity-100', 'translate-y-0');
        }, 3000);
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    new OSINTApp();
});
