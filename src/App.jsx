import { useState, useEffect } from "react";

const TYPES = [
  { id: "leisure", l: "Leisure", i: "🏖️" }, { id: "business", l: "Business", i: "💼" },
  { id: "study", l: "Study", i: "📚" }, { id: "adventure", l: "Adventure", i: "🏔️" },
];
const ACTS = [
  { id: "photo", l: "Photo", i: "📸" }, { id: "hiking", l: "Outdoor", i: "🥾" },
  { id: "beach", l: "Beach", i: "🏊" }, { id: "nightlife", l: "Dining", i: "🍷" },
  { id: "study", l: "Study", i: "📖" }, { id: "meetings", l: "Formal", i: "🤝" },
  { id: "cultural", l: "Culture", i: "🕌" }, { id: "fitness", l: "Fitness", i: "🏋️" },
];
const TRANS = [
  { id: "flight", l: "Flight", i: "✈️", s: 3 }, { id: "cruise", l: "Cruise", i: "🚢", s: 2 },
  { id: "bus", l: "Bus", i: "🚌", s: 2 }, { id: "train", l: "Train", i: "🚄", s: 1 },
  { id: "car", l: "Car", i: "🚗", s: 0 },
];
const LUG = {
  flight: [{ id: "personal", l: "Backpack", i: "🎒", w: 7, sz: "40×30×20cm" }, { id: "carryon", l: "Carry-on", i: "🧳", w: 10, sz: "55×40×20cm" }, { id: "checked", l: "Checked", i: "📦", w: 23, sz: "L+W+H≤158cm" }],
  cruise: [{ id: "personal", l: "Day Bag", i: "🎒", w: null, sz: "Excursions" }, { id: "large1", l: "Suitcase #1", i: "🧳", w: null, sz: "No limit" }, { id: "large2", l: "Suitcase #2", i: "📦", w: null, sz: "No limit" }],
  bus: [{ id: "personal", l: "Backpack", i: "🎒", w: 7, sz: "Under seat" }, { id: "large1", l: "Bag #1", i: "🧳", w: 23, sz: "L+W+H≤158cm" }, { id: "large2", l: "Bag #2", i: "📦", w: 23, sz: "L+W+H≤158cm" }],
  train: [{ id: "personal", l: "Backpack", i: "🎒", w: null, sz: "No limit" }, { id: "large1", l: "Suitcase #1", i: "🧳", w: 23, sz: "L+W+H≤158cm" }, { id: "large2", l: "Suitcase #2", i: "📦", w: 23, sz: "L+W+H≤158cm" }],
  car: [{ id: "any", l: "Everything", i: "🚗", w: null, sz: "Trunk" }],
};
const BC = { personal: "#5B8C8C", carryon: "#C5974B", checked: "#7B6B9C", large1: "#6B7B9C", large2: "#7B6B9C", any: "#5A7C5A" };
const PC = { essential: { bg: "#FEF2F2", b: "#FCA5A5", t: "#991B1B", l: "Ess" }, recommended: { bg: "#FEF9EC", b: "#FCD34D", t: "#92400E", l: "Rec" }, optional: { bg: "#F0FDF4", b: "#86EFAC", t: "#166534", l: "Opt" } };
const RC = { low: { bg: "#F0FDF4", b: "#86EFAC", t: "#166534", i: "🟢" }, medium: { bg: "#FEF9EC", b: "#FCD34D", t: "#92400E", i: "🟡" }, high: { bg: "#FEF2F2", b: "#FCA5A5", t: "#991B1B", i: "🔴" } };

const BASE_SUBS = [
  { id: "valuables", l: "💎 Electronics & Valuables" },
  { id: "essentials", l: "📋 Documents & Essentials" },
  { id: "comfort", l: "✈️ Travel Comfort" },
  { id: "clothing", l: "👗 Clothing" },
  { id: "toiletries", l: "🧴 Toiletries" },
  { id: "cosmetics", l: "💄 Cosmetics" },
  { id: "study", l: "📖 Study & Work" },
  { id: "sightseeing", l: "📸 Sightseeing & Photo" },
  { id: "favorites", l: "⭐ My Favorites" },
];

function strict(sel) { let m = null; for (const id of sel) { const t = TRANS.find(x => x.id === id); if (!m || (t && t.s > m.s)) m = t; } return m?.id || "flight"; }
function exJSON(t) { if (!t) return null; let c = t.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim(); try { return JSON.parse(c); } catch (e) {} const a = c.indexOf("["), b = c.lastIndexOf("]"), s = c.indexOf("{"), e2 = c.lastIndexOf("}"); if (a >= 0 && (s < 0 || a < s)) { try { return JSON.parse(c.substring(a, b + 1)); } catch (e) {} } if (s >= 0) { try { return JSON.parse(c.substring(s, e2 + 1)); } catch (e) {} } return null; }
async function api(p, search) { const b = { model: "claude-sonnet-4-20250514", max_tokens: 4096, messages: [{ role: "user", content: p }] }; if (search) b.tools = [{ type: "web_search_20250305", name: "web_search" }]; const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }); const d = await r.json(); if (d.error) throw new Error(d.error.message); return (d.content || []).filter(x => x.type === "text").map(x => x.text).join("\n"); }

