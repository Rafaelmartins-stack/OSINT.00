# OSINT Toolkit

A modern, fast, and secure OSINT (Open Source Intelligence) single-page application built for rapid digital investigations.

## 🚀 Key Features
- **Username Intelligence**: Quickly map accounts across major social platforms.
- **Domain & IP Recon**: Integrated lookups for Who.is, VirusTotal, and Shodan.
- **Google Dorking Generator**: Advanced search strings for pinpointing sensitive data.
- **Email Validation**: Check format and data breach history via HaveIBeenPwned.
- **Premium UI**: Glassmorphism design with Dark/Light mode support.
- **Local History**: Keep track of your last 5 investigations locally (stored in browser).

## 🛠️ Built With
- **HTML5 / CSS3** (Vanilla with Tailwind CSS Play CDN)
- **JavaScript** (Vanilla ES6 Modules)
- **Lucide Icons** for a clean, professional aesthetic.

## 📦 Deployment Guide (GitHub Pages)

To host this toolkit on your own GitHub Pages:

1.  **Clone or Download**: Ensure these files are in your local repository folder.
2.  **GitHub Desktop**:
    - Open **GitHub Desktop**.
    - If you haven't already, add the folder where these files are located as a repository.
    - Make a commit with the message: `Initial OSINT tool setup`.
    - Click **Publish repository** or **Push origin**.
3.  **GitHub Website**:
    - Go to your repository on GitHub.
    - Navigate to **Settings** > **Pages**.
    - Under **Build and deployment**, set **Source** to "Deploy from a branch".
    - Select `main` (or your default branch) and the `/ (root)` folder.
    - Click **Save**.
4.  **Live Link**: Your site will be live at `https://[your-username].github.io/[repo-name]/`.

## 🔒 Security & Privacy
- **Client-Side Only**: All data stays in your browser. No backend processing or data collection.
- **API Keys**: No sensitive keys are hardcoded. If future modules require them, they will be requested via secure user inputs.

---
*Disclaimer: Use this tool responsibly and only for legal and ethical investigations.*
