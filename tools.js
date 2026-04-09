const TOOLS_CONFIG = {
    username: {
        title: "Username Search",
        icon: "user",
        description: "Search for profiles across social networks.",
        template: [
            { name: "Instagram", url: "https://www.instagram.com/{query}/" },
            { name: "Twitter/X", url: "https://twitter.com/{query}" },
            { name: "GitHub", url: "https://github.com/{query}" },
            { name: "LinkedIn", url: "https://www.linkedin.com/in/{query}/" },
            { name: "Reddit", url: "https://www.reddit.com/user/{query}" },
            { name: "Behance", url: "https://www.behance.net/{query}" }
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
        title: "Google Dorking",
        icon: "search",
        description: "Advanced search strings for intelligence.",
        template: [
            { name: "Confidential Docs", dork: 'site:{query} filetype:pdf "confidential"' },
            { name: "Public Logins", dork: 'site:{query} inurl:login' },
            { name: "SQL Errors", dork: 'site:{query} "sql syntax error" OR "mysql error"' },
            { name: "Backup Files", dork: 'site:{query} filetype:sql OR filetype:bak OR filetype:zip' },
            { name: "Directory Listing", dork: 'site:{query} intitle:"index of"' }
        ]
    },
    email: {
        title: "Email Validator",
        icon: "mail",
        description: "Verify email format and potential leaks.",
        template: [
            { name: "HaveIBeenPwned", url: "https://haveibeenpwned.com/account/{query}" },
            { name: "EPIEOS", url: "https://epieos.com/?q={query}" },
            { name: "Hunter.io", url: "https://hunter.io/try/verify/{query}" }
        ]
    }
};

export default TOOLS_CONFIG;
