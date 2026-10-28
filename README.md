# VoidBoard

A single-file personal dashboard designed to be your browser's "Command Center." Built with **Alpine.js**, **Tailwind CSS** and **GridStack**, it runs entirely in the browser with **zero backend**, no Docker, and no build step.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Pure HTML](https://img.shields.io/badge/Zero--Backend-orange)
![License](https://img.shields.io/badge/license-MIT-green)

## Overview

**VoidBoard** is not meant to be a one-size-fits-all dashboard engine. It is a highly **opinionated** dashboard, built entirely around my specific preferences.

It starts as a blank page with just a navbar and a footer, and you add what you need. It is built for users who value:
1. **Focus & Productivity** (a Pomodoro timer and a to-do list)
2. **Financial Awareness** (stocks via Finnhub, crypto via CoinGecko)
3. **Tech and Italian News** (Hacker News, Il Sole 24 Ore, Il Post)
4. **Build Awareness** (the latest Buildkite build of each pipeline)
5. **Extreme Portability** (a single file you can carry on a USB or Gist)

---

## ✨ Features

- **Free-form layout** - Drag any card anywhere and resize it in whole grid cells (12 columns). Positions are saved. On a phone-sized window the page becomes one column.
- **Service cards** - Shortcut tiles for your own web services, such as a router page, a NAS or Grafana. Each card has a name, a description and a URL; clicking it opens the service, and a dot shows whether the address answers (checked every minute, so it only tells you the address responded, not that the service works). Add them from the cog menu with **Add Service**; edit, remove and drag them from the page. The board starts with none.
- **Widgets** - Everything on the board besides service cards is a widget: a card with its own data and settings. Add widgets from the cog menu with **Add Widget** (only the ones not already on the page are offered, and you can add several News widgets), remove them with the close icon, and change their settings with the pencil icon. See [Available widgets](#-available-widgets) for the list.
- **Themes, layout size and units** - Dark, Light, Midnight and Forest, a Standard or Compact layout, and the weather in Celsius or Fahrenheit.
- **Import and export** - Move your configuration between browsers with one JSON file.
- **Local persistence** - Everything is stored in `localStorage`.

---

## 🧩 Available Widgets

- **Market Watch** - US stocks through Finnhub (free API token) and crypto pairs such as BTC / USD or ETH / EUR through CoinGecko (no key). Drag the grip icon to reorder. Prices refresh every 30 minutes by default, and the pencil icon changes that.
- **Focus timer** - A Pomodoro timer with focus and break lengths you can edit, a synthesized alarm, and a countdown that stays correct in a background tab.
- **News widgets** - Add as many as you like. Each one has its own source (Hacker News, Il Sole 24 Ore, or Il Post Italia & Mondo, which merges two feeds newest first), number of items and refresh interval (10 minutes by default). Only sources whose servers allow requests from a web page are offered, so some popular Italian feeds (for example ANSA) are not available.
- **Buildkite widget** - The latest build of each pipeline with a link to the build, using a read-only API token.
- **Beszel widget** - Status, CPU, memory and disk usage of each system on your Beszel hub. Sign in once with a read-only Beszel user; only a session token is kept, never your password.
- **Search** - A search box that opens your question in Google AI Mode in a new tab. The clock icon in the top right corner lists your past searches (the last 20, newest first); click one to run it again. History stays in your browser and is never exported.
- **To-do list** - A simple checklist saved in your browser.
- **Clock, location and weather** - The time with a time zone switcher on its right (your own zone first, then UTC, Europe/London, Europe/Rome, America/New_York, America/Los_Angeles, Asia/Dubai, Asia/Tokyo or Australia/Sydney; hover over it to see the current UTC offset; your choice is saved and exported), your city with a link to Google Maps, and the weather from Open-Meteo.
- **System pulse** - Battery level and connection quality, in browsers that support them.

---

## 🚀 Quick Start

1. **Clone the repo:**
   ```bash
   git clone https://github.com/alessmar/voidboard.git
   ```

2. **Launch:** Open `index.html` in any modern browser, or serve the folder over http (for example `python3 -m http.server`).

3. **Build your dashboard:** Open the cog menu in the navbar. **Add Service** adds a link card, **Add Widget** adds a widget, **Theme** switches the look, and **Configuration** has **Layout** (Standard or Compact), **Temperature** (Celsius or Fahrenheit), Export and Import.

4. **Optional keys:** Market Watch shows **Connect Finnhub** for stock prices (free token at finnhub.io), the Buildkite widget shows **Connect Buildkite**, and the Beszel widget shows **Connect Beszel** (hub address plus a read-only user). Crypto prices and the news sources need no key.

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

Everything is configured from the page itself, with no file to edit. Use the pencil icon on a widget for its settings, such as the number of news items or the timer lengths. Settings live in your browser. **Configuration > Export** saves them to a file and **Import** loads one back. Your API tokens and your location are never exported, and an imported file is checked before anything is saved. **Configuration > Layout > Standard / Compact** changes the row height, gaps and card padding (Compact uses 62px rows and 4px gaps instead of 78px and 8px).

---

## 🔒 Privacy and Security

- API tokens are kept in this page's `localStorage`. Use read-only tokens: the Buildkite token only needs the "Read Builds" scope.
- The page talks to these services directly from your browser: `api.ipify.org` (your public IP), `api.bigdatacloud.net` and `api.open-meteo.com` (your coordinates, for the city and weather), `finnhub.io`, `api.coingecko.com`, the news feeds, the Buildkite API and your Beszel hub when connected. It also contacts the address of each service card, to show its status.
- Alpine.js, GridStack and Tailwind CSS are loaded from a CDN, pinned to an exact version with an integrity hash, so a changed file is refused by the browser.

---

## 🌐 Deployment

Since VoidBoard is a static HTML file, you can host it for free on GitHub Pages, Netlify, or Vercel.

> Note: The Battery API and Geolocation need the page to be served over https or from localhost. Everything else also works over plain http, for example from a LAN address.
