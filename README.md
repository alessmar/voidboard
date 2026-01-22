# VoidBoard

A high-performance, single-file personal dashboard designed to be your browser's "Command Center." Built with **Alpine.js** and **Tailwind CSS**, it runs entirely in the browser with **zero backend**, no Docker, and no complex setup.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Pure HTML](https://img.shields.io/badge/Zero--Backend-orange)
![License](https://img.shields.io/badge/license-MIT-green)

## Overview

**VoidBoard** is not meant to be a one-size-fits-all dashboard engine. It is a highly **opinionated** dashboard, built entirely around my specific preferences. 

While other projects focus on exhaustive service monitoring, VoidBoard is built for users who value:
1. **Focus & Productivity** (Built-in Pomodoro)
2. **Financial Awareness** (Real-time NYSE/NASDAQ Tickers)
3. **Tech Intelligence** (Hacker News Integration)
4. **Extreme Portability** (A single file you can carry on a USB or Gist)

If your workflow involves deep focus sessions while keeping a pulse on the markets and tech news, this dashboard was made for you.

---

## ✨ Features

- 🕒 **24h Precision Clock** - Modern, military-style timekeeping.
- 🌦️ **Smart Weather & Geolocation** - Automatic city resolution with links to Google Maps.
- 📈 **Market Watch** - Live NYSE/NASDAQ stock ticker with daily change percentages (via Yahoo Finance).
- 🍅 **Pomodoro Widget** - UI-configurable focus timer with high-quality synthesized audio alarm and custom tooltips.
- 📰 **Hacker News Feed** - Trending tech stories fetched directly in-browser.
- 🔋 **System Pulse** - Live monitoring of battery levels and network connection state.
- 🔍 **Instant Search** - Filter your services locally in real-time.
- 💾 **Local Persistence** - Remembers your search, stock tickers, and timer settings using `localStorage`.

---

## 🚀 Quick Start

1. **Clone the repo:**
   ```bash
   git clone https://github.com/alessmar/voidboard.git
   ```
   
2. **Launch:** Simply double-click index.html to open it in any modern browser.

3. **Customize:** Open index.html in a text editor and update the services array in the <script> tag.

---

⚖️ Comparison with Popular Dashboards

|Feature|VoidBoard|Homer|Homepage|Dashy|
|-------|---------|-----|--------|-----|
|Philosophy|Opinionated|Structural|Functional|Exhaustive|
|Architecture|Single HTML File|YAML + Build|Docker / Node.js|Vue.js App|
|Backend|None|Web Server|Node.js|Web Server|
|Setup Time|< 1 Minute|10 Minutes|15 Minutes|20 Minutes|
|Portability|🚀 High|⚠️ Medium|❌ Low|⚠️ Medium|

---

## 🛠 Configuration

To add your own services, locate the services array in the index.html script:

    ```javascript
    services: [
        { 
        name: "Jellyfin", 
        url: "[http://192.168.1.2:8096](http://192.168.1.2:8096)", 
        description: "Video streaming" 
        },
        // Add your links here...
    ]
    ```

---

## 🌐 Deployment & Security

Since VoidBoard is a static HTML file, you can host it for free on GitHub Pages, Netlify, or Vercel.

> Note: For the Battery API and Geolocation to function correctly, modern browsers require the page to be served over https or localhost.
