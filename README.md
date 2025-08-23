# sso-proxy

A lightweight proxy tool for accessing APIs and websites that require **SSO authentication**.  
It uses **Puppeteer** to open a browser window for login and then reuses the authenticated cookies to access the proxied URL.

This tool is particularly helpful for:
- Showcasing integration with portal APIs that require SSO (before SSO is actually set up).
- Development and testing of such integrations locally.

Simply run this proxy on your local machine and access the proxied URL through it.

---

## 🚀 Installation

### Prerequisites
- Node.js
- npm (Node Package Manager)

### Mac Users
```bash
brew install npm
brew install nodejs
```

### Linux Users
```bash
sudo apt install npm
sudo apt install nodejs
```

## Setup npm and Dependencies
```bash
npm init -y
npm install express node-fetch puppeteer
```

## ▶️ Running the Proxy
Start the proxy server:
```bash
node proxy.js &
```

## 🌐 Accessing a Proxied API
When you hit the proxy endpoint, it will:
1. Open a browser window for SSO authentication.
2. Capture cookies after successful login.
3. Use those cookies to fetch the proxied resource.

Example:

```bash
http://localhost:3000/proxy?url=https://example.com/api/data&sslUrl=https://example.com/sso-login
```
- `url`: The target API or website to proxy.
- `sslUrl`: (Optional) The SSO login page. If not provided, the proxy will attempt to use the same url.

## 📑 Examples
1. [Get Claim History - MidiAssist Portal](/test/GetClaimHistory.html)



## ⚠️ Troubleshooting

> ❌ Error: To resolve this, you must run Puppeteer with a version of Node built for arm64

If you see this error on Apple Silicon (M1/M2/M3) machines, make sure you install a Node.js version built for arm64.
Recommended approach:
- Install nvm (Node Version Manager)
```bash
brew install nvm
nvm install --arch=arm64 --lts
nvm use --lts
rm -rf node_modules
npm install
npx puppeteer browsers install chrome 
```