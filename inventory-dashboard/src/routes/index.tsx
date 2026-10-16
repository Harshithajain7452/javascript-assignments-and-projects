import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inventory Terminal — Product Analytics Dashboard" },
      { name: "description", content: "Interactive product inventory and analytics console built with core JavaScript concepts." },
      { property: "og:title", content: "Inventory Terminal" },
      { property: "og:description", content: "Interactive product inventory and analytics console." },
    ],
  }),
  component: Index,
});

type Product = { id: number; name: string; price: number; qty: number };
type Line = { text: string; tone?: "head" | "ok" | "warn" | "err" | "dim" };

// --- Functions & Scope ---
function getCategory(price: number, budgetMax: number, premiumMin: number): string {
  // if...else validation + switch categorisation
  let tier: number;
  if (price < budgetMax) tier = 0;
  else if (price >= premiumMin) tier = 2;
  else tier = 1;
  switch (tier) {
    case 0: return "Budget";
    case 2: return "Premium";
    default: return "Standard";
  }
}
const totalValue = (items: Product[]) => items.reduce((s, p) => s + p.price * p.qty, 0);
const applyAdjust = (amount: number, taxPct: number, discountPct: number) => {
  const discounted = amount * (1 - discountPct / 100); // locally scoped
  const taxed = discounted * (1 + taxPct / 100);
  return Math.round(taxed * 100) / 100;
};
const fmt = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const seed: Product[] = [
  { id: 1, name: "Laptop", price: 800, qty: 1 },
  { id: 2, name: "Mouse", price: 25, qty: 1 },
];

const toneClass: Record<string, string> = {
  head: "text-primary glow font-bold mt-2",
  ok: "text-foreground",
  warn: "text-accent",
  err: "text-destructive",
  dim: "text-muted-foreground",
};
const badgeClass: Record<string, string> = {
  Budget: "text-budget border-budget/40 bg-budget/10",
  Standard: "text-standard border-standard/40 bg-standard/10",
  Premium: "text-premium border-premium/40 bg-premium/10",
};

