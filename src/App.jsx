import { useState, useEffect } from "react";

var TYPES = [
  { id: "leisure", l: "Leisure", i: "\u{1F3D6}\u{FE0F}" }, { id: "business", l: "Business", i: "\u{1F4BC}" },
  { id: "study", l: "Study", i: "\u{1F4DA}" }, { id: "adventure", l: "Adventure", i: "\u{1F3D4}\u{FE0F}" },
];
var ACTS = [
  { id: "photo", l: "Photo", i: "\u{1F4F8}" }, { id: "hiking", l: "Outdoor", i: "\u{1F97E}" },
  { id: "beach", l: "Beach", i: "\u{1F3CA}" }, { id: "nightlife", l: "Dining", i: "\u{1F377}" },
  { id: "study", l: "Study", i: "\u{1F4D6}" }, { id: "meetings", l: "Formal", i: "\u{1F91D}" },
  { id: "cultural", l: "Culture", i: "\u{1F54C}" }, { id: "fitness", l: "Fitness", i: "\u{1F3CB}\u{FE0F}" },
];
var TRANS = [
  { id: "flight", l: "Flight", i: "\u2708\uFE0F", s: 3 }, { id: "cruise", l: "Cruise", i: "\u{1F6A2}", s: 2 },
  { id: "bus", l: "Bus", i: "\u{1F68C}", s: 2 }, { id: "train", l: "Train", i: "\u{1F684}", s: 1 },
  { id: "car", l: "Car", i: "\u{1F697}", s: 0 },
];
var LUG = {
  flight: [{ id: "personal", l: "Backpack", i: "\u{1F392}", w: 7, sz: "40x30x20cm" }, { id: "carryon", l: "Carry-on", i: "\u{1F9F3}", w: 10, sz: "55x40x20cm" }, { id: "checked", l: "Checked", i: "\u{1F4E6}", w: 23, sz: "L+W+H<=158cm" }],
  cruise: [{ id: "personal", l: "Day Bag", i: "\u{1F392}", w: null, sz: "Excursions" }, { id: "large1", l: "Suitcase 1", i: "\u{1F9F3}", w: null, sz: "No limit" }, { id: "large2", l: "Suitcase 2", i: "\u{1F4E6}", w: null, sz: "No limit" }],
  bus: [{ id: "personal", l: "Backpack", i: "\u{1F392}", w: 7, sz: "Under seat" }, { id: "large1", l: "Bag 1", i: "\u{1F9F3}", w: 23, sz: "L+W+H<=158cm" }, { id: "large2", l: "Bag 2", i: "\u{1F4E6}", w: 23, sz: "L+W+H<=158cm" }],
  train: [{ id: "personal", l: "Backpack", i: "\u{1F392}", w: null, sz: "No limit" }, { id: "large1", l: "Suitcase 1", i: "\u{1F9F3}", w: 23, sz: "L+W+H<=158cm" }, { id: "large2", l: "Suitcase 2", i: "\u{1F4E6}", w: 23, sz: "L+W+H<=158cm" }],
  car: [{ id: "any", l: "Everything", i: "\u{1F697}", w: null, sz: "Trunk" }],
};
var BC = { personal: "#5B8C8C", carryon: "#C5974B", checked: "#7B6B9C", large1: "#6B7B9C", large2: "#7B6B9C", any: "#5A7C5A" };
var PC = { essential: { bg: "#FEF2F2", b: "#FCA5A5", t: "#991B1B", l: "Ess" }, recommended: { bg: "#FEF9EC", b: "#FCD34D", t: "#92400E", l: "Rec" }, optional: { bg: "#F0FDF4", b: "#86EFAC", t: "#166534", l: "Opt" } };
var RC = { low: { bg: "#F0FDF4", b: "#86EFAC", t: "#166534", i: "\u{1F7E2}" }, medium: { bg: "#FEF9EC", b: "#FCD34D", t: "#92400E", i: "\u{1F7E1}" }, high: { bg: "#FEF2F2", b: "#FCA5A5", t: "#991B1B", i: "\u{1F534}" } };

var BASE_SUBS = [
  { id: "valuables", l: "\u{1F48E} Electronics & Valuables" },
  { id: "essentials", l: "\u{1F4CB} Documents & Essentials" },
  { id: "comfort", l: "\u2708\uFE0F Travel Comfort" },
  { id: "clothing", l: "\u{1F457} Clothing" },
  { id: "toiletries", l: "\u{1F9F4} Toiletries" },
  { id: "cosmetics", l: "\u{1F484} Cosmetics" },
  { id: "study", l: "\u{1F4D6} Study & Work" },
  { id: "sightseeing", l: "\u{1F4F8} Sightseeing & Photo" },
  { id: "favorites", l: "\u2B50 My Favorites" },
];

function strict(sel) { var m = null; for (var i = 0; i < sel.length; i++) { var t = TRANS.find(function(x) { return x.id === sel[i]; }); if (!m || (t && t.s > m.s)) m = t; } return m ? m.id : "flight"; }

function exJSON(t) {
  if (!t) return null;
  var c = t.replace(/[`]{3}json\s*/gi, "").replace(/[`]{3}\s*/gi, "").trim();
  try { return JSON.parse(c); } catch (e) {}
  var a = c.indexOf("["), b = c.lastIndexOf("]"), s = c.indexOf("{"), e2 = c.lastIndexOf("}");
  if (a >= 0 && (s < 0 || a < s)) { try { return JSON.parse(c.substring(a, b + 1)); } catch (e) {} }
  if (s >= 0) { try { return JSON.parse(c.substring(s, e2 + 1)); } catch (e) {} }
  return null;
}

function apiCall(p, search) {
  var b = { model: "gemini-2.0-flash", max_tokens: 4096, messages: [{ role: "user", content: p }] };
  if (search) b.tools = [{ type: "web_search_20250305", name: "web_search" }];
  return fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) })
    .then(function(r) { return r.json(); })
    .then(function(d) { if (d.error) throw new Error(d.error.message); return (d.content || []).filter(function(x) { return x.type === "text"; }).map(function(x) { return x.text; }).join("\n"); });
}

var CSS_TEXT = [
  "@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');",
  ".fi{opacity:0;transform:translateY(12px);animation:fu .5s ease forwards}@keyframes fu{to{opacity:1;transform:translateY(0)}}",
  "@keyframes sp{to{transform:rotate(360deg)}}@keyframes pu{0%,100%{opacity:.4}50%{opacity:1}}",
  ".hl{transition:transform .2s,box-shadow .2s}.hl:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,.06)}",
  ".ta{border-bottom:2px solid #2C4A4A;color:#2C4A4A;font-weight:600}.ti{border-bottom:2px solid transparent;color:#8B8680}.ti:hover{color:#2C4A4A}",
  ".wb{transition:width .6s cubic-bezier(.34,1.56,.64,1)}",
  "input,select{font-family:'DM Sans',sans-serif}",
  "@keyframes cp2{0%{transform:scale(1)}50%{transform:scale(1.4)}100%{transform:scale(1)}}.cp{animation:cp2 .3s ease}",
  ".jc{animation:fu .3s ease}",
  "@keyframes pp{0%{box-shadow:0 0 0 0 rgba(74,124,89,.4)}70%{box-shadow:0 0 0 8px rgba(74,124,89,0)}100%{box-shadow:0 0 0 0 rgba(74,124,89,0)}}.ppulse{animation:pp .6s ease}",
  "@keyframes cb{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0}}",
  ".ei{padding:3px 5px;border-radius:3px;border:1.5px solid #C5974B;font-size:9px;outline:none;background:#fff;font-family:'DM Sans';text-align:center}",
  ".cr{display:flex;align-items:center;gap:7px;padding:5px 8px;background:#FAFAF8;border-radius:5px;margin-bottom:3px;border:1px solid #EDE8E0;cursor:pointer}"
].join("\n");

