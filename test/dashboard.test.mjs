// Run with: node --test
// Loads the inline script of index.html in a vm with a stubbed browser, so no dependencies are needed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const script = html.split("<script>").pop().split("</script>")[0];

// Just enough of DOMParser for RSS: <item> elements with simple child tags.
class FakeDOMParser {
  parseFromString(text) {
    if (!text.startsWith("<?xml") && !text.startsWith("<rss")) return { querySelector: (s) => (s === "parsererror" ? {} : null), querySelectorAll: () => [] };
    const items = [...text.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => ({
      querySelector: (tag) => {
        const t = m[1].match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
        return t ? { textContent: t[1] } : null;
      },
    }));
    return { querySelector: () => null, querySelectorAll: (s) => (s === "item" ? items : []) };
  }
}

function makeDashboard(fetchImpl = async () => { throw new Error("no network"); }, initial = {}) {
  const store = new Map(Object.entries(initial));
  const ctx = {
    localStorage: {
      get length() { return store.size; },
      getItem: (k) => store.get(k) ?? null,
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
    },
    document: { documentElement: { dataset: {} } },
    window: {},
    DOMParser: FakeDOMParser,
    fetch: (...a) => fetchImpl(...a),
    URL, Blob, Date, Intl, JSON, Promise, Map, Set, Object, Number, Array, Math, RegExp,
    setInterval: () => 0, clearInterval: () => {}, setTimeout: () => 0, clearTimeout: () => {},
  };
  vm.createContext(ctx);
  vm.runInContext(script + "\nthis.__d = dashboard();", ctx);
  return ctx.__d;
}

const rss = (items) =>
  `\n<?xml version="1.0"?><rss><channel>${items
    .map((i) => `<item><title>${i.title}</title><link>${i.url}</link><guid>${i.url}</guid><pubDate>${i.date ?? ""}</pubDate></item>`)
    .join("")}</channel></rss>`;
const feeds = (byUrl) => async (url) => {
  const body = byUrl[url];
  if (body === undefined) return { ok: false, status: 500 };
  return { ok: true, text: async () => body };
};
// arrays made inside the vm have another Array prototype, so copy them before deepEqual
const titles = (a) => Array.from(a, (n) => n.title);
const ITALIA = "https://www.ilpost.it/italia/feed/";
const MONDO = "https://www.ilpost.it/mondo/feed/";

test("validConfig accepts a sane theme, density and service list", () => {
  const d = makeDashboard();
  assert.ok(d.validConfig("dash_theme", "dark"));
  assert.ok(d.validConfig("dash_density", "compact"));
  assert.ok(d.validConfig("dash_services", [{ name: "NAS", url: "http://nas.local", description: "files" }]));
});

test("validConfig rejects unknown keys, themes and densities", () => {
  const d = makeDashboard();
  assert.equal(d.validConfig("beszel_token", "x"), false);
  assert.equal(d.validConfig("dash_theme", "neon"), false);
  assert.equal(d.validConfig("dash_density", "toString"), false);
  assert.ok(d.validConfig("dash_timezone", "Europe/Rome"));
  assert.equal(d.validConfig("dash_timezone", ""), false);
  assert.ok(d.validConfig("dash_temp_unit", "F") && !d.validConfig("dash_temp_unit", "K"));
  assert.equal(d.validConfig("dash_timezone", "Mars/Base"), false);
});

test("validConfig rejects unsafe or duplicate services", () => {
  const d = makeDashboard();
  assert.equal(d.validConfig("dash_services", [{ name: "x", url: "javascript:alert(1)" }]), false);
  assert.equal(d.validConfig("dash_services", [{ name: "x", url: "http://a", id: "__proto__" }]), false);
  assert.equal(d.validConfig("dash_services", [{ name: "x", url: "http://a", id: "1" }, { name: "y", url: "http://b", id: "1" }]), false);
  assert.equal(d.validConfig("dash_services", [{ name: "", url: "http://a" }]), false);
  assert.equal(d.validConfig("dash_services", "nope"), false);
});

test("validConfig checks news widgets: source, ranges, ids", () => {
  const d = makeDashboard();
  const ok = { id: "news-1", source: "hn", count: 5, minutes: 10 };
  assert.ok(d.validConfig("dash_news", [ok]));
  assert.equal(d.validConfig("dash_news", [{ ...ok, source: "rai" }]), false);
  assert.equal(d.validConfig("dash_news", [{ ...ok, count: 0 }]), false);
  assert.equal(d.validConfig("dash_news", [{ ...ok, minutes: 99999 }]), false);
  assert.equal(d.validConfig("dash_news", [{ ...ok, id: "todo" }]), false); // clashes with a widget name
  assert.equal(d.validConfig("dash_news", [ok, ok]), false); // duplicate id
});