function Index() {
  const [items, setItems] = useState<Product[]>(seed);
  const [log, setLog] = useState<Line[]>([{ text: "--- Initializing Inventory System ---", tone: "head" }]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("1");
  const [search, setSearch] = useState("");
  const [threshold, setThreshold] = useState(200);
  const [budgetMax, setBudgetMax] = useState(100);
  const [premiumMin, setPremiumMin] = useState(500);
  const [tax, setTax] = useState(18);
  const [discount, setDiscount] = useState(10);
  const [sort, setSort] = useState<"none" | "asc" | "desc">("none");
  const endRef = useRef<HTMLDivElement>(null);

  const push = (...l: Line[]) => setLog((p) => [...p, ...l]);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), [log]);

  const validate = (n: string, pr: string): { ok: true; name: string; price: number } | { ok: false; msg: string } => {
    const cleanName = String(n).trim();
    const p = Number(pr); // explicit conversion
    if (!cleanName) return { ok: false, msg: "Missing product name." };
    else if (Number.isNaN(p)) return { ok: false, msg: `Invalid price "${pr}".` };
    else if (p <= 0) return { ok: false, msg: "Price must be positive." };
    return { ok: true, name: cleanName, price: p };
  };

  const add = (n: string, pr: string, q: string, via: string) => {
    const v = validate(n, pr);
    if (!v.ok) return push({ text: `[${via}] ✖ ${v.msg}`, tone: "err" });
    const quantity = Math.max(1, parseInt(q) || 1);
    setItems((prev) => [...prev, { id: Date.now(), name: v.name, price: v.price, qty: quantity }]);
    push({ text: `[${via} executed: User adds "${v.name}" at "${fmt(v.price)}" ×${quantity}]`, tone: "warn" });
  };

  const usePrompt = () => {
    const n = window.prompt("Enter new product name:");
    if (n === null) return push({ text: "[Prompt cancelled]", tone: "dim" });
    const p = window.prompt(`Enter price for ${n}:`);
    if (p === null) return push({ text: "[Prompt cancelled]", tone: "dim" });
    add(n, p, "1", "Prompt");
  };

  const runSearch = () => {
    const q = search.trim().toLowerCase();
    if (!q) return push({ text: "[Search] ⚠ empty query skipped", tone: "warn" });
    push({ text: `--- Searching for "${search}" (for loop) ---`, tone: "head" });
    let found: Product | null = null;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it || !it.name) continue; // skip bad entries
      push({ text: `  checking #${i + 1}: ${it.name}`, tone: "dim" });
      if (it.name.toLowerCase().includes(q)) { found = it; break; }
    }
    push(found
      ? { text: `✔ Found: ${found.name} (${fmt(found.price)}) → ${getCategory(found.price, budgetMax, premiumMin)}`, tone: "ok" }
      : { text: "✖ No match found.", tone: "err" });
  };

  const runReport = () => {
    const out: Line[] = [{ text: "--- Processing Inventory Roster (forEach) ---", tone: "head" }];
    items.forEach((p) => out.push({ text: `* Item: ${p.name} (${fmt(p.price)}) -> Category: ${getCategory(p.price, budgetMax, premiumMin)}` }));
    const total = totalValue(items);
    const affordable = items.filter((p) => p.price < threshold).map((p) => p.name);
    const report = items.map((p) => `${p.name.toUpperCase()}: ${fmt(p.price)}`);
    out.push(
      { text: "--- Financial Analytics ---", tone: "head" },
      { text: `Total Inventory Value: ${fmt(total)}` },
      { text: `After ${discount}% discount + ${tax}% tax: ${fmt(applyAdjust(total, tax, discount))}`, tone: "warn" },
      { text: `Filtered Affordable Items (Under ${fmt(threshold)}): ${JSON.stringify(affordable)}` },
      { text: `Formatted Report List: ${JSON.stringify(report)}` },
    );
    push(...out);
  };

  const remove = (id: number) => {
    const it = items.find((p) => p.id === id);
    setItems((p) => p.filter((x) => x.id !== id));
    if (it) push({ text: `[Removed "${it.name}"]`, tone: "dim" });
  };

  const exportCsv = () => {
    const csv = ["name,price,qty,category", ...items.map((p) => `${p.name},${p.price},${p.qty},${getCategory(p.price, budgetMax, premiumMin)}`)].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "inventory.csv";
    a.click();
    push({ text: "[Exported inventory.csv]", tone: "ok" });
  };

  const sorted = useMemo(() => {
    const c = [...items];
    if (sort === "asc") c.sort((a, b) => a.price - b.price);
    if (sort === "desc") c.sort((a, b) => b.price - a.price);
    return c;
  }, [items, sort]);

  const total = totalValue(items);
  const avg = items.length ? total / items.reduce((s, p) => s + p.qty, 0) : 0;
  const counts = ["Budget", "Standard", "Premium"].map((c) => ({
    c, n: items.filter((p) => getCategory(p.price, budgetMax, premiumMin) === c).length,
  }));
  const maxPrice = Math.max(1, ...items.map((p) => p.price));

  const input = "w-full bg-input/40 border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
  const btn = "rounded-md px-3 py-2 text-sm font-bold transition hover:brightness-110 active:scale-95";
  const primaryBtn = `${btn} bg-primary text-primary-foreground`;
  const ghostBtn = `${btn} border border-border hover:bg-muted`;

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">~/capstone/inventory $</p>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-primary glow">Inventory Terminal</h1>
        </div>
        <div className="flex gap-2">
          <button className={ghostBtn} onClick={usePrompt}>prompt()</button>
          <button className={ghostBtn} onClick={exportCsv}>Export CSV</button>
          <button className={primaryBtn} onClick={runReport}>▶ Run Report</button>
        </div>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Products", items.length],
          ["Total Value", fmt(total)],
          ["Avg Unit", fmt(avg)],
          ["Adjusted", fmt(applyAdjust(total, tax, discount))],
        ].map(([k, v]) => (
          <div key={k} className="panel p-4">
            <p className="text-xs uppercase text-muted-foreground">{k}</p>
            <p className="font-display text-2xl font-bold">{v}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <section className="panel p-5">
            <h2 className="mb-3 text-sm font-bold text-primary">// add product</h2>
            <form className="grid grid-cols-[2fr_1fr_1fr] gap-2" onSubmit={(e) => { e.preventDefault(); add(name, price, qty, "Form"); setName(""); setPrice(""); setQty("1"); }}>
              <input className={input} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <input className={input} placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
              <input className={input} placeholder="Qty" value={qty} onChange={(e) => setQty(e.target.value)} />
              <button className={`${primaryBtn} col-span-3`}>+ Add to inventory</button>
            </form>
          </section>

          <section className="panel p-5">
            <h2 className="mb-3 text-sm font-bold text-primary">// parameters</h2>
            {[
              ["Tax %", tax, setTax, 0, 30],
              ["Discount %", discount, setDiscount, 0, 50],
              ["Affordable under $", threshold, setThreshold, 10, 1000],
              ["Budget below $", budgetMax, setBudgetMax, 10, 500],
              ["Premium from $", premiumMin, setPremiumMin, 100, 2000],
            ].map(([label, val, set, min, max]) => (
              <label key={label as string} className="mb-3 block text-xs">
                <span className="flex justify-between text-muted-foreground"><span>{label as string}</span><span className="text-foreground">{val as number}</span></span>
                <input type="range" className="w-full accent-primary" min={min as number} max={max as number} value={val as number}
                  onChange={(e) => (set as (n: number) => void)(Number(e.target.value))} />
              </label>
            ))}
          </section>

          <section className="panel p-5">
            <h2 className="mb-3 text-sm font-bold text-primary">// category mix</h2>
            <div className="space-y-2">
              {counts.map(({ c, n }) => (
                <div key={c} className="flex items-center gap-3 text-xs">
                  <span className="w-20">{c}</span>
                  <div className="h-2 flex-1 rounded bg-muted">
                    <div className={`h-2 rounded border ${badgeClass[c]}`} style={{ width: `${items.length ? (n / items.length) * 100 : 0}%` }} />
                  </div>
                  <span>{n}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="panel p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-primary">// inventory</h2>
              <div className="flex gap-2">
                <input className={`${input} w-40`} placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runSearch()} />
                <button className={ghostBtn} onClick={runSearch}>Find</button>
                <select className={`${input} w-auto`} value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
                  <option value="none">Order</option><option value="asc">Price ↑</option><option value="desc">Price ↓</option>
                </select>
              </div>
            </div>
            <ul className="divide-y divide-border">
              {sorted.map((p) => {
                const cat = getCategory(p.price, budgetMax, premiumMin);
                const hit = search && p.name.toLowerCase().includes(search.toLowerCase());
                return (
                  <li key={p.id} className={`flex items-center gap-3 py-2 text-sm ${hit ? "bg-primary/10" : ""}`}>
                    <span className="w-28 truncate font-bold">{p.name}</span>
                    <div className="h-1.5 flex-1 rounded bg-muted"><div className="h-1.5 rounded bg-primary" style={{ width: `${(p.price / maxPrice) * 100}%` }} /></div>
                    <span className="w-20 text-right">{fmt(p.price)}</span>
                    <span className="w-8 text-right text-muted-foreground">×{p.qty}</span>
                    <span className={`w-20 rounded border px-2 py-0.5 text-center text-xs ${badgeClass[cat]}`}>{cat}</span>
                    <button aria-label={`Remove ${p.name}`} className="text-muted-foreground hover:text-destructive" onClick={() => remove(p.id)}>✕</button>
                  </li>
                );
              })}
              {!items.length && <li className="py-4 text-center text-muted-foreground">inventory empty</li>}
            </ul>
          </section>

          <section className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-2 text-xs text-muted-foreground">
              <span>● ● ● console.log</span>
              <button className="hover:text-foreground" onClick={() => setLog([])}>clear</button>
            </div>
            <div className="h-80 overflow-y-auto p-4 text-xs leading-relaxed">
              {log.map((l, i) => <div key={i} className={toneClass[l.tone ?? "ok"]}>{l.text}</div>)}
              <div ref={endRef} className="text-primary animate-pulse">▌</div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