export default function App() {
  const [step, setStep] = useState(0);
  const [trip, setTrip] = useState({ dest: "", sd: "", ed: "", types: [], acts: [], trans: [] });
  const [bags, setBags] = useState([]);
  const [res, setRes] = useState(null);
  const [ld, setLd] = useState(false);
  const [ldm, setLdm] = useState("");
  const [err, setErr] = useState(null);
  const [dbg, setDbg] = useState(null);
  const [tab, setTab] = useState("personal");
  const [chk, setChk] = useState(new Set());
  const [fade, setFade] = useState(true);
  const [ek, setEk] = useState(null);
  const [as, setAs] = useState(null);
  const [ni, setNi] = useState({ name: "", qty: 1, wg: 100, pri: "recommended" });
  const [la, setLa] = useState(null);
  const [conf, setConf] = useState(false);
  const [cc, setCc] = useState(false);
  const [ccur, setCcur] = useState("");
  const [vc, setVc] = useState(false);
  const [sc, setSc] = useState(false);
  const [subs, setSubs] = useState([...BASE_SUBS]);
  const [nsn, setNsn] = useState("");
  const [acs, setAcs] = useState(null);

  const st = strict(trip.trans);
  const sm = TRANS.find(x => x.id === st);
  useEffect(() => { setBags((LUG[st] || LUG.flight).map(x => ({ ...x, on: true }))); }, [st]);
  useEffect(() => { setFade(false); setTimeout(() => setFade(true), 50); }, [step]);
  const ms = ["Researching...", "Checking safety...", "Payments...", "Building list...", "Done soon..."];
  useEffect(() => { if (!ld) return; let i = 0; setLdm(ms[0]); const iv = setInterval(() => { i = (i + 1) % ms.length; setLdm(ms[i]); }, 3000); return () => clearInterval(iv); }, [ld]);

  const items = res?.items || [];
  const total = items.length;
  const pct = total > 0 ? Math.round((chk.size / total) * 100) : 0;
  const chkItems = items.map((it, i) => ({ ...it, _i: i })).filter(it => chk.has(it._i));
  const eb = bags.filter(b => b.on).map(b => b.id);
  const gBP = bt => (LUG[st] || []).find(x => x.id === bt);

  const togChk = idx => { setChk(p => { const n = new Set(p); const w = n.has(idx); w ? n.delete(idx) : n.add(idx); if (!w) { setLa(idx); setTimeout(() => setLa(null), 600); if (n.size === total) { setConf(true); setTimeout(() => setConf(false), 1200); } } return n; }); };
  const updI = (i, f, v) => setRes(p => ({ ...p, items: p.items.map((it, j) => j === i ? { ...it, [f]: f === "qty" || f === "wg" ? (parseInt(v) || 0) : v } : it) }));
  const delI = i => { setChk(p => { const n = new Set(); p.forEach(x => { if (x < i) n.add(x); else if (x > i) n.add(x - 1); }); return n; }); setRes(p => ({ ...p, items: p.items.filter((_, j) => j !== i) })); setEk(null); };
  const addI = (bag, sub) => { if (!ni.name.trim()) return; setRes(p => ({ ...p, items: [...p.items, { name: ni.name, qty: ni.qty, weight_g: ni.wg, priority: ni.pri, bag, subcat: sub, note: "", buy_at_dest: false }] })); setNi({ name: "", qty: 1, wg: 100, pri: "recommended" }); setAs(null); };
  const addSub = () => { if (!nsn.trim()) return; const id = nsn.trim().toLowerCase().replace(/\s+/g, "_"); if (subs.some(s => s.id === id)) return; setSubs(p => [...p, { id, l: `🏷️ ${nsn.trim()}` }]); setNsn(""); setAcs(null); };

  const canN = trip.dest && trip.sd && trip.ed && trip.types.length > 0 && trip.trans.length > 0;

  const gen = async () => {
    setStep(2); setLd(true); setErr(null); setDbg(null);
    try {
      const bts = eb.join("|");
      const actS = trip.acts.map(a => ACTS.find(x => x.id === a)?.l).filter(Boolean).join(",") || "General";
      const typeS = trip.types.map(id => TYPES.find(t => t.id === id)?.l).join("+");
      const transS = trip.trans.map(id => TRANS.find(m => m.id === id)?.l).join("+");

      setLdm("Researching " + trip.dest + "...");
      const it = await api(`Search web for ${trip.dest} travel info, ${trip.sd} to ${trip.ed}.\nReturn ONLY JSON: {"weather":{"high_c":20,"low_c":12,"feels_high_c":18,"feels_low_c":10,"conditions":"","rain_chance":""},"clothing_advice":"","risk":{"level":"low","insured":true,"insurance_note":"","safety":"","warnings":[]},"payment":{"cards":"moderate","card_note":"","cash_needed":true,"cash_note":"","currency":"","bring_usd":false,"usd_note":"","bring_eur":false,"eur_note":"","atm":true,"tipping":""},"sim_card":{"needed":true,"advice":"include late night arrival tip"},"cultural_tips":[{"tip":"","type":"dress","importance":"high"}],"tips":[""]}`, true);
      const info = exJSON(it);
      if (!info) { setDbg(it); throw new Error("Parse error (info)"); }

      setLdm("Building packing list...");
      const it2 = await api(`Packing list for ${trip.dest}, ${trip.sd}-${trip.ed}. ${typeS}. ${transS}. Activities: ${actS}. Weather: ${info.weather?.high_c}°/${info.weather?.low_c}°C feels ${info.weather?.feels_high_c}°/${info.weather?.feels_low_c}°C. Rain: ${info.weather?.rain_chance}. Bags: ${bts}. ${info.payment?.cash_needed ? "Cash needed." : ""} ${info.payment?.bring_usd ? "USD." : ""} ${info.payment?.bring_eur ? "EUR." : ""}
Return ONLY JSON array: [{"name":"","qty":1,"weight_g":200,"priority":"essential","bag":"personal","subcat":"valuables","note":"","buy_at_dest":false}]
Subcats: valuables(laptop,camera,charger,powerbank)→personal. essentials(passport,wallet,SIM,meds,keys,insurance)→personal. comfort(neck pillow,eye mask,snacks,headphones,water bottle,compact umbrella)→personal. clothing→carryon/large1. toiletries→any,buy_at_dest=true if easy in ${trip.dest}. cosmetics→any,buy_at_dest=true if easy. study→personal/carryon. sightseeing→any. favorites(1-2 personal items). Liquids>100ml→checked/large if flying. Adapter for ${trip.dest}. INCLUDE umbrella. 25-40 items.`, false);
      const items = exJSON(it2);
      if (!items || !Array.isArray(items)) { setDbg(it2); throw new Error("Parse error (items)"); }

      setRes({ ...info, items });
      if (info.payment) { setCc(!!info.payment.cash_needed); setCcur(info.payment.currency || ""); setVc(info.payment.cards !== "widespread"); }
      if (info.sim_card) setSc(!!info.sim_card.needed);
      setTab(eb[0] || "personal");
      setStep(3);
    } catch (e) { setErr(e.message); setStep(2); } finally { setLd(false); }
  };

  const exportFull = () => {
    const w = res?.weather;
    const r = res?.risk;
    const p = res?.payment;
    const sim = res?.sim_card;
    let h = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>PackSmart – ${trip.dest}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Georgia,serif;padding:28px;color:#1a1a1a;font-size:12px;max-width:700px;margin:0 auto}h1{font-size:22px;margin-bottom:2px}h2{font-size:14px;margin:14px 0 5px;padding-bottom:3px;border-bottom:1px solid #ddd}h3{font-size:12px;margin:10px 0 4px;color:#555}.meta{color:#888;font-size:10px;margin-bottom:12px}.card{display:inline-block;padding:6px 10px;margin:0 6px 6px 0;border-radius:5px;font-size:10px;border:1px solid #ddd}.item{display:flex;align-items:center;gap:8px;padding:3px 0;border-bottom:1px dotted #eee}.box{width:12px;height:12px;border:1.5px solid #999;border-radius:2px;flex-shrink:0}.name{flex:1;font-size:11px}.wt{color:#888;font-size:10px}.tag{font-size:9px;padding:1px 5px;border-radius:3px;background:#f0f0f0;color:#555;margin-left:4px}.info{padding:8px 10px;border-radius:5px;margin-bottom:8px;font-size:11px;line-height:1.5}.sum{margin-top:12px;padding:8px;background:#f5f5f5;border-radius:5px;font-size:11px}@media print{body{padding:12px}}</style></head><body>`;
    h += `<h1>🧳 PackSmart – ${trip.dest}</h1>`;
    h += `<div class="meta">${trip.trans.map(id => TRANS.find(m => m.id === id)?.l).join("+")} · ${trip.sd} → ${trip.ed}</div>`;

    // Weather
    if (w) h += `<div class="info" style="background:#f0f7f0;border:1px solid #c3e6c3">🌡️ <strong>${w.high_c}°/${w.low_c}°C</strong> (feels ${w.feels_high_c}°/${w.feels_low_c}°C) · ${w.conditions} · Rain: ${w.rain_chance}</div>`;
    if (res?.clothing_advice) h += `<div class="info" style="background:#fef9ec;border:1px solid #fcd34d">👕 ${res.clothing_advice}</div>`;

    // Risk
    if (r) h += `<div class="info" style="background:${r.level === 'low' ? '#f0fdf4' : r.level === 'high' ? '#fef2f2' : '#fef9ec'};border:1px solid ${r.level === 'low' ? '#86efac' : r.level === 'high' ? '#fca5a5' : '#fcd34d'}">⚠️ Risk: <strong>${r.level.toUpperCase()}</strong> ${r.insured ? '(✓ Insurable)' : '(⚠ Check insurance)'} — ${r.safety}</div>`;

    // Payment
    if (p) {
      h += `<div class="info" style="background:#fff;border:1px solid #ddd">💳 Cards: ${p.cards}. ${p.card_note || ""}`;
      if (p.cash_note) h += `<br>💵 ${p.cash_note}`;
      if (p.usd_note) h += `<br>🇺🇸 ${p.usd_note}`;
      if (p.eur_note) h += `<br>🇪🇺 ${p.eur_note}`;
      if (p.tipping) h += `<br>💰 ${p.tipping}`;
      h += `<br><br><strong>Checklist:</strong> ☐ Cash (${ccur || p.currency || "?"}) · ☐ Physical card`;
      if (sim) h += ` · ☐ SIM/eSIM`;
      h += `</div>`;
    }
    if (sim) h += `<div class="info" style="background:#f0f7ff;border:1px solid #93c5fd">📱 ${sim.advice}</div>`;

    // Cultural tips
    if (res?.cultural_tips?.length) {
      h += `<h2>🌍 Cultural Tips</h2>`;
      res.cultural_tips.forEach(t => { h += `<div style="padding:3px 0;font-size:11px;border-bottom:1px dotted #eee">${{dress:"👔",etiquette:"🤝",safety:"🛡️",practical:"💡"}[t.type]||"💡"} ${t.tip}</div>`; });
    }

    // Packing list by bag
    h += `<h2>🧳 Packing List</h2>`;
    const allI = items.map((it, i) => ({ ...it, _i: i }));
    for (const bt of eb) {
      const bagI = allI.filter(i => i.bag === bt);
      if (!bagI.length) continue;
      const preset = gBP(bt);
      const tw = bagI.reduce((s, i) => s + (i.weight_g || 0) * (i.qty || 1), 0);
      const bag = bags.find(b => b.id === bt);
      h += `<h2>${preset?.i || "📦"} ${preset?.l || bt} — ${(tw / 1000).toFixed(1)}kg${bag?.w ? ` / ${bag.w}kg` : ""}</h2>`;

      const bagSubs = [...new Set(bagI.map(i => i.subcat))];
      const ordered = subs.filter(s => bagSubs.includes(s.id));
      for (const sub of ordered) {
        const si = bagI.filter(i => i.subcat === sub.id);
        if (!si.length) continue;
        h += `<h3>${sub.l}</h3>`;
        si.forEach(i => {
          const sel = chk.has(i._i);
          h += `<div class="item"><div class="box" style="${sel ? 'background:#4a7c59;border-color:#4a7c59' : ''}">${sel ? '<span style="color:#fff;font-size:9px">✓</span>' : ''}</div><div class="name">${i.name}${i.qty > 1 ? ` ×${i.qty}` : ""}${i.note ? ` <span style="color:#aaa">(${i.note})</span>` : ""}${i.buy_at_dest ? '<span class="tag" style="background:#e0f2fe;color:#0369a1">BUY THERE</span>' : ""}</div><div class="wt">${i.weight_g}g</div></div>`;
        });
      }
    }

    // Total
    const totalW = items.reduce((s, i) => s + (i.weight_g || 0) * (i.qty || 1), 0);
    h += `<div class="sum"><strong>Total:</strong> ${items.length} items · ${(totalW / 1000).toFixed(1)}kg · ${chk.size} selected</div>`;

    // Pro tips
    if (res?.tips?.length) {
      h += `<div class="sum" style="margin-top:6px"><strong>💡 Tips:</strong><br>${res.tips.map(t => "• " + t).join("<br>")}</div>`;
    }

    h += `<div style="margin-top:20px;font-size:9px;color:#bbb">PackSmart by Alice Lu · ${new Date().toLocaleDateString()}</div></body></html>`;

    const blob = new Blob([h], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `PackSmart-${trip.dest.replace(/[^a-zA-Z0-9]/g, "_")}.html`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const IS = { width: "100%", padding: "11px 14px", borderRadius: 9, border: "1.5px solid #E5DED4", fontSize: 14, background: "#FAFAF8", outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans'" };
  const LS = { fontSize: 12, fontWeight: 600, color: "#2C4A4A", display: "block", marginBottom: 6 };

  const Row = ({ item, idx }) => {
    const done = chk.has(idx), ed = ek === idx, just = la === idx;
    const pri = PC[item.priority] || PC.recommended;
    if (ed) return (
      <div style={{ padding: "6px 8px", marginBottom: 3, background: "#FFFBF0", borderRadius: 6, border: "1.5px solid #C5974B" }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center", marginBottom: 4 }}>
          <input className="ei" value={item.name} onChange={e => updI(idx, "name", e.target.value)} style={{ flex: 1, minWidth: 60 }} />
          <span style={{ fontSize: 8, color: "#888" }}>×</span>
          <input className="ei" type="number" value={item.qty} onChange={e => updI(idx, "qty", e.target.value)} style={{ width: 26 }} min={1} />
          <input className="ei" type="number" value={item.weight_g} onChange={e => updI(idx, "weight_g", e.target.value)} style={{ width: 38 }} min={0} /><span style={{ fontSize: 8, color: "#888" }}>g</span>
        </div>
        <div style={{ display: "flex", gap: 3, alignItems: "center", flexWrap: "wrap" }}>
          <select className="ei" value={item.bag} onChange={e => updI(idx, "bag", e.target.value)}>{eb.map(b => <option key={b} value={b}>{b}</option>)}</select>
          <select className="ei" value={item.subcat} onChange={e => updI(idx, "subcat", e.target.value)}>{subs.map(s => <option key={s.id} value={s.id}>{s.id}</option>)}</select>
          <select className="ei" value={item.priority} onChange={e => updI(idx, "priority", e.target.value)}><option value="essential">Ess</option><option value="recommended">Rec</option><option value="optional">Opt</option></select>
          <button onClick={() => setEk(null)} style={{ padding: "2px 6px", borderRadius: 3, border: "none", background: "#2C4A4A", color: "#fff", fontSize: 8, cursor: "pointer" }}>✓</button>
          <button onClick={() => delI(idx)} style={{ padding: "2px 5px", borderRadius: 3, border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#991B1B", fontSize: 8, cursor: "pointer" }}>✕</button>
        </div>
      </div>
    );
    return (
      <div className={just ? "jc" : ""} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 9px", marginBottom: 2, background: done ? "#F0FDF4" : "#fff", borderRadius: 7, border: done ? "1px solid #86EFAC" : "1px solid #EDE8E0", opacity: done ? 0.5 : 1, transition: "all .3s" }}>
        <div onClick={e => { e.stopPropagation(); togChk(idx); }} className={just ? "cp" : ""} style={{ width: 15, height: 15, borderRadius: 3, border: done ? "none" : "2px solid #C5C0B8", background: done ? "#4A7C59" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 8, flexShrink: 0, cursor: "pointer" }}>{done && "✓"}</div>
        <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => togChk(idx)}>
          <div style={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 500, textDecoration: done ? "line-through" : "none" }}>{item.name}</span>
            {item.qty > 1 && <span style={{ fontSize: 7, background: "#F3EDE4", padding: "0 3px", borderRadius: 2, color: "#888" }}>×{item.qty}</span>}
            <span style={{ fontSize: 7, padding: "0 3px", borderRadius: 2, background: pri.bg, color: pri.t, border: `1px solid ${pri.b}`, fontWeight: 600 }}>{pri.l}</span>
            {item.buy_at_dest && <span style={{ fontSize: 7, padding: "0 3px", borderRadius: 2, background: "#E0F2FE", color: "#0369A1", fontWeight: 600 }}>BUY THERE</span>}
          </div>
          {item.note && <div style={{ fontSize: 9, color: "#8B8680", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.note}</div>}
        </div>
        <span style={{ fontSize: 9, color: "#6B6560", flexShrink: 0 }}>{item.weight_g}g</span>
        <button onClick={e => { e.stopPropagation(); setEk(idx); }} style={{ width: 16, height: 16, borderRadius: 3, border: "1px solid #E5DED4", background: "#fff", cursor: "pointer", fontSize: 7, color: "#8B8680", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✏️</button>
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(170deg, #FAF7F2 0%, #F3EDE4 50%, #EDE5D8 100%)", fontFamily: "'DM Sans', sans-serif", color: "#1A1A1A" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .fi{opacity:0;transform:translateY(12px);animation:fu .5s ease forwards}@keyframes fu{to{opacity:1;transform:translateY(0)}}
        @keyframes sp{to{transform:rotate(360deg)}}@keyframes pu{0%,100%{opacity:.4}50%{opacity:1}}
        .hl{transition:transform .2s,box-shadow .2s}.hl:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,.06)}
        .ta{border-bottom:2px solid #2C4A4A;color:#2C4A4A;font-weight:600}.ti{border-bottom:2px solid transparent;color:#8B8680}.ti:hover{color:#2C4A4A}
        .wb{transition:width .6s cubic-bezier(.34,1.56,.64,1)}
        input,select{font-family:'DM Sans',sans-serif}
        @keyframes cp2{0%{transform:scale(1)}50%{transform:scale(1.4)}100%{transform:scale(1)}}.cp{animation:cp2 .3s ease}
        .jc{animation:fu .3s ease}
        @keyframes pp{0%{box-shadow:0 0 0 0 rgba(74,124,89,.4)}70%{box-shadow:0 0 0 8px rgba(74,124,89,0)}100%{box-shadow:0 0 0 0 rgba(74,124,89,0)}}.ppulse{animation:pp .6s ease}
        @keyframes cb{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0}}
        .ei{padding:3px 5px;border-radius:3px;border:1.5px solid #C5974B;font-size:9px;outline:none;background:#fff;font-family:'DM Sans';text-align:center}
        .cr{display:flex;align-items:center;gap:7px;padding:5px 8px;background:#FAFAF8;border-radius:5px;margin-bottom:3px;border:1px solid #EDE8E0;cursor:pointer}
      `}</style>

      {conf && <div style={{ position: "fixed", top: "50%", left: "50%", pointerEvents: "none", zIndex: 999 }}>{Array.from({ length: 20 }, (_, i) => { const a = (i / 20) * 360, d = 35 + Math.random() * 25, c = ["#C5974B", "#4A7C59", "#5B8C8C", "#7B6B9C", "#E87C73"][i % 5]; return <div key={i} style={{ position: "absolute", width: 4 + Math.random() * 3, height: 4 + Math.random() * 3, borderRadius: "50%", background: c, animation: `cb .8s ease-out ${Math.random() * .2}s forwards`, opacity: 0, "--tx": `${Math.cos(a * Math.PI / 180) * d}px`, "--ty": `${Math.sin(a * Math.PI / 180) * d}px` }} />; })}</div>}

      <div style={{ padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #E5DED4" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}><span style={{ fontFamily: "'Cormorant Garamond'", fontSize: 21, fontWeight: 700, color: "#2C4A4A" }}>PackSmart</span><span style={{ fontSize: 8, color: "#8B8680", letterSpacing: 1.5, textTransform: "uppercase" }}>AI Packing Optimizer</span></div>
        <div style={{ fontSize: 8, color: "#A09A93" }}>Alice Lu · Claude API</div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "14px 14px" }}>

        {/* S0 */}
        {step === 0 && <div className={fade ? "fi" : ""} style={{ opacity: fade ? undefined : 0 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond'", fontSize: 24, fontWeight: 700, color: "#2C4A4A", textAlign: "center", marginBottom: 2 }}>Where are you headed?</h1>
          <p style={{ textAlign: "center", color: "#8B8680", marginBottom: 18, fontSize: 11 }}>Weather · Safety · Payments · SIM · Culture · Packing</p>
          <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #EDE8E0" }}>
            <div style={{ marginBottom: 10 }}><label style={LS}>Destination</label><input value={trip.dest} onChange={e => setTrip(p => ({ ...p, dest: e.target.value }))} placeholder="e.g., Casablanca, Morocco" style={IS} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              <div><label style={LS}>Start</label><input type="date" value={trip.sd} onChange={e => setTrip(p => ({ ...p, sd: e.target.value }))} style={IS} /></div>
              <div><label style={LS}>End</label><input type="date" value={trip.ed} onChange={e => setTrip(p => ({ ...p, ed: e.target.value }))} style={IS} /></div>
            </div>
            <div style={{ marginBottom: 10 }}><label style={LS}>Transport <span style={{ fontWeight: 400, color: "#8B8680" }}>(all legs)</span></label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 5 }}>{TRANS.map(t => { const s = trip.trans.includes(t.id); return <button key={t.id} onClick={() => setTrip(p => ({ ...p, trans: s ? p.trans.filter(x => x !== t.id) : [...p.trans, t.id] }))} className="hl" style={{ padding: "8px 2px", borderRadius: 9, border: s ? "2px solid #2C4A4A" : "1.5px solid #E5DED4", background: s ? "#2C4A4A" : "#fff", color: s ? "#fff" : "#1A1A1A", cursor: "pointer", textAlign: "center", fontSize: 9 }}><div style={{ fontSize: 15 }}>{t.i}</div>{t.l}</button>; })}</div>
              {trip.trans.length > 1 && <div style={{ marginTop: 4, padding: "4px 8px", background: "#F0F7F7", borderRadius: 5, fontSize: 9, color: "#2C4A4A" }}>🔒 Limits → {sm?.i} {sm?.l}</div>}
            </div>
            <div style={{ marginBottom: 10 }}><label style={LS}>Trip Purpose <span style={{ fontWeight: 400, color: "#8B8680" }}>(multi)</span></label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{TYPES.map(t => { const s = trip.types.includes(t.id); return <button key={t.id} onClick={() => setTrip(p => ({ ...p, types: s ? p.types.filter(x => x !== t.id) : [...p.types, t.id] }))} style={{ padding: "5px 10px", borderRadius: 14, border: s ? "1.5px solid #2C4A4A" : "1.5px solid #E5DED4", background: s ? "#2C4A4A" : "#fff", color: s ? "#fff" : "#6B6560", cursor: "pointer", fontSize: 10, display: "flex", alignItems: "center", gap: 3 }}><span>{t.i}</span>{t.l}</button>; })}</div>
            </div>
            <div><label style={LS}>Activities</label><div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{ACTS.map(a => { const s = trip.acts.includes(a.id); return <button key={a.id} onClick={() => setTrip(p => ({ ...p, acts: s ? p.acts.filter(x => x !== a.id) : [...p.acts, a.id] }))} style={{ padding: "4px 8px", borderRadius: 14, border: s ? "1.5px solid #2C4A4A" : "1.5px solid #E5DED4", background: s ? "#2C4A4A" : "#fff", color: s ? "#fff" : "#6B6560", cursor: "pointer", fontSize: 10, display: "flex", alignItems: "center", gap: 2 }}><span>{a.i}</span>{a.l}</button>; })}</div></div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}><button onClick={() => setStep(1)} disabled={!canN} style={{ padding: "9px 22px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 600, cursor: canN ? "pointer" : "default", background: canN ? "#2C4A4A" : "#C5C0B8", color: "#fff" }}>Next →</button></div>
        </div>}

        {/* S1 - single traveler */}
        {step === 1 && <div className={fade ? "fi" : ""} style={{ opacity: fade ? undefined : 0 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond'", fontSize: 24, fontWeight: 700, color: "#2C4A4A", textAlign: "center", marginBottom: 16 }}>Luggage · {sm?.i} {sm?.l}</h1>
          <div style={{ background: "#fff", borderRadius: 10, padding: 14, border: "1px solid #EDE8E0", marginBottom: 10 }}>
            {bags.map((bag, bi) => <div key={bi} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", borderRadius: 6, marginBottom: 3, background: bag.on ? "#FAFAF8" : "#F5F3F0", border: bag.on ? `1.5px solid ${BC[bag.id] || '#E5DED4'}40` : "1.5px solid #E5DED4", opacity: bag.on ? 1 : 0.4 }}>
              <button onClick={() => setBags(p => p.map((b, j) => j === bi ? { ...b, on: !b.on } : b))} style={{ width: 14, height: 14, borderRadius: 3, border: bag.on ? "none" : "2px solid #C5C0B8", background: bag.on ? (BC[bag.id] || "#2C4A4A") : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 7, cursor: "pointer", flexShrink: 0 }}>{bag.on && "✓"}</button>
              <span style={{ fontSize: 12 }}>{bag.i}</span>
              <div style={{ flex: 1 }}><div style={{ fontSize: 10, fontWeight: 500 }}>{bag.l}</div><div style={{ fontSize: 8, color: "#8B8680" }}>{bag.sz}</div></div>
              {bag.on && bag.w !== null && <div style={{ display: "flex", alignItems: "center", gap: 2 }}><input type="number" value={bag.w || ""} onChange={e => setBags(p => p.map((b, j) => j === bi ? { ...b, w: parseInt(e.target.value) || null } : b))} min={1} max={50} style={{ width: 36, padding: "3px 2px", borderRadius: 3, border: "1.5px solid #E5DED4", fontSize: 10, textAlign: "center", background: "#fff", outline: "none", fontFamily: "'DM Sans'" }} /><span style={{ fontSize: 8, color: "#8B8680" }}>kg</span></div>}
              {bag.on && bag.w === null && <span style={{ fontSize: 8, color: "#8B8680" }}>∞</span>}
            </div>)}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
            <button onClick={() => setStep(0)} style={{ padding: "9px 16px", borderRadius: 8, border: "1.5px solid #D5D0C8", background: "#fff", color: "#6B6560", fontSize: 11, cursor: "pointer" }}>←</button>
            <button onClick={gen} style={{ padding: "9px 22px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", background: "#C5974B", color: "#fff" }}>✨ Generate</button>
          </div>
        </div>}

        {/* S2 */}
        {step === 2 && <div style={{ textAlign: "center", paddingTop: 50 }} className="fi">
          {ld && <><div style={{ width: 42, height: 42, margin: "0 auto 10px", borderRadius: "50%", border: "3px solid #E5DED4", borderTopColor: "#2C4A4A", animation: "sp 1s linear infinite" }} /><p style={{ color: "#8B8680", fontSize: 11, animation: "pu 2.5s ease infinite" }}>{ldm}</p></>}
          {!ld && err && <div style={{ textAlign: "left" }}><div style={{ background: "#FEF2F2", padding: 10, borderRadius: 8, color: "#991B1B", fontSize: 10 }}>{err}<div style={{ display: "flex", gap: 6, marginTop: 6 }}><button onClick={() => { setErr(null); gen(); }} style={{ padding: "4px 12px", borderRadius: 4, border: "none", background: "#991B1B", color: "#fff", cursor: "pointer", fontSize: 9 }}>Retry</button><button onClick={() => { setStep(1); setErr(null); }} style={{ padding: "4px 12px", borderRadius: 4, border: "1px solid #ddd", background: "#fff", color: "#666", cursor: "pointer", fontSize: 9 }}>←</button></div></div>{dbg && <pre style={{ background: "#f9f9f9", padding: 8, borderRadius: 6, fontSize: 8, maxHeight: 120, overflow: "auto", whiteSpace: "pre-wrap", marginTop: 6 }}>{dbg?.substring(0, 800)}</pre>}</div>}
        </div>}

        {/* S3 */}
        {step === 3 && res && <div className="fi">
          {/* Header with print */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "flex-start" }}>
            <div><h1 style={{ fontFamily: "'Cormorant Garamond'", fontSize: 22, fontWeight: 700, color: "#2C4A4A" }}>{trip.dest}</h1><p style={{ color: "#8B8680", fontSize: 9 }}>{trip.trans.map(id => TRANS.find(m => m.id === id)?.i).join("")} {trip.sd} → {trip.ed}</p></div>
            <div style={{ display: "flex", gap: 5 }}>
              <button onClick={exportFull} style={{ padding: "5px 10px", borderRadius: 5, border: "1.5px solid #2C4A4A", background: "#fff", color: "#2C4A4A", fontSize: 9, fontWeight: 600, cursor: "pointer" }}>📥 Export</button>
              <button onClick={() => { setStep(0); setRes(null); setChk(new Set()); }} style={{ padding: "5px 10px", borderRadius: 5, border: "1.5px solid #D5D0C8", background: "#fff", color: "#6B6560", fontSize: 9, cursor: "pointer" }}>New</button>
            </div>
          </div>

          {/* Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>
            {res.weather && <div style={{ background: "linear-gradient(135deg, #2C4A4A, #3D6363)", borderRadius: 9, padding: 10, color: "#fff" }}><div style={{ fontSize: 7, opacity: .7 }}>WEATHER</div><div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Cormorant Garamond'" }}>{res.weather.high_c}°<span style={{ fontSize: 10, opacity: .6 }}>/{res.weather.low_c}°</span></div><div style={{ fontSize: 8, opacity: .8 }}>Feels {res.weather.feels_high_c}°/{res.weather.feels_low_c}°</div></div>}
            <div style={{ background: "#fff", borderRadius: 9, padding: 10, border: "1px solid #EDE8E0" }}><div style={{ fontSize: 7, color: "#8B8680" }}>SELECTED</div><div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Cormorant Garamond'", color: "#2C4A4A" }}>{chk.size}<span style={{ fontSize: 10, color: "#8B8680" }}>/{total}</span></div></div>
            <div className={la !== null ? "ppulse" : ""} style={{ background: "#fff", borderRadius: 9, padding: 10, border: pct === 100 ? "2px solid #4A7C59" : "1px solid #EDE8E0" }}><div style={{ fontSize: 7, color: "#8B8680" }}>PACKED</div><div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Cormorant Garamond'", color: pct === 100 ? "#4A7C59" : "#C5974B" }}>{pct}%</div><div style={{ height: 3, background: "#EDE8E0", borderRadius: 2, marginTop: 2 }}><div className="wb" style={{ height: "100%", borderRadius: 2, background: pct === 100 ? "#4A7C59" : "#C5974B", width: `${pct}%` }} /></div></div>
          </div>

          {/* Risk */}
          {res.risk && (() => { const r = res.risk, rc = RC[r.level] || RC.medium; return <div style={{ background: rc.bg, border: `1px solid ${rc.b}`, borderRadius: 8, padding: 9, marginBottom: 7, fontSize: 10, color: rc.t, lineHeight: 1.4 }}>{rc.i} <strong>{r.level.toUpperCase()}</strong><span style={{ float: "right", fontSize: 8, padding: "1px 4px", borderRadius: 3, background: r.insured ? "#D1FAE5" : "#FEE2E2", color: r.insured ? "#065F46" : "#991B1B", fontWeight: 600 }}>{r.insured ? "✓ Insurable" : "⚠"}</span><div style={{ marginTop: 2 }}>{r.safety}</div></div>; })()}

          {/* Payment + SIM */}
          {res.payment && (() => { const p = res.payment, co = { widespread: "#4A7C59", moderate: "#C5974B", limited: "#B8622E", rare: "#991B1B" }[p.cards] || "#888"; return <div style={{ background: "#fff", border: "1px solid #EDE8E0", borderRadius: 8, padding: 9, marginBottom: 7, fontSize: 10, lineHeight: 1.5 }}>
            <div style={{ fontWeight: 700, color: "#2C4A4A", marginBottom: 4 }}>💳 Payment</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 4 }}><span style={{ fontSize: 8, padding: "1px 4px", borderRadius: 3, background: co + "18", color: co, fontWeight: 600 }}>{p.cards}</span>{p.cash_needed && <span style={{ fontSize: 8, padding: "1px 4px", borderRadius: 3, background: "#FEF9EC", color: "#92400E", fontWeight: 600 }}>💵</span>}{p.bring_usd && <span style={{ fontSize: 8, padding: "1px 4px", borderRadius: 3, background: "#EFF6FF", color: "#1E40AF", fontWeight: 600 }}>🇺🇸</span>}{p.bring_eur && <span style={{ fontSize: 8, padding: "1px 4px", borderRadius: 3, background: "#EFF6FF", color: "#1E40AF", fontWeight: 600 }}>🇪🇺</span>}</div>
            <div style={{ fontSize: 10 }}>{p.card_note}</div>
            {p.cash_note && <div style={{ marginTop: 2 }}>💵 {p.cash_note}</div>}
            {p.usd_note && <div style={{ color: "#1E40AF", marginTop: 2 }}>🇺🇸 {p.usd_note}</div>}
            <div style={{ marginTop: 7, paddingTop: 7, borderTop: "1px solid #EDE8E0" }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: "#2C4A4A", marginBottom: 3 }}>✅ Pre-departure</div>
              <div className="cr" onClick={() => setCc(!cc)}><div style={{ width: 13, height: 13, borderRadius: 3, border: cc ? "none" : "2px solid #C5C0B8", background: cc ? "#4A7C59" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 7 }}>{cc && "✓"}</div><span style={{ fontSize: 10 }}>Cash (</span><input value={ccur} onChange={e => setCcur(e.target.value)} onClick={e => e.stopPropagation()} placeholder="?" style={{ width: 55, padding: "2px 4px", borderRadius: 3, border: "1px solid #E5DED4", fontSize: 9, outline: "none", fontFamily: "'DM Sans'" }} /><span style={{ fontSize: 10 }}>)</span></div>
              <div className="cr" onClick={() => setVc(!vc)}><div style={{ width: 13, height: 13, borderRadius: 3, border: vc ? "none" : "2px solid #C5C0B8", background: vc ? "#4A7C59" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 7 }}>{vc && "✓"}</div><span style={{ fontSize: 10 }}>Physical Visa/MC</span></div>
              <div className="cr" onClick={() => setSc(!sc)}><div style={{ width: 13, height: 13, borderRadius: 3, border: sc ? "none" : "2px solid #C5C0B8", background: sc ? "#4A7C59" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 7 }}>{sc && "✓"}</div><span style={{ fontSize: 10 }}>📱 SIM/eSIM</span></div>
            </div>
            {res.sim_card && <div style={{ marginTop: 5, padding: "5px 7px", background: "#F0F7FF", borderRadius: 5, fontSize: 9, color: "#1E40AF", lineHeight: 1.4 }}>📱 {res.sim_card.advice}</div>}
          </div>; })()}

          {res.clothing_advice && <div style={{ background: "#FEF9EC", border: "1px solid #FCD34D", borderRadius: 7, padding: 7, marginBottom: 7, fontSize: 9, color: "#92400E", lineHeight: 1.4 }}>🌡️ {res.clothing_advice}</div>}

          {/* TABS */}
          <div style={{ display: "flex", borderBottom: "1px solid #E5DED4", marginBottom: 8, overflowX: "auto" }}>
            <button onClick={() => setTab("overview")} className={tab === "overview" ? "ta" : "ti"} style={{ padding: "5px 8px", background: "none", border: "none", cursor: "pointer", fontSize: 10, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 2 }}>📋 <span style={{ fontSize: 7, background: tab === "overview" ? "#2C4A4A" : "#E5DED4", color: tab === "overview" ? "#fff" : "#8B8680", borderRadius: 5, padding: "0 3px", fontWeight: 600 }}>{chk.size}</span></button>
            {eb.map(bt => { const p = gBP(bt); return <button key={bt} onClick={() => { setTab(bt); setAs(null); setEk(null); setAcs(null); }} className={tab === bt ? "ta" : "ti"} style={{ padding: "5px 8px", background: "none", border: "none", cursor: "pointer", fontSize: 10, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 2 }}>{p?.i} {p?.l} <span style={{ fontSize: 7, background: tab === bt ? "#2C4A4A" : "#E5DED4", color: tab === bt ? "#fff" : "#8B8680", borderRadius: 5, padding: "0 3px", fontWeight: 600 }}>{items.filter(i => i.bag === bt).length}</span></button>; })}
            {res.cultural_tips?.length > 0 && <button onClick={() => setTab("culture")} className={tab === "culture" ? "ta" : "ti"} style={{ padding: "5px 8px", background: "none", border: "none", cursor: "pointer", fontSize: 10 }}>🌍</button>}
          </div>

          {/* OVERVIEW */}
          {tab === "overview" && <div>
            {chkItems.length === 0 ? <div style={{ textAlign: "center", padding: 24, color: "#8B8680", fontSize: 11 }}>📋 Select items in bag tabs → they appear here</div> : <div>
              {/* Weight cards */}
              <div style={{ display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
                {eb.map(bt => { const ci = chkItems.filter(i => i.bag === bt); if (!ci.length) return null; const w = ci.reduce((s, i) => s + (i.weight_g || 0) * (i.qty || 1), 0); const lim = bags.find(b => b.id === bt)?.w; const over = lim && (w / 1000) > lim; const p = gBP(bt); return <div key={bt} style={{ flex: 1, minWidth: 90, background: "#fff", borderRadius: 7, padding: "6px 8px", border: over ? "1.5px solid #FCA5A5" : "1px solid #EDE8E0" }}><div style={{ fontSize: 9, fontWeight: 600, color: "#2C4A4A" }}>{p?.i} {p?.l}</div><div style={{ fontSize: 11, fontWeight: 700, color: over ? "#991B1B" : "#2C4A4A", fontFamily: "'Cormorant Garamond'" }}>{(w / 1000).toFixed(1)}<span style={{ fontSize: 8, color: "#8B8680" }}>{lim ? `/${lim}kg` : "kg"}</span>{over && " ⚠️"}</div>{lim && <div style={{ height: 3, background: "#F3EDE4", borderRadius: 2, marginTop: 2 }}><div className="wb" style={{ height: "100%", borderRadius: 2, width: `${Math.min((w / 1000 / lim) * 100, 100)}%`, background: over ? "#E87C73" : (BC[bt] || "#4A7C59") }} /></div>}</div>; })}
                <div style={{ flex: 1, minWidth: 90, background: "#2C4A4A", borderRadius: 7, padding: "6px 8px", color: "#fff" }}><div style={{ fontSize: 9, opacity: .8 }}>Total</div><div style={{ fontSize: 11, fontWeight: 700, fontFamily: "'Cormorant Garamond'" }}>{(chkItems.reduce((s, i) => s + (i.weight_g || 0) * (i.qty || 1), 0) / 1000).toFixed(1)} kg</div></div>
              </div>
              {eb.map(bt => { const ci = chkItems.filter(i => i.bag === bt); if (!ci.length) return null; const p = gBP(bt); return <div key={bt} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3, padding: "4px 7px", background: (BC[bt] || "#888") + "10", borderRadius: 5 }}><span style={{ fontSize: 12 }}>{p?.i}</span><span style={{ fontSize: 10, fontWeight: 600, color: "#2C4A4A" }}>{p?.l}</span></div>
                {ci.map(item => <div key={item._i} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 7px", marginBottom: 2, background: "#F0FDF4", borderRadius: 5, border: "1px solid #86EFAC" }}><span style={{ fontSize: 8, color: "#4A7C59" }}>✓</span><span style={{ flex: 1, fontSize: 10 }}>{item.name}{item.qty > 1 ? ` ×${item.qty}` : ""}</span><span style={{ fontSize: 7, padding: "0 3px", borderRadius: 2, background: (BC[bt] || "#888") + "18", color: BC[bt] || "#888", fontWeight: 600 }}>{p?.l}</span><span style={{ fontSize: 8, color: "#8B8680" }}>{item.weight_g}g</span></div>)}
              </div>; })}
            </div>}
          </div>}

          {/* PER-BAG: show ALL subcats */}
          {tab !== "overview" && tab !== "culture" && (() => {
            const bagItems = items.map((it, i) => ({ ...it, _i: i })).filter(it => it.bag === tab);
            const hasBuy = bagItems.some(i => i.buy_at_dest);
            return <div>
              {hasBuy && <div style={{ background: "#E0F2FE", border: "1px solid #7DD3FC", borderRadius: 5, padding: "3px 7px", marginBottom: 5, fontSize: 8, color: "#0369A1" }}>💡 <strong>BUY THERE</strong> = skip to save weight</div>}

              {/* Show every subcat, even empty ones */}
              {subs.map(sub => {
                const subItems = bagItems.filter(it => it.subcat === sub.id);
                return <div key={sub.id} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#2C4A4A", marginBottom: 2 }}>{sub.l}</div>
                  {subItems.length > 0 ? subItems.map(item => <Row key={item._i} item={item} idx={item._i} />) : (
                    <div style={{ padding: "4px 9px", marginBottom: 2, fontSize: 9, color: "#C5C0B8", fontStyle: "italic" }}>No items yet</div>
                  )}
                  {/* Add item inline */}
                  {as === `${tab}-${sub.id}` ? (
                    <div style={{ padding: "4px 6px", background: "#F0F7F7", borderRadius: 4, border: "1px solid #B8D4D4", marginTop: 2, display: "flex", gap: 3, alignItems: "center", flexWrap: "wrap" }}>
                      <input className="ei" value={ni.name} onChange={e => setNi(p => ({ ...p, name: e.target.value }))} placeholder="Item" style={{ flex: 1, minWidth: 50, textAlign: "left" }} autoFocus />
                      <input className="ei" type="number" value={ni.wg} onChange={e => setNi(p => ({ ...p, wg: parseInt(e.target.value) || 0 }))} style={{ width: 32 }} /><span style={{ fontSize: 7, color: "#888" }}>g</span>
                      <button onClick={() => addI(tab, sub.id)} disabled={!ni.name.trim()} style={{ padding: "2px 6px", borderRadius: 3, border: "none", background: ni.name.trim() ? "#2C4A4A" : "#ccc", color: "#fff", fontSize: 8, cursor: "pointer" }}>+</button>
                      <button onClick={() => setAs(null)} style={{ padding: "2px 4px", borderRadius: 3, border: "1px solid #ddd", background: "#fff", color: "#888", fontSize: 8, cursor: "pointer" }}>×</button>
                    </div>
                  ) : <button onClick={() => { setAs(`${tab}-${sub.id}`); setEk(null); }} style={{ width: "100%", padding: 3, borderRadius: 3, border: "1px dashed #D5D0C8", background: "transparent", color: "#A09A93", cursor: "pointer", fontSize: 8, marginTop: 1 }}>+ Add</button>}
                </div>;
              })}

              {/* New custom category */}
              {acs === tab ? (
                <div style={{ padding: "6px 8px", background: "#F9F7F3", borderRadius: 6, border: "1.5px solid #C5974B", marginTop: 6, display: "flex", gap: 4, alignItems: "center" }}>
                  <span style={{ fontSize: 9 }}>🏷️</span>
                  <input className="ei" value={nsn} onChange={e => setNsn(e.target.value)} placeholder="Category name" style={{ flex: 1, textAlign: "left" }} autoFocus onKeyDown={e => e.key === "Enter" && addSub()} />
                  <button onClick={addSub} disabled={!nsn.trim()} style={{ padding: "2px 8px", borderRadius: 3, border: "none", background: nsn.trim() ? "#2C4A4A" : "#ccc", color: "#fff", fontSize: 8, cursor: "pointer" }}>Create</button>
                  <button onClick={() => { setAcs(null); setNsn(""); }} style={{ padding: "2px 5px", borderRadius: 3, border: "1px solid #ddd", background: "#fff", color: "#888", fontSize: 8, cursor: "pointer" }}>×</button>
                </div>
              ) : <button onClick={() => setAcs(tab)} style={{ width: "100%", padding: 6, borderRadius: 5, border: "1.5px dashed #C5974B", background: "transparent", color: "#C5974B", cursor: "pointer", fontSize: 9, fontWeight: 500, marginTop: 6 }}>+ New Category</button>}
            </div>;
          })()}

          {/* Culture */}
          {tab === "culture" && res.cultural_tips?.map((tip, i) => { const ic = { dress: "👔", etiquette: "🤝", safety: "🛡️", practical: "💡" }[tip.type] || "💡"; const co = { high: "#A65D57", medium: "#C5974B", low: "#4A7C59" }[tip.importance] || "#888"; return <div key={i} style={{ display: "flex", gap: 6, padding: "6px 8px", marginBottom: 2, background: "#fff", borderRadius: 6, border: "1px solid #EDE8E0" }}><span style={{ fontSize: 11 }}>{ic}</span><div style={{ flex: 1, fontSize: 10, lineHeight: 1.4 }}>{tip.tip}</div><span style={{ fontSize: 7, padding: "1px 3px", borderRadius: 2, background: co + "18", color: co, fontWeight: 600, textTransform: "uppercase" }}>{tip.importance}</span></div>; })}

          {res.tips?.length > 0 && <div style={{ marginTop: 10, background: "#F3EDE4", borderRadius: 7, padding: 8 }}><div style={{ fontSize: 9, fontWeight: 600, color: "#2C4A4A", marginBottom: 3 }}>💡 Tips</div>{res.tips.map((t, i) => <div key={i} style={{ fontSize: 9, color: "#6B6560", lineHeight: 1.4 }}>• {t}</div>)}</div>}
        </div>}
      </div>
    </div>
  );
}