test("validConfig checks layout, widget lists and settings", () => {
  const d = makeDashboard();
  assert.ok(d.validConfig("dash_layout", { a: { x: 0, y: 0, w: 3, h: 2 } }));
  assert.equal(d.validConfig("dash_layout", { a: { x: 12, y: 0, w: 3, h: 2 } }), false);
  assert.ok(d.validConfig("dash_widgets", ["market", "todo", "beszel", "search"]));
  assert.equal(d.validConfig("dash_widgets", ["nope"]), false);
  assert.equal(d.validConfig("dash_widgets", ["news"]), false); // news widgets live in dash_news
  assert.equal(d.validConfig("dash_widgets", ["todo", "todo"]), false);
  assert.ok(d.validConfig("dash_widget_settings", { market: { minutes: 30 }, beszel: { minutes: 1 } }));
  assert.equal(d.validConfig("dash_widget_settings", { market: { minutes: 0 } }), false);
  assert.equal(d.validConfig("dash_widget_settings", { unknown: { minutes: 1 } }), false);
});

test("Il Post merge: newest first, duplicates once, cut to count", async () => {
  const d = makeDashboard(feeds({
    [ITALIA]: rss([
      { title: "old", url: "https://x/old", date: "Mon, 01 Jan 2024 10:00:00 GMT" },
      { title: "shared", url: "https://x/shared", date: "Mon, 01 Jan 2024 12:00:00 GMT" },
    ]),
    [MONDO]: rss([
      { title: "shared", url: "https://x/shared", date: "Mon, 01 Jan 2024 12:00:00 GMT" },
      { title: "new", url: "https://x/new", date: "Mon, 01 Jan 2024 14:00:00 GMT" },
    ]),
  }));
  const w = { id: "w1", source: "ilpost", count: 2 };
  await d.fetchNews(w);
  assert.deepEqual(titles(d.newsStories.w1), ["new", "shared"]);
  assert.equal(d.newsErrors.w1, "");
});

test("Il Post merge: undated items go last and non-http links are dropped", async () => {
  const d = makeDashboard(feeds({
    [ITALIA]: rss([
      { title: "nodate", url: "https://x/nodate" },
      { title: "evil", url: "javascript:alert(1)", date: "Mon, 01 Jan 2024 15:00:00 GMT" },
    ]),
    [MONDO]: rss([{ title: "dated", url: "https://x/dated", date: "Mon, 01 Jan 2024 10:00:00 GMT" }]),
  }));
  await d.fetchNews({ id: "w2", source: "ilpost", count: 10 });
  assert.deepEqual(titles(d.newsStories.w2), ["dated", "nodate"]);
});

test("Il Post merge: one feed failing still shows the other, with a notice", async () => {
  const d = makeDashboard(feeds({ [MONDO]: rss([{ title: "m", url: "https://x/m", date: "Mon, 01 Jan 2024 10:00:00 GMT" }]) }));
  await d.fetchNews({ id: "w3", source: "ilpost", count: 5 });
  assert.deepEqual(titles(d.newsStories.w3), ["m"]);
  assert.equal(d.newsErrors.w3, "Part of this feed could not be loaded");
});

test("Il Post merge: both feeds failing shows an error", async () => {
  const d = makeDashboard(feeds({}));
  await d.fetchNews({ id: "w4", source: "ilpost", count: 5 });
  assert.equal(d.newsErrors.w4, "Could not load this feed");
});

test("a first visit shows no widget", () => {
  const d = makeDashboard();
  assert.deepEqual(Array.from(d.widgets), []);
  assert.deepEqual(Array.from(d.availableWidgets).sort(), Object.keys(d.widgetNames).sort());
});

test("older storage (hidden + extras lists) becomes one widget list", () => {
  const d = makeDashboard(undefined, {
    dash_services: "[]",
    hidden_widgets: JSON.stringify(["focus"]),
    extra_widgets: JSON.stringify(["todo"]),
  });
  assert.deepEqual(Array.from(d.widgets), ["market", "todo"]);
  assert.ok(!Array.from(d.availableWidgets).includes("market") && Array.from(d.availableWidgets).includes("focus"));
});

test("temperature is shown in the chosen unit", () => {
  const d = makeDashboard();
  d.temp = 21.4;
  assert.equal(d.tempText(), "21°C");
  d.tempUnit = "F";
  assert.equal(d.tempText(), "71°F"); // 70.52
});