export default function App() {
  var _s = useState, _e = useEffect;
  var _step = _s(0), step = _step[0], setStep = _step[1];
  var _trip = _s({ dest: "", sd: "", ed: "", types: [], acts: [], trans: [] }), trip = _trip[0], setTrip = _trip[1];
  var _bags = _s([]), bags = _bags[0], setBags = _bags[1];
  var _res = _s(null), res = _res[0], setRes = _res[1];
  var _ld = _s(false), ld = _ld[0], setLd = _ld[1];
  var _ldm = _s(""), ldm = _ldm[0], setLdm = _ldm[1];
  var _err = _s(null), err = _err[0], setErr = _err[1];
  var _dbg = _s(null), dbg = _dbg[0], setDbg = _dbg[1];
  var _tab = _s("personal"), tab = _tab[0], setTab = _tab[1];
  var _chk = _s(new Set()), chk = _chk[0], setChk = _chk[1];
  var _fade = _s(true), fade = _fade[0], setFade = _fade[1];
  var _ek = _s(null), ek = _ek[0], setEk = _ek[1];
  var _as = _s(null), as2 = _as[0], setAs = _as[1];
  var _ni = _s({ name: "", qty: 1, wg: 100, pri: "recommended" }), ni = _ni[0], setNi = _ni[1];
  var _la = _s(null), la = _la[0], setLa = _la[1];
  var _conf = _s(false), conf = _conf[0], setConf = _conf[1];
  var _cc = _s(false), cc = _cc[0], setCc = _cc[1];
  var _ccur = _s(""), ccur = _ccur[0], setCcur = _ccur[1];
  var _vc = _s(false), vc = _vc[0], setVc = _vc[1];
  var _sc = _s(false), sc = _sc[0], setSc = _sc[1];
  var _subs = _s([].concat(BASE_SUBS)), subs = _subs[0], setSubs = _subs[1];
  var _nsn = _s(""), nsn = _nsn[0], setNsn = _nsn[1];
  var _acs = _s(null), acs = _acs[0], setAcs = _acs[1];

  var st = strict(trip.trans);
  var sm = TRANS.find(function(x) { return x.id === st; });
  _e(function() { setBags((LUG[st] || LUG.flight).map(function(x) { return Object.assign({}, x, { on: true }); })); }, [st]);
  _e(function() { setFade(false); setTimeout(function() { setFade(true); }, 50); }, [step]);
  var ms = ["Researching...", "Checking safety...", "Payments...", "Building list...", "Done soon..."];
  _e(function() { if (!ld) return; var i = 0; setLdm(ms[0]); var iv = setInterval(function() { i = (i + 1) % ms.length; setLdm(ms[i]); }, 3000); return function() { clearInterval(iv); }; }, [ld]);

  var items = res ? (res.items || []) : [];
  var total = items.length;
  var pct = total > 0 ? Math.round((chk.size / total) * 100) : 0;
  var chkItems = items.map(function(it, i) { return Object.assign({}, it, { _i: i }); }).filter(function(it) { return chk.has(it._i); });
  var eb = bags.filter(function(b) { return b.on; }).map(function(b) { return b.id; });
  var gBP = function(bt) { return (LUG[st] || []).find(function(x) { return x.id === bt; }); };

  var togChk = function(idx) {
    setChk(function(p) {
      var n = new Set(p); var w = n.has(idx);
      if (w) n.delete(idx); else n.add(idx);
      if (!w) { setLa(idx); setTimeout(function() { setLa(null); }, 600); if (n.size === total) { setConf(true); setTimeout(function() { setConf(false); }, 1200); } }
      return n;
    });
  };
  var updI = function(i, f, v) { setRes(function(p) { return Object.assign({}, p, { items: p.items.map(function(it, j) { if (j !== i) return it; var u = {}; u[f] = (f === "qty" || f === "wg") ? (parseInt(v) || 0) : v; return Object.assign({}, it, u); }) }); }); };
  var delI = function(i) { setChk(function(p) { var n = new Set(); p.forEach(function(x) { if (x < i) n.add(x); else if (x > i) n.add(x - 1); }); return n; }); setRes(function(p) { return Object.assign({}, p, { items: p.items.filter(function(_, j) { return j !== i; }) }); }); setEk(null); };
  var addI = function(bag, sub) { if (!ni.name.trim()) return; setRes(function(p) { return Object.assign({}, p, { items: p.items.concat([{ name: ni.name, qty: ni.qty, weight_g: ni.wg, priority: ni.pri, bag: bag, subcat: sub, note: "", buy_at_dest: false }]) }); }); setNi({ name: "", qty: 1, wg: 100, pri: "recommended" }); setAs(null); };
  var addSub = function() { if (!nsn.trim()) return; var id = nsn.trim().toLowerCase().replace(/\s+/g, "_"); if (subs.some(function(s) { return s.id === id; })) return; setSubs(function(p) { return p.concat([{ id: id, l: "\u{1F3F7}\u{FE0F} " + nsn.trim() }]); }); setNsn(""); setAcs(null); };

  var canN = trip.dest && trip.sd && trip.ed && trip.types.length > 0 && trip.trans.length > 0;

  var gen = function() {
    setStep(2); setLd(true); setErr(null); setDbg(null);
    var bts = eb.join("|");
    var actS = trip.acts.map(function(a) { var f = ACTS.find(function(x) { return x.id === a; }); return f ? f.l : null; }).filter(Boolean).join(",") || "General";
    var typeS = trip.types.map(function(id) { var f = TYPES.find(function(t) { return t.id === id; }); return f ? f.l : ""; }).join("+");
    var transS = trip.trans.map(function(id) { var f = TRANS.find(function(m) { return m.id === id; }); return f ? f.l : ""; }).join("+");

    setLdm("Researching " + trip.dest + "...");
    apiCall("Search web for " + trip.dest + " travel info, " + trip.sd + " to " + trip.ed + ".\nReturn ONLY JSON: {\"weather\":{\"high_c\":20,\"low_c\":12,\"feels_high_c\":18,\"feels_low_c\":10,\"conditions\":\"\",\"rain_chance\":\"\"},\"clothing_advice\":\"\",\"risk\":{\"level\":\"low\",\"insured\":true,\"insurance_note\":\"\",\"safety\":\"\",\"warnings\":[]},\"payment\":{\"cards\":\"moderate\",\"card_note\":\"\",\"cash_needed\":true,\"cash_note\":\"\",\"currency\":\"\",\"bring_usd\":false,\"usd_note\":\"\",\"bring_eur\":false,\"eur_note\":\"\",\"atm\":true,\"tipping\":\"\"},\"sim_card\":{\"needed\":true,\"advice\":\"include late night arrival tip\"},\"cultural_tips\":[{\"tip\":\"\",\"type\":\"dress\",\"importance\":\"high\"}],\"tips\":[\"\"]}", true)
    .then(function(it) {
      var info = exJSON(it);
      if (!info) { setDbg(it); throw new Error("Parse error (info)"); }
      setLdm("Building packing list...");
      var weatherStr = info.weather ? (info.weather.high_c + "/" + info.weather.low_c + "C feels " + info.weather.feels_high_c + "/" + info.weather.feels_low_c + "C") : "";
      var cashStr = (info.payment && info.payment.cash_needed) ? "Cash needed." : "";
      var usdStr = (info.payment && info.payment.bring_usd) ? "USD." : "";
      var eurStr = (info.payment && info.payment.bring_eur) ? "EUR." : "";
      var rainStr = info.weather ? info.weather.rain_chance : "";
      return apiCall("Packing list for " + trip.dest + ", " + trip.sd + "-" + trip.ed + ". " + typeS + ". " + transS + ". Activities: " + actS + ". Weather: " + weatherStr + ". Rain: " + rainStr + ". Bags: " + bts + ". " + cashStr + " " + usdStr + " " + eurStr + "\nReturn ONLY JSON array: [{\"name\":\"\",\"qty\":1,\"weight_g\":200,\"priority\":\"essential\",\"bag\":\"personal\",\"subcat\":\"valuables\",\"note\":\"\",\"buy_at_dest\":false}]\nSubcats: valuables(laptop,camera,charger,powerbank)->personal. essentials(passport,wallet,SIM,meds,keys,insurance)->personal. comfort(neck pillow,eye mask,snacks,headphones,water bottle,compact umbrella)->personal. clothing->carryon/large1. toiletries->any,buy_at_dest=true if easy in " + trip.dest + ". cosmetics->any,buy_at_dest=true if easy. study->personal/carryon. sightseeing->any. favorites(1-2 personal items). Liquids>100ml->checked/large if flying. Adapter for " + trip.dest + ". INCLUDE umbrella. 25-40 items.", false)
      .then(function(it2) { return { info: info, it2: it2 }; });
    })
    .then(function(r) {
      var info = r.info, it2 = r.it2;
      var parsedItems = exJSON(it2);
      if (!parsedItems || !Array.isArray(parsedItems)) { setDbg(it2); throw new Error("Parse error (items)"); }
      setRes(Object.assign({}, info, { items: parsedItems }));
      if (info.payment) { setCc(!!info.payment.cash_needed); setCcur(info.payment.currency || ""); setVc(info.payment.cards !== "widespread"); }
      if (info.sim_card) setSc(!!info.sim_card.needed);
      setTab(eb[0] || "personal");
      setStep(3);
    })
    .catch(function(e) { setErr(e.message); setStep(2); })
    .finally(function() { setLd(false); });
  };

  var exportFull = function() {
    var w = res ? res.weather : null;
    var r = res ? res.risk : null;
    var p = res ? res.payment : null;
    var sim = res ? res.sim_card : null;
    var h = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>PackSmart - " + trip.dest + "</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Georgia,serif;padding:28px;color:#1a1a1a;font-size:12px;max-width:700px;margin:0 auto}h1{font-size:22px;margin-bottom:2px}h2{font-size:14px;margin:14px 0 5px;padding-bottom:3px;border-bottom:1px solid #ddd}h3{font-size:12px;margin:10px 0 4px;color:#555}.meta{color:#888;font-size:10px;margin-bottom:12px}.item{display:flex;align-items:center;gap:8px;padding:3px 0;border-bottom:1px dotted #eee}.box{width:12px;height:12px;border:1.5px solid #999;border-radius:2px;flex-shrink:0}.name{flex:1;font-size:11px}.wt{color:#888;font-size:10px}.info{padding:8px 10px;border-radius:5px;margin-bottom:8px;font-size:11px;line-height:1.5}.sum{margin-top:12px;padding:8px;background:#f5f5f5;border-radius:5px;font-size:11px}</style></head><body>";
    h += "<h1>PackSmart - " + trip.dest + "</h1>";
    h += "<div class=\"meta\">" + trip.trans.map(function(id) { var f = TRANS.find(function(m) { return m.id === id; }); return f ? f.l : ""; }).join("+") + " | " + trip.sd + " to " + trip.ed + "</div>";
    if (w) h += "<div class=\"info\" style=\"background:#f0f7f0;border:1px solid #c3e6c3\">Weather: " + w.high_c + "/" + w.low_c + "C (feels " + w.feels_high_c + "/" + w.feels_low_c + "C) | " + w.conditions + " | Rain: " + w.rain_chance + "</div>";
    if (res && res.clothing_advice) h += "<div class=\"info\" style=\"background:#fef9ec;border:1px solid #fcd34d\">" + res.clothing_advice + "</div>";
    if (r) h += "<div class=\"info\" style=\"background:#fef9ec;border:1px solid #fcd34d\">Risk: " + r.level.toUpperCase() + " " + (r.insured ? "(Insurable)" : "(Check insurance)") + " - " + r.safety + "</div>";
    if (p) {
      h += "<div class=\"info\" style=\"background:#fff;border:1px solid #ddd\">Cards: " + p.cards + ". " + (p.card_note || "");
      if (p.cash_note) h += "<br>" + p.cash_note;
      if (p.usd_note) h += "<br>" + p.usd_note;
      h += "<br><br>Checklist: [ ] Cash (" + (ccur || (p.currency || "?")) + ") | [ ] Physical card";
      if (sim) h += " | [ ] SIM/eSIM";
      h += "</div>";
    }
    if (sim) h += "<div class=\"info\" style=\"background:#f0f7ff;border:1px solid #93c5fd\">" + sim.advice + "</div>";
    h += "<h2>Packing List</h2>";
    var allI = items.map(function(it, i) { return Object.assign({}, it, { _i: i }); });
    eb.forEach(function(bt) {
      var bagI = allI.filter(function(i) { return i.bag === bt; });
      if (!bagI.length) return;
      var preset = gBP(bt);
      var tw = bagI.reduce(function(s, i) { return s + (i.weight_g || 0) * (i.qty || 1); }, 0);
      var bag = bags.find(function(b) { return b.id === bt; });
      h += "<h2>" + (preset ? preset.l : bt) + " - " + (tw / 1000).toFixed(1) + "kg" + (bag && bag.w ? " / " + bag.w + "kg" : "") + "</h2>";
      var bagSubs = [];
      bagI.forEach(function(i) { if (bagSubs.indexOf(i.subcat) === -1) bagSubs.push(i.subcat); });
      subs.filter(function(s) { return bagSubs.indexOf(s.id) >= 0; }).forEach(function(sub) {
        var si = bagI.filter(function(i) { return i.subcat === sub.id; });
        if (!si.length) return;
        h += "<h3>" + sub.l + "</h3>";
        si.forEach(function(i) {
          var sel = chk.has(i._i);
          h += "<div class=\"item\"><div class=\"box\"" + (sel ? " style=\"background:#4a7c59;border-color:#4a7c59\"" : "") + "></div><div class=\"name\">" + i.name + (i.qty > 1 ? " x" + i.qty : "") + (i.note ? " (" + i.note + ")" : "") + "</div><div class=\"wt\">" + i.weight_g + "g</div></div>";
        });
      });
    });
    var totalW = items.reduce(function(s, i) { return s + (i.weight_g || 0) * (i.qty || 1); }, 0);
    h += "<div class=\"sum\">Total: " + items.length + " items | " + (totalW / 1000).toFixed(1) + "kg | " + chk.size + " selected</div>";
    h += "<div style=\"margin-top:20px;font-size:9px;color:#bbb\">PackSmart by Alice Lu</div></body></html>";
    var blob = new Blob([h], { type: "text/html" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = "PackSmart-" + trip.dest.replace(/[^a-zA-Z0-9]/g, "_") + ".html";
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  var IS = { width: "100%", padding: "11px 14px", borderRadius: 9, border: "1.5px solid #E5DED4", fontSize: 14, background: "#FAFAF8", outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans'" };
  var LS = { fontSize: 12, fontWeight: 600, color: "#2C4A4A", display: "block", marginBottom: 6 };

  function Row(props) {
    var item = props.item, idx = props.idx;
    var done = chk.has(idx), ed = ek === idx, just = la === idx;
    var pri = PC[item.priority] || PC.recommended;
    if (ed) return (
      React.createElement("div", { style: { padding: "6px 8px", marginBottom: 3, background: "#FFFBF0", borderRadius: 6, border: "1.5px solid #C5974B" } },
        React.createElement("div", { style: { display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center", marginBottom: 4 } },
          React.createElement("input", { className: "ei", value: item.name, onChange: function(e) { updI(idx, "name", e.target.value); }, style: { flex: 1, minWidth: 60 } }),
          React.createElement("span", { style: { fontSize: 8, color: "#888" } }, "x"),
          React.createElement("input", { className: "ei", type: "number", value: item.qty, onChange: function(e) { updI(idx, "qty", e.target.value); }, style: { width: 26 }, min: 1 }),
          React.createElement("input", { className: "ei", type: "number", value: item.weight_g, onChange: function(e) { updI(idx, "weight_g", e.target.value); }, style: { width: 38 }, min: 0 }),
          React.createElement("span", { style: { fontSize: 8, color: "#888" } }, "g")
        ),
        React.createElement("div", { style: { display: "flex", gap: 3, alignItems: "center", flexWrap: "wrap" } },
          React.createElement("select", { className: "ei", value: item.bag, onChange: function(e) { updI(idx, "bag", e.target.value); } }, eb.map(function(b) { return React.createElement("option", { key: b, value: b }, b); })),
          React.createElement("select", { className: "ei", value: item.subcat, onChange: function(e) { updI(idx, "subcat", e.target.value); } }, subs.map(function(s) { return React.createElement("option", { key: s.id, value: s.id }, s.id); })),
          React.createElement("button", { onClick: function() { setEk(null); }, style: { padding: "2px 6px", borderRadius: 3, border: "none", background: "#2C4A4A", color: "#fff", fontSize: 8, cursor: "pointer" } }, "Done"),
          React.createElement("button", { onClick: function() { delI(idx); }, style: { padding: "2px 5px", borderRadius: 3, border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#991B1B", fontSize: 8, cursor: "pointer" } }, "Del")
        )
      )
    );
    return React.createElement("div", { className: just ? "jc" : "", style: { display: "flex", alignItems: "center", gap: 6, padding: "7px 9px", marginBottom: 2, background: done ? "#F0FDF4" : "#fff", borderRadius: 7, border: done ? "1px solid #86EFAC" : "1px solid #EDE8E0", opacity: done ? 0.5 : 1, transition: "all .3s" } },
      React.createElement("div", { onClick: function(e) { e.stopPropagation(); togChk(idx); }, className: just ? "cp" : "", style: { width: 15, height: 15, borderRadius: 3, border: done ? "none" : "2px solid #C5C0B8", background: done ? "#4A7C59" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 8, flexShrink: 0, cursor: "pointer" } }, done ? "\u2713" : null),
      React.createElement("div", { style: { flex: 1, minWidth: 0, cursor: "pointer" }, onClick: function() { togChk(idx); } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" } },
          React.createElement("span", { style: { fontSize: 11, fontWeight: 500, textDecoration: done ? "line-through" : "none" } }, item.name),
          item.qty > 1 ? React.createElement("span", { style: { fontSize: 7, background: "#F3EDE4", padding: "0 3px", borderRadius: 2, color: "#888" } }, "x" + item.qty) : null,
          React.createElement("span", { style: { fontSize: 7, padding: "0 3px", borderRadius: 2, background: pri.bg, color: pri.t, border: "1px solid " + pri.b, fontWeight: 600 } }, pri.l),
          item.buy_at_dest ? React.createElement("span", { style: { fontSize: 7, padding: "0 3px", borderRadius: 2, background: "#E0F2FE", color: "#0369A1", fontWeight: 600 } }, "BUY THERE") : null
        ),
        item.note ? React.createElement("div", { style: { fontSize: 9, color: "#8B8680", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, item.note) : null
      ),
      React.createElement("span", { style: { fontSize: 9, color: "#6B6560", flexShrink: 0 } }, item.weight_g + "g"),
      React.createElement("button", { onClick: function(e) { e.stopPropagation(); setEk(idx); }, style: { width: 16, height: 16, borderRadius: 3, border: "1px solid #E5DED4", background: "#fff", cursor: "pointer", fontSize: 7, color: "#8B8680", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } }, "\u270F\uFE0F")
    );
  }

  function Btn(props) {
    return React.createElement("button", Object.assign({}, props, { className: (props.className || "") }), props.children);
  }

  // Simple helper for making tag buttons
  function TagBtn(props) {
    var sel = props.selected;
    return React.createElement("button", {
      onClick: props.onClick,
      className: "hl",
      style: { padding: props.big ? "8px 2px" : "4px 8px", borderRadius: props.big ? 9 : 14, border: sel ? "2px solid #2C4A4A" : "1.5px solid #E5DED4", background: sel ? "#2C4A4A" : "#fff", color: sel ? "#fff" : props.big ? "#1A1A1A" : "#6B6560", cursor: "pointer", textAlign: "center", fontSize: props.big ? 9 : 10, display: props.big ? "block" : "flex", alignItems: "center", gap: 2 }
    }, props.big ? React.createElement("div", { style: { fontSize: 15 } }, props.icon) : React.createElement("span", null, props.icon), props.big ? props.label : React.createElement("span", null, props.label));
  }

  return React.createElement("div", { style: { minHeight: "100vh", background: "linear-gradient(170deg, #FAF7F2 0%, #F3EDE4 50%, #EDE5D8 100%)", fontFamily: "'DM Sans', sans-serif", color: "#1A1A1A" } },
    React.createElement("style", null, CSS_TEXT),

    // Header
    React.createElement("div", { style: { padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #E5DED4" } },
      React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 7 } },
        React.createElement("span", { style: { fontFamily: "'Cormorant Garamond'", fontSize: 21, fontWeight: 700, color: "#2C4A4A" } }, "PackSmart"),
        React.createElement("span", { style: { fontSize: 8, color: "#8B8680", letterSpacing: 1.5, textTransform: "uppercase" } }, "AI Packing Optimizer")
      ),
      React.createElement("span", { style: { fontSize: 8, color: "#A09A93" } }, "Alice Lu")
    ),

    React.createElement("div", { style: { maxWidth: 800, margin: "0 auto", padding: "14px" } },

      // Step 0
      step === 0 && React.createElement("div", { className: fade ? "fi" : "", style: { opacity: fade ? undefined : 0 } },
        React.createElement("h1", { style: { fontFamily: "'Cormorant Garamond'", fontSize: 24, fontWeight: 700, color: "#2C4A4A", textAlign: "center", marginBottom: 2 } }, "Where are you headed?"),
        React.createElement("p", { style: { textAlign: "center", color: "#8B8680", marginBottom: 18, fontSize: 11 } }, "Weather \u00B7 Safety \u00B7 Payments \u00B7 SIM \u00B7 Packing"),
        React.createElement("div", { style: { background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #EDE8E0" } },
          React.createElement("div", { style: { marginBottom: 10 } },
            React.createElement("label", { style: LS }, "Destination"),
            React.createElement("input", { value: trip.dest, onChange: function(e) { setTrip(Object.assign({}, trip, { dest: e.target.value })); }, placeholder: "e.g., Casablanca, Morocco", style: IS })
          ),
          React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 } },
            React.createElement("div", null, React.createElement("label", { style: LS }, "Start"), React.createElement("input", { type: "date", value: trip.sd, onChange: function(e) { setTrip(Object.assign({}, trip, { sd: e.target.value })); }, style: IS })),
            React.createElement("div", null, React.createElement("label", { style: LS }, "End"), React.createElement("input", { type: "date", value: trip.ed, onChange: function(e) { setTrip(Object.assign({}, trip, { ed: e.target.value })); }, style: IS }))
          ),
          React.createElement("div", { style: { marginBottom: 10 } },
            React.createElement("label", { style: LS }, "Transport (all legs)"),
            React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 5 } },
              TRANS.map(function(t) { return React.createElement(TagBtn, { key: t.id, big: true, selected: trip.trans.indexOf(t.id) >= 0, icon: t.i, label: t.l, onClick: function() { var idx = trip.trans.indexOf(t.id); setTrip(Object.assign({}, trip, { trans: idx >= 0 ? trip.trans.filter(function(x) { return x !== t.id; }) : trip.trans.concat([t.id]) })); } }); })
            ),
            trip.trans.length > 1 ? React.createElement("div", { style: { marginTop: 4, padding: "4px 8px", background: "#F0F7F7", borderRadius: 5, fontSize: 9, color: "#2C4A4A" } }, "\u{1F512} Limits follow " + (sm ? sm.i + " " + sm.l : "")) : null
          ),
          React.createElement("div", { style: { marginBottom: 10 } },
            React.createElement("label", { style: LS }, "Trip Purpose (multi)"),
            React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 5 } },
              TYPES.map(function(t) { return React.createElement(TagBtn, { key: t.id, selected: trip.types.indexOf(t.id) >= 0, icon: t.i, label: t.l, onClick: function() { var idx = trip.types.indexOf(t.id); setTrip(Object.assign({}, trip, { types: idx >= 0 ? trip.types.filter(function(x) { return x !== t.id; }) : trip.types.concat([t.id]) })); } }); })
            )
          ),
          React.createElement("div", null,
            React.createElement("label", { style: LS }, "Activities"),
            React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
              ACTS.map(function(a) { return React.createElement(TagBtn, { key: a.id, selected: trip.acts.indexOf(a.id) >= 0, icon: a.i, label: a.l, onClick: function() { var idx = trip.acts.indexOf(a.id); setTrip(Object.assign({}, trip, { acts: idx >= 0 ? trip.acts.filter(function(x) { return x !== a.id; }) : trip.acts.concat([a.id]) })); } }); })
            )
          )
        ),
        React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", marginTop: 12 } },
          React.createElement("button", { onClick: function() { setStep(1); }, disabled: !canN, style: { padding: "9px 22px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 600, cursor: canN ? "pointer" : "default", background: canN ? "#2C4A4A" : "#C5C0B8", color: "#fff" } }, "Next \u2192")
        )
      ),

      // Step 1
      step === 1 && React.createElement("div", { className: fade ? "fi" : "", style: { opacity: fade ? undefined : 0 } },
        React.createElement("h1", { style: { fontFamily: "'Cormorant Garamond'", fontSize: 24, fontWeight: 700, color: "#2C4A4A", textAlign: "center", marginBottom: 16 } }, "Luggage \u00B7 " + (sm ? sm.i + " " + sm.l : "")),
        React.createElement("div", { style: { background: "#fff", borderRadius: 10, padding: 14, border: "1px solid #EDE8E0", marginBottom: 10 } },
          bags.map(function(bag, bi) {
            return React.createElement("div", { key: bi, style: { display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", borderRadius: 6, marginBottom: 3, background: bag.on ? "#FAFAF8" : "#F5F3F0", border: bag.on ? "1.5px solid " + (BC[bag.id] || "#E5DED4") + "40" : "1.5px solid #E5DED4", opacity: bag.on ? 1 : 0.4 } },
              React.createElement("button", { onClick: function() { setBags(bags.map(function(b, j) { return j === bi ? Object.assign({}, b, { on: !b.on }) : b; })); }, style: { width: 14, height: 14, borderRadius: 3, border: bag.on ? "none" : "2px solid #C5C0B8", background: bag.on ? (BC[bag.id] || "#2C4A4A") : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 7, cursor: "pointer", flexShrink: 0 } }, bag.on ? "\u2713" : null),
              React.createElement("span", { style: { fontSize: 12 } }, bag.i),
              React.createElement("div", { style: { flex: 1 } },
                React.createElement("div", { style: { fontSize: 10, fontWeight: 500 } }, bag.l),
                React.createElement("div", { style: { fontSize: 8, color: "#8B8680" } }, bag.sz)
              ),
              bag.on && bag.w !== null ? React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 2 } },
                React.createElement("input", { type: "number", value: bag.w || "", onChange: function(e) { setBags(bags.map(function(b, j) { return j === bi ? Object.assign({}, b, { w: parseInt(e.target.value) || null }) : b; })); }, min: 1, max: 50, style: { width: 36, padding: "3px 2px", borderRadius: 3, border: "1.5px solid #E5DED4", fontSize: 10, textAlign: "center", background: "#fff", outline: "none", fontFamily: "'DM Sans'" } }),
                React.createElement("span", { style: { fontSize: 8, color: "#8B8680" } }, "kg")
              ) : null,
              bag.on && bag.w === null ? React.createElement("span", { style: { fontSize: 8, color: "#8B8680" } }, "\u221E") : null
            );
          })
        ),
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 12 } },
          React.createElement("button", { onClick: function() { setStep(0); }, style: { padding: "9px 16px", borderRadius: 8, border: "1.5px solid #D5D0C8", background: "#fff", color: "#6B6560", fontSize: 11, cursor: "pointer" } }, "\u2190"),
          React.createElement("button", { onClick: gen, style: { padding: "9px 22px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", background: "#C5974B", color: "#fff" } }, "\u2728 Generate")
        )
      ),

      // Step 2 - Loading
      step === 2 && React.createElement("div", { style: { textAlign: "center", paddingTop: 50 }, className: "fi" },
        ld ? React.createElement("div", null,
          React.createElement("div", { style: { width: 42, height: 42, margin: "0 auto 10px", borderRadius: "50%", border: "3px solid #E5DED4", borderTopColor: "#2C4A4A", animation: "sp 1s linear infinite" } }),
          React.createElement("p", { style: { color: "#8B8680", fontSize: 11, animation: "pu 2.5s ease infinite" } }, ldm)
        ) : null,
        !ld && err ? React.createElement("div", { style: { textAlign: "left" } },
          React.createElement("div", { style: { background: "#FEF2F2", padding: 10, borderRadius: 8, color: "#991B1B", fontSize: 10 } },
            err,
            React.createElement("div", { style: { display: "flex", gap: 6, marginTop: 6 } },
              React.createElement("button", { onClick: function() { setErr(null); gen(); }, style: { padding: "4px 12px", borderRadius: 4, border: "none", background: "#991B1B", color: "#fff", cursor: "pointer", fontSize: 9 } }, "Retry"),
              React.createElement("button", { onClick: function() { setStep(1); setErr(null); }, style: { padding: "4px 12px", borderRadius: 4, border: "1px solid #ddd", background: "#fff", color: "#666", cursor: "pointer", fontSize: 9 } }, "\u2190 Back")
            )
          ),
          dbg ? React.createElement("pre", { style: { background: "#f9f9f9", padding: 8, borderRadius: 6, fontSize: 8, maxHeight: 120, overflow: "auto", whiteSpace: "pre-wrap", marginTop: 6 } }, (dbg || "").substring(0, 800)) : null
        ) : null
      ),

      // Step 3 - Results
      step === 3 && res && React.createElement("div", { className: "fi" },
        // Header
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "flex-start" } },
          React.createElement("div", null,
            React.createElement("h1", { style: { fontFamily: "'Cormorant Garamond'", fontSize: 22, fontWeight: 700, color: "#2C4A4A" } }, trip.dest),
            React.createElement("p", { style: { color: "#8B8680", fontSize: 9 } }, trip.trans.map(function(id) { var f = TRANS.find(function(m) { return m.id === id; }); return f ? f.i : ""; }).join("") + " " + trip.sd + " \u2192 " + trip.ed)
          ),
          React.createElement("div", { style: { display: "flex", gap: 5 } },
            React.createElement("button", { onClick: exportFull, style: { padding: "5px 10px", borderRadius: 5, border: "1.5px solid #2C4A4A", background: "#fff", color: "#2C4A4A", fontSize: 9, fontWeight: 600, cursor: "pointer" } }, "\u{1F4E5} Export"),
            React.createElement("button", { onClick: function() { setStep(0); setRes(null); setChk(new Set()); }, style: { padding: "5px 10px", borderRadius: 5, border: "1.5px solid #D5D0C8", background: "#fff", color: "#6B6560", fontSize: 9, cursor: "pointer" } }, "New")
          )
        ),

        // Weather + Stats cards
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 10 } },
          res.weather ? React.createElement("div", { style: { background: "linear-gradient(135deg, #2C4A4A, #3D6363)", borderRadius: 9, padding: 10, color: "#fff" } },
            React.createElement("div", { style: { fontSize: 7, opacity: 0.7 } }, "WEATHER"),
            React.createElement("div", { style: { fontSize: 20, fontWeight: 700, fontFamily: "'Cormorant Garamond'" } }, res.weather.high_c + "\u00B0", React.createElement("span", { style: { fontSize: 10, opacity: 0.6 } }, "/" + res.weather.low_c + "\u00B0")),
            React.createElement("div", { style: { fontSize: 8, opacity: 0.8 } }, "Feels " + res.weather.feels_high_c + "\u00B0/" + res.weather.feels_low_c + "\u00B0")
          ) : null,
          React.createElement("div", { style: { background: "#fff", borderRadius: 9, padding: 10, border: "1px solid #EDE8E0" } },
            React.createElement("div", { style: { fontSize: 7, color: "#8B8680" } }, "SELECTED"),
            React.createElement("div", { style: { fontSize: 20, fontWeight: 700, fontFamily: "'Cormorant Garamond'", color: "#2C4A4A" } }, chk.size, React.createElement("span", { style: { fontSize: 10, color: "#8B8680" } }, "/" + total))
          ),
          React.createElement("div", { className: la !== null ? "ppulse" : "", style: { background: "#fff", borderRadius: 9, padding: 10, border: pct === 100 ? "2px solid #4A7C59" : "1px solid #EDE8E0" } },
            React.createElement("div", { style: { fontSize: 7, color: "#8B8680" } }, "PACKED"),
            React.createElement("div", { style: { fontSize: 20, fontWeight: 700, fontFamily: "'Cormorant Garamond'", color: pct === 100 ? "#4A7C59" : "#C5974B" } }, pct + "%"),
            React.createElement("div", { style: { height: 3, background: "#EDE8E0", borderRadius: 2, marginTop: 2 } },
              React.createElement("div", { className: "wb", style: { height: "100%", borderRadius: 2, background: pct === 100 ? "#4A7C59" : "#C5974B", width: pct + "%" } })
            )
          )
        ),

        // Risk
        res.risk ? (function() { var r = res.risk, rc = RC[r.level] || RC.medium; return React.createElement("div", { style: { background: rc.bg, border: "1px solid " + rc.b, borderRadius: 8, padding: 9, marginBottom: 7, fontSize: 10, color: rc.t, lineHeight: 1.4 } }, rc.i + " ", React.createElement("strong", null, r.level.toUpperCase()), React.createElement("span", { style: { float: "right", fontSize: 8, padding: "1px 4px", borderRadius: 3, background: r.insured ? "#D1FAE5" : "#FEE2E2", color: r.insured ? "#065F46" : "#991B1B", fontWeight: 600 } }, r.insured ? "\u2713 Insurable" : "\u26A0"), React.createElement("div", { style: { marginTop: 2 } }, r.safety)); })() : null,

        // Payment
        res.payment ? (function() { var p = res.payment; var co = ({ widespread: "#4A7C59", moderate: "#C5974B", limited: "#B8622E", rare: "#991B1B" })[p.cards] || "#888"; return React.createElement("div", { style: { background: "#fff", border: "1px solid #EDE8E0", borderRadius: 8, padding: 9, marginBottom: 7, fontSize: 10, lineHeight: 1.5 } },
          React.createElement("div", { style: { fontWeight: 700, color: "#2C4A4A", marginBottom: 4 } }, "\u{1F4B3} Payment"),
          React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 4 } },
            React.createElement("span", { style: { fontSize: 8, padding: "1px 4px", borderRadius: 3, background: co + "18", color: co, fontWeight: 600 } }, p.cards),
            p.cash_needed ? React.createElement("span", { style: { fontSize: 8, padding: "1px 4px", borderRadius: 3, background: "#FEF9EC", color: "#92400E", fontWeight: 600 } }, "\u{1F4B5}") : null,
            p.bring_usd ? React.createElement("span", { style: { fontSize: 8, padding: "1px 4px", borderRadius: 3, background: "#EFF6FF", color: "#1E40AF", fontWeight: 600 } }, "USD") : null,
            p.bring_eur ? React.createElement("span", { style: { fontSize: 8, padding: "1px 4px", borderRadius: 3, background: "#EFF6FF", color: "#1E40AF", fontWeight: 600 } }, "EUR") : null
          ),
          React.createElement("div", { style: { fontSize: 10 } }, p.card_note),
          p.cash_note ? React.createElement("div", { style: { marginTop: 2 } }, p.cash_note) : null,
          // Checklist
          React.createElement("div", { style: { marginTop: 7, paddingTop: 7, borderTop: "1px solid #EDE8E0" } },
            React.createElement("div", { style: { fontSize: 9, fontWeight: 600, color: "#2C4A4A", marginBottom: 3 } }, "\u2705 Pre-departure"),
            React.createElement("div", { className: "cr", onClick: function() { setCc(!cc); } },
              React.createElement("div", { style: { width: 13, height: 13, borderRadius: 3, border: cc ? "none" : "2px solid #C5C0B8", background: cc ? "#4A7C59" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 7 } }, cc ? "\u2713" : null),
              React.createElement("span", { style: { fontSize: 10 } }, "Cash ("),
              React.createElement("input", { value: ccur, onChange: function(e) { setCcur(e.target.value); }, onClick: function(e) { e.stopPropagation(); }, placeholder: "?", style: { width: 55, padding: "2px 4px", borderRadius: 3, border: "1px solid #E5DED4", fontSize: 9, outline: "none", fontFamily: "'DM Sans'" } }),
              React.createElement("span", { style: { fontSize: 10 } }, ")")
            ),
            React.createElement("div", { className: "cr", onClick: function() { setVc(!vc); } },
              React.createElement("div", { style: { width: 13, height: 13, borderRadius: 3, border: vc ? "none" : "2px solid #C5C0B8", background: vc ? "#4A7C59" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 7 } }, vc ? "\u2713" : null),
              React.createElement("span", { style: { fontSize: 10 } }, "Physical Visa/MC")
            ),
            React.createElement("div", { className: "cr", onClick: function() { setSc(!sc); } },
              React.createElement("div", { style: { width: 13, height: 13, borderRadius: 3, border: sc ? "none" : "2px solid #C5C0B8", background: sc ? "#4A7C59" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 7 } }, sc ? "\u2713" : null),
              React.createElement("span", { style: { fontSize: 10 } }, "\u{1F4F1} SIM/eSIM")
            )
          ),
          res.sim_card ? React.createElement("div", { style: { marginTop: 5, padding: "5px 7px", background: "#F0F7FF", borderRadius: 5, fontSize: 9, color: "#1E40AF", lineHeight: 1.4 } }, "\u{1F4F1} " + res.sim_card.advice) : null
        ); })() : null,

        res.clothing_advice ? React.createElement("div", { style: { background: "#FEF9EC", border: "1px solid #FCD34D", borderRadius: 7, padding: 7, marginBottom: 7, fontSize: 9, color: "#92400E", lineHeight: 1.4 } }, "\u{1F321}\u{FE0F} " + res.clothing_advice) : null,

        // Tabs
        React.createElement("div", { style: { display: "flex", borderBottom: "1px solid #E5DED4", marginBottom: 8, overflowX: "auto" } },
          React.createElement("button", { onClick: function() { setTab("overview"); }, className: tab === "overview" ? "ta" : "ti", style: { padding: "5px 8px", background: "none", border: "none", cursor: "pointer", fontSize: 10, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 2 } }, "\u{1F4CB} ", React.createElement("span", { style: { fontSize: 7, background: tab === "overview" ? "#2C4A4A" : "#E5DED4", color: tab === "overview" ? "#fff" : "#8B8680", borderRadius: 5, padding: "0 3px", fontWeight: 600 } }, chk.size)),
          eb.map(function(bt) { var p = gBP(bt); return React.createElement("button", { key: bt, onClick: function() { setTab(bt); setAs(null); setEk(null); setAcs(null); }, className: tab === bt ? "ta" : "ti", style: { padding: "5px 8px", background: "none", border: "none", cursor: "pointer", fontSize: 10, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 2 } }, p ? p.i : "", " ", p ? p.l : bt, " ", React.createElement("span", { style: { fontSize: 7, background: tab === bt ? "#2C4A4A" : "#E5DED4", color: tab === bt ? "#fff" : "#8B8680", borderRadius: 5, padding: "0 3px", fontWeight: 600 } }, items.filter(function(i) { return i.bag === bt; }).length)); }),
          res.cultural_tips && res.cultural_tips.length > 0 ? React.createElement("button", { onClick: function() { setTab("culture"); }, className: tab === "culture" ? "ta" : "ti", style: { padding: "5px 8px", background: "none", border: "none", cursor: "pointer", fontSize: 10 } }, "\u{1F30D}") : null
        ),

        // Overview
        tab === "overview" && React.createElement("div", null,
          chkItems.length === 0 ? React.createElement("div", { style: { textAlign: "center", padding: 24, color: "#8B8680", fontSize: 11 } }, "\u{1F4CB} Select items in bag tabs") :
          React.createElement("div", null,
            React.createElement("div", { style: { display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap" } },
              eb.map(function(bt) {
                var ci = chkItems.filter(function(i) { return i.bag === bt; });
                if (!ci.length) return null;
                var w = ci.reduce(function(s, i) { return s + (i.weight_g || 0) * (i.qty || 1); }, 0);
                var lim = (bags.find(function(b) { return b.id === bt; }) || {}).w;
                var over = lim && (w / 1000) > lim;
                var p = gBP(bt);
                return React.createElement("div", { key: bt, style: { flex: 1, minWidth: 90, background: "#fff", borderRadius: 7, padding: "6px 8px", border: over ? "1.5px solid #FCA5A5" : "1px solid #EDE8E0" } },
                  React.createElement("div", { style: { fontSize: 9, fontWeight: 600, color: "#2C4A4A" } }, p ? p.i + " " + p.l : bt),
                  React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: over ? "#991B1B" : "#2C4A4A", fontFamily: "'Cormorant Garamond'" } }, (w / 1000).toFixed(1), React.createElement("span", { style: { fontSize: 8, color: "#8B8680" } }, lim ? "/" + lim + "kg" : "kg"), over ? " \u26A0\uFE0F" : "")
                );
              }),
              React.createElement("div", { style: { flex: 1, minWidth: 90, background: "#2C4A4A", borderRadius: 7, padding: "6px 8px", color: "#fff" } },
                React.createElement("div", { style: { fontSize: 9, opacity: 0.8 } }, "Total"),
                React.createElement("div", { style: { fontSize: 11, fontWeight: 700, fontFamily: "'Cormorant Garamond'" } }, (chkItems.reduce(function(s, i) { return s + (i.weight_g || 0) * (i.qty || 1); }, 0) / 1000).toFixed(1) + " kg")
              )
            ),
            eb.map(function(bt) {
              var ci = chkItems.filter(function(i) { return i.bag === bt; });
              if (!ci.length) return null;
              var p = gBP(bt);
              return React.createElement("div", { key: bt, style: { marginBottom: 10 } },
                React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4, marginBottom: 3, padding: "4px 7px", background: (BC[bt] || "#888") + "10", borderRadius: 5 } },
                  React.createElement("span", { style: { fontSize: 12 } }, p ? p.i : ""),
                  React.createElement("span", { style: { fontSize: 10, fontWeight: 600, color: "#2C4A4A" } }, p ? p.l : bt)
                ),
                ci.map(function(item) {
                  return React.createElement("div", { key: item._i, style: { display: "flex", alignItems: "center", gap: 5, padding: "4px 7px", marginBottom: 2, background: "#F0FDF4", borderRadius: 5, border: "1px solid #86EFAC" } },
                    React.createElement("span", { style: { fontSize: 8, color: "#4A7C59" } }, "\u2713"),
                    React.createElement("span", { style: { flex: 1, fontSize: 10 } }, item.name + (item.qty > 1 ? " x" + item.qty : "")),
                    React.createElement("span", { style: { fontSize: 7, padding: "0 3px", borderRadius: 2, background: (BC[bt] || "#888") + "18", color: BC[bt] || "#888", fontWeight: 600 } }, p ? p.l : bt),
                    React.createElement("span", { style: { fontSize: 8, color: "#8B8680" } }, item.weight_g + "g")
                  );
                })
              );
            })
          )
        ),

        // Per-bag tab
        tab !== "overview" && tab !== "culture" && (function() {
          var bagItems = items.map(function(it, i) { return Object.assign({}, it, { _i: i }); }).filter(function(it) { return it.bag === tab; });
          var hasBuy = bagItems.some(function(i) { return i.buy_at_dest; });
          return React.createElement("div", null,
            hasBuy ? React.createElement("div", { style: { background: "#E0F2FE", border: "1px solid #7DD3FC", borderRadius: 5, padding: "3px 7px", marginBottom: 5, fontSize: 8, color: "#0369A1" } }, "BUY THERE = skip to save weight") : null,
            subs.map(function(sub) {
              var subItems = bagItems.filter(function(it) { return it.subcat === sub.id; });
              return React.createElement("div", { key: sub.id, style: { marginBottom: 8 } },
                React.createElement("div", { style: { fontSize: 10, fontWeight: 600, color: "#2C4A4A", marginBottom: 2 } }, sub.l),
                subItems.length > 0 ? subItems.map(function(item) { return React.createElement(Row, { key: item._i, item: item, idx: item._i }); }) :
                React.createElement("div", { style: { padding: "4px 9px", marginBottom: 2, fontSize: 9, color: "#C5C0B8", fontStyle: "italic" } }, "No items yet"),
                as2 === tab + "-" + sub.id ?
                React.createElement("div", { style: { padding: "4px 6px", background: "#F0F7F7", borderRadius: 4, border: "1px solid #B8D4D4", marginTop: 2, display: "flex", gap: 3, alignItems: "center", flexWrap: "wrap" } },
                  React.createElement("input", { className: "ei", value: ni.name, onChange: function(e) { setNi(Object.assign({}, ni, { name: e.target.value })); }, placeholder: "Item", style: { flex: 1, minWidth: 50, textAlign: "left" }, autoFocus: true }),
                  React.createElement("input", { className: "ei", type: "number", value: ni.wg, onChange: function(e) { setNi(Object.assign({}, ni, { wg: parseInt(e.target.value) || 0 })); }, style: { width: 32 } }),
                  React.createElement("span", { style: { fontSize: 7, color: "#888" } }, "g"),
                  React.createElement("button", { onClick: function() { addI(tab, sub.id); }, disabled: !ni.name.trim(), style: { padding: "2px 6px", borderRadius: 3, border: "none", background: ni.name.trim() ? "#2C4A4A" : "#ccc", color: "#fff", fontSize: 8, cursor: "pointer" } }, "+"),
                  React.createElement("button", { onClick: function() { setAs(null); }, style: { padding: "2px 4px", borderRadius: 3, border: "1px solid #ddd", background: "#fff", color: "#888", fontSize: 8, cursor: "pointer" } }, "x")
                ) :
                React.createElement("button", { onClick: function() { setAs(tab + "-" + sub.id); setEk(null); }, style: { width: "100%", padding: 3, borderRadius: 3, border: "1px dashed #D5D0C8", background: "transparent", color: "#A09A93", cursor: "pointer", fontSize: 8, marginTop: 1 } }, "+ Add")
              );
            }),
            acs === tab ?
            React.createElement("div", { style: { padding: "6px 8px", background: "#F9F7F3", borderRadius: 6, border: "1.5px solid #C5974B", marginTop: 6, display: "flex", gap: 4, alignItems: "center" } },
              React.createElement("input", { className: "ei", value: nsn, onChange: function(e) { setNsn(e.target.value); }, placeholder: "Category name", style: { flex: 1, textAlign: "left" }, autoFocus: true, onKeyDown: function(e) { if (e.key === "Enter") addSub(); } }),
              React.createElement("button", { onClick: addSub, disabled: !nsn.trim(), style: { padding: "2px 8px", borderRadius: 3, border: "none", background: nsn.trim() ? "#2C4A4A" : "#ccc", color: "#fff", fontSize: 8, cursor: "pointer" } }, "Create"),
              React.createElement("button", { onClick: function() { setAcs(null); setNsn(""); }, style: { padding: "2px 5px", borderRadius: 3, border: "1px solid #ddd", background: "#fff", color: "#888", fontSize: 8, cursor: "pointer" } }, "x")
            ) :
            React.createElement("button", { onClick: function() { setAcs(tab); }, style: { width: "100%", padding: 6, borderRadius: 5, border: "1.5px dashed #C5974B", background: "transparent", color: "#C5974B", cursor: "pointer", fontSize: 9, fontWeight: 500, marginTop: 6 } }, "+ New Category")
          );
        })(),

        // Culture tab
        tab === "culture" && res.cultural_tips ? res.cultural_tips.map(function(tip, i) {
          var ic = ({ dress: "\u{1F454}", etiquette: "\u{1F91D}", safety: "\u{1F6E1}\u{FE0F}", practical: "\u{1F4A1}" })[tip.type] || "\u{1F4A1}";
          var co = ({ high: "#A65D57", medium: "#C5974B", low: "#4A7C59" })[tip.importance] || "#888";
          return React.createElement("div", { key: i, style: { display: "flex", gap: 6, padding: "6px 8px", marginBottom: 2, background: "#fff", borderRadius: 6, border: "1px solid #EDE8E0" } },
            React.createElement("span", { style: { fontSize: 11 } }, ic),
            React.createElement("div", { style: { flex: 1, fontSize: 10, lineHeight: 1.4 } }, tip.tip),
            React.createElement("span", { style: { fontSize: 7, padding: "1px 3px", borderRadius: 2, background: co + "18", color: co, fontWeight: 600, textTransform: "uppercase" } }, tip.importance)
          );
        }) : null,

        // Tips
        res.tips && res.tips.length > 0 ? React.createElement("div", { style: { marginTop: 10, background: "#F3EDE4", borderRadius: 7, padding: 8 } },
          React.createElement("div", { style: { fontSize: 9, fontWeight: 600, color: "#2C4A4A", marginBottom: 3 } }, "Tips"),
          res.tips.map(function(t, i) { return React.createElement("div", { key: i, style: { fontSize: 9, color: "#6B6560", lineHeight: 1.4 } }, "\u2022 " + t); })
        ) : null
      )
    )
  );
}
