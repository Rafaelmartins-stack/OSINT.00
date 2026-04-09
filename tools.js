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
        description: "Find names in public lists, registrations, and official files.",
        template: [
            { name: "Public Lists / Names", dork: '"{query}" filetype:pdf OR filetype:xls OR filetype:doc' },
            { name: "Official Gazettes (BR)", dork: '"{query}" site:jus.br OR "diário oficial"' },
            { name: "Exam Registrations", dork: '"{query}" "lista de inscritos" OR "lista de aprovados"' },
            { name: "Gov / Edu Records", dork: '"{query}" site:gov.br OR site:edu.br' },
            { name: "Social Media Mentions", dork: '"{query}" site:facebook.com OR site:instagram.com OR site:linkedin.com' },
            { name: "Sensitive Docs (Domain)", dork: 'site:{query} filetype:pdf "confidential"' }
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
