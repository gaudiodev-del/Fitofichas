import { useState, useEffect, useRef } from "react";

const TIPOS = ["Ácaros","Anélidos","Bacterias","Crustáceos","Fitoplasmas","Hongos y/ó Pseudohongos","Insectos","Especie Vegetal","Miriápodos","Moluscos","Nemátodos","Protista","Vertebrados","Virus ó viroides"];
const IMPACT_CATS = [
  {key:"restricciones_cuarentenarias", label:"Restricciones cuarentenarias"},
  {key:"perdidas_produccion",          label:"Pérdidas de producción"},
  {key:"mercados_afectados",           label:"Mercados exportación afectados"},
  {key:"costo_control",               label:"Costo de control / manejo"},
  {key:"impacto_exportaciones",        label:"Impacto exportaciones ARG"},
];

const P = {
  navy:"#0c3060", navy2:"#0a2550", navy3:"#07193a",
  blue:"#185fa5", blue2:"#1472c4", blueL:"#e6f1fb", blueLL:"#f0f6fd",
  accent:"#1d9e75", accentL:"#e1f5ee",
  gold:"#c8900a", goldL:"#fef3dc",
  red:"#a32d2d", redL:"#fcebeb",
  bg:"#f4f7fc", bgW:"#ffffff",
  border:"#ccdaec", border2:"#b0c6e0",
  txt:"#0d1e30", txt2:"#3a5070", txt3:"#7090b0",
  badge:"#e6f1fb",
};

const impColor = s =>
  s<=2?{bar:"#1d9e75",text:"#0f6e56",label:"Bajo",bg:"#e1f5ee"}:
  s<=4?{bar:"#639922",text:"#3b6d11",label:"Moderado",bg:"#eaf3de"}:
  s<=6?{bar:"#c8900a",text:"#854f0b",label:"Significativo",bg:"#fef3dc"}:
  s<=8?{bar:"#d86020",text:"#993c1d",label:"Alto",bg:"#faece7"}:
       {bar:"#a32d2d",text:"#791f1f",label:"Crítico",bg:"#fcebeb"};

// ── ISO numeric → ISO2 (para TopoJSON world-atlas) ────────────────────────────
const NUM2 = {
  4:"AF",8:"AL",12:"DZ",24:"AO",32:"AR",36:"AU",40:"AT",50:"BD",56:"BE",
  68:"BO",76:"BR",100:"BG",116:"KH",120:"CM",124:"CA",144:"LK",152:"CL",
  156:"CN",170:"CO",178:"CG",180:"CD",188:"CR",191:"HR",192:"CU",208:"DK",
  214:"DO",218:"EC",818:"EG",231:"ET",246:"FI",250:"FR",276:"DE",288:"GH",
  300:"GR",320:"GT",340:"HN",348:"HU",356:"IN",360:"ID",364:"IR",368:"IQ",
  372:"IE",376:"IL",380:"IT",388:"JM",400:"JO",398:"KZ",404:"KE",408:"KP",
  410:"KR",422:"LB",428:"LV",440:"LT",484:"MX",458:"MY",504:"MA",508:"MZ",
  516:"NA",524:"NP",528:"NL",554:"NZ",566:"NG",578:"NO",586:"PK",591:"PA",
  600:"PY",604:"PE",608:"PH",616:"PL",620:"PT",642:"RO",643:"RU",646:"RW",
  682:"SA",686:"SN",703:"SK",710:"ZA",724:"ES",752:"SE",756:"CH",760:"SY",
  764:"TH",788:"TN",792:"TR",800:"UG",804:"UA",826:"GB",840:"US",858:"UY",
  860:"UZ",862:"VE",704:"VN",887:"YE",716:"ZW",894:"ZM",788:"TN",
};

// Centroides (x=lon+180)/360*1000, y=(90-lat)/180*507)
const CTRD = {
  AF:{n:"Afganistán",x:544,y:179},AL:{n:"Albania",x:466,y:164},DZ:{n:"Argelia",x:447,y:191},
  AO:{n:"Angola",x:474,y:286},AR:{n:"Argentina",x:174,y:373,arg:true},AU:{n:"Australia",x:671,y:320},
  AT:{n:"Austria",x:467,y:153},BD:{n:"Bangladesh",x:576,y:212},BE:{n:"Bélgica",x:454,y:144},
  BO:{n:"Bolivia",x:177,y:333},BR:{n:"Brasil",x:223,y:319},BG:{n:"Bulgaria",x:474,y:159},
  KH:{n:"Camboya",x:607,y:233},CM:{n:"Camerún",x:457,y:253},CA:{n:"Canadá",x:196,y:94},
  LK:{n:"Sri Lanka",x:567,y:240},CL:{n:"Chile",x:156,y:362},CN:{n:"China",x:610,y:176},
  CO:{n:"Colombia",x:159,y:275},CG:{n:"Rep. Congo",x:465,y:265},CD:{n:"R.D. Congo",x:478,y:270},
  CR:{n:"Costa Rica",x:151,y:251},HR:{n:"Croacia",x:462,y:156},CU:{n:"Cuba",x:192,y:223},
  DK:{n:"Dinamarca",x:457,y:131},DO:{n:"Rep. Dominicana",x:207,y:231},
  EC:{n:"Ecuador",x:144,y:289},EG:{n:"Egipto",x:487,y:193},ET:{n:"Etiopía",x:500,y:241},
  FI:{n:"Finlandia",x:472,y:106},FR:{n:"Francia",x:449,y:160},DE:{n:"Alemania",x:464,y:144},
  GH:{n:"Ghana",x:437,y:249},GR:{n:"Grecia",x:471,y:173},GT:{n:"Guatemala",x:150,y:237},
  HN:{n:"Honduras",x:157,y:241},HU:{n:"Hungría",x:471,y:151},IN:{n:"India",x:562,y:216},
  ID:{n:"Indonesia",x:622,y:269},IR:{n:"Irán",x:534,y:187},IQ:{n:"Irak",x:517,y:183},
  IE:{n:"Irlanda",x:434,y:130},IL:{n:"Israel",x:501,y:183},IT:{n:"Italia",x:464,y:170},
  JM:{n:"Jamaica",x:194,y:235},JP:{n:"Japón",x:664,y:166},JO:{n:"Jordania",x:503,y:186},
  KZ:{n:"Kazajistán",x:547,y:139},KE:{n:"Kenia",x:504,y:261},KP:{n:"Corea del Norte",x:650,y:163},
  KR:{n:"Corea del Sur",x:654,y:171},LB:{n:"Líbano",x:501,y:176},LV:{n:"Letonia",x:474,y:126},
  LT:{n:"Lituania",x:474,y:131},MG:{n:"Madagascar",x:514,y:290},MY:{n:"Malasia",x:607,y:253},
  MX:{n:"México",x:158,y:213},MA:{n:"Marruecos",x:427,y:186},MZ:{n:"Mozambique",x:500,y:296},
  NA:{n:"Namibia",x:474,y:306},NP:{n:"Nepal",x:565,y:199},NL:{n:"Países Bajos",x:457,y:139},
  NZ:{n:"Nueva Zelanda",x:714,y:354},NG:{n:"Nigeria",x:450,y:243},NO:{n:"Noruega",x:451,y:109},
  PK:{n:"Pakistán",x:550,y:189},PA:{n:"Panamá",x:159,y:255},PY:{n:"Paraguay",x:187,y:344},
  PE:{n:"Perú",x:149,y:312},PH:{n:"Filipinas",x:634,y:229},PL:{n:"Polonia",x:472,y:138},
  PT:{n:"Portugal",x:421,y:170},RO:{n:"Rumania",x:477,y:153},RU:{n:"Rusia",x:562,y:109},
  RW:{n:"Ruanda",x:493,y:264},SA:{n:"Arabia Saudita",x:518,y:210},SN:{n:"Senegal",x:417,y:236},
  SK:{n:"Eslovaquia",x:469,y:145},ZA:{n:"Sudáfrica",x:484,y:320},ES:{n:"España",x:434,y:170},
  SE:{n:"Suecia",x:461,y:112},CH:{n:"Suiza",x:457,y:156},SY:{n:"Siria",x:505,y:176},
  TH:{n:"Tailandia",x:600,y:229},TN:{n:"Túnez",x:455,y:183},TR:{n:"Turquía",x:494,y:163},
  UG:{n:"Uganda",x:496,y:259},UA:{n:"Ucrania",x:485,y:144},GB:{n:"Reino Unido",x:441,y:133},
  US:{n:"Estados Unidos",x:198,y:155},UY:{n:"Uruguay",x:194,y:359},UZ:{n:"Uzbekistán",x:546,y:156},
  VE:{n:"Venezuela",x:177,y:269},VN:{n:"Vietnam",x:610,y:224},YE:{n:"Yemen",x:518,y:229},
  ZW:{n:"Zimbabwe",x:492,y:297},ZM:{n:"Zambia",x:490,y:286},
  CI:{n:"Costa de Marfil",x:429,y:253},TZ:{n:"Tanzania",x:500,y:276},
  BY:{n:"Bielorrusia",x:478,y:136},GE:{n:"Georgia",x:513,y:159},AZ:{n:"Azerbaiyán",x:520,y:163},
};

const MAP_COLORS = {
  presente:      {fill:"#1472c4", stroke:"#083a7a", label:"Presente"},
  cuarentena:    {fill:"#c0282a", stroke:"#7a0a0a", label:"Cuarentena / Interceptada"},
  ausente_riesgo:{fill:"#d08a00", stroke:"#7a4e00", label:"Riesgo de ingreso"},
  erradicada:    {fill:"#6050a0", stroke:"#3a2a70", label:"Erradicada"},
};

// ── Mapa mundial con TopoJSON real ────────────────────────────────────────────
function WorldMap({presencia}) {
  const [paths, setPaths] = useState(null); // null=cargando, []=error, array=ok
  const [tt, setTt] = useState(null);
  const ref = useRef();

  useEffect(() => {
    let cancelled = false;

    const loadScript = src => new Promise((resolve, reject) => {
      if (window.topojson) { resolve(); return; }
      const existing = document.querySelector(`script[data-id="topojson"]`);
      if (existing) { existing.addEventListener("load", resolve); return; }
      const s = document.createElement("script");
      s.src = src;
      s.setAttribute("data-id", "topojson");
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });

    loadScript("https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js")
      .then(() => fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"))
      .then(r => r.json())
      .then(topo => {
        if (cancelled) return;
        const W = 1000, H = 507;
        const proj = ([lon, lat]) => [
          ((lon + 180) / 360) * W,
          ((90 - lat) / 180) * H,
        ];
        const features = window.topojson.feature(topo, topo.objects.countries).features;
        const result = features.map(feat => {
          const iso2 = NUM2[parseInt(feat.id)] || null;
          let d = "";
          const geom = feat.geometry;
          if (!geom) return { iso2, d };
          const polys = geom.type === "Polygon" ? [geom.coordinates]
            : geom.type === "MultiPolygon" ? geom.coordinates : [];
          polys.forEach(poly => {
            poly.forEach(ring => {
              if (!ring.length) return;
              const [x0, y0] = proj(ring[0]);
              d += `M${x0.toFixed(1)},${y0.toFixed(1)}`;
              for (let i = 1; i < ring.length; i++) {
                const [x, y] = proj(ring[i]);
                d += `L${x.toFixed(1)},${y.toFixed(1)}`;
              }
              d += "Z";
            });
          });
          return { iso2, d };
        });
        setPaths(result);
      })
      .catch(() => setPaths([]));

    return () => { cancelled = true; };
  }, []);

  const pMap = Object.fromEntries((presencia || []).map(p => [p.iso, p]));
  const counts = { presente: 0, cuarentena: 0, ausente_riesgo: 0, erradicada: 0 };
  (presencia || []).forEach(p => { if (counts[p.estado] !== undefined) counts[p.estado]++; });

  return (
    <div ref={ref} style={{ background: "#d0e4f0", border: `1px solid ${P.border}`, borderRadius: 8, overflow: "hidden", userSelect: "none", position: "relative" }}>
      <svg viewBox="0 0 1000 507" style={{ width: "100%", display: "block" }}>
        {/* Océano */}
        <rect width={1000} height={507} fill="#b8d0e8" />

        {paths === null && (
          <text x={500} y={260} textAnchor="middle" fill="#3a6080" fontSize={13} fontFamily="monospace">Cargando mapa…</text>
        )}

        {/* Países coloreados */}
        {paths && paths.map((c, i) => {
          const pres = pMap[c.iso2];
          const fill = pres ? (MAP_COLORS[pres.estado]?.fill || "#e0e8d0") : "#dde8cc";
          const stroke = pres ? (MAP_COLORS[pres.estado]?.stroke || "#b8c8a0") : "#c0ceb0";
          return c.d ? (
            <path key={i} d={c.d}
              fill={fill} stroke={stroke} strokeWidth={pres ? 0.6 : 0.4}
              opacity={pres ? 0.88 : 0.75}
              style={{ cursor: pres ? "pointer" : "default" }}
              onMouseMove={e => {
                if (!pres || !ref.current) return;
                const r = ref.current.getBoundingClientRect();
                setTt({ x: e.clientX - r.left, y: e.clientY - r.top, name: pres.nombre || c.iso2, st: pres.estado, col: MAP_COLORS[pres.estado]?.fill });
              }}
              onMouseLeave={() => setTt(null)}
            />
          ) : null;
        })}

        {/* Puntos encima de los países con dato */}
        {paths && Object.entries(pMap).map(([iso2, pres]) => {
          const c = CTRD[iso2];
          if (!c) return null;
          const col = MAP_COLORS[pres.estado] || MAP_COLORS.presente;
          const isARG = !!c.arg;
          return (
            <g key={iso2} style={{ cursor: "pointer" }}
              onMouseMove={e => {
                if (!ref.current) return;
                const r = ref.current.getBoundingClientRect();
                setTt({ x: e.clientX - r.left, y: e.clientY - r.top, name: pres.nombre || c.n, st: pres.estado, col: col.fill });
              }}
              onMouseLeave={() => setTt(null)}>
              {isARG && <circle cx={c.x} cy={c.y} r={14} fill="none" stroke="#fff" strokeWidth={2.5} opacity={0.8} />}
              {isARG && <circle cx={c.x} cy={c.y} r={14} fill="none" stroke={col.fill} strokeWidth={2} opacity={0.9} />}
              <circle cx={c.x} cy={c.y} r={isARG ? 8 : 5}
                fill={col.fill} stroke="#fff" strokeWidth={isARG ? 2 : 1.5} />
              {isARG && (
                <text x={c.x} y={c.y + 24} textAnchor="middle"
                  fill={P.navy} fontSize={8} fontFamily="monospace" fontWeight="bold">ARG</text>
              )}
            </g>
          );
        })}

        {/* Leyenda */}
        <rect x={6} y={410} width={194} height={92} rx={4} fill="rgba(255,255,255,.94)" stroke="#a8c4d8" strokeWidth={0.8} />
        <text x={14} y={424} fill={P.navy} fontSize={7.5} fontFamily="monospace" fontWeight="bold">LEYENDA</text>
        {Object.entries(MAP_COLORS).map(([k, { fill, label }], i) => (
          <g key={k} transform={`translate(11,${430 + i * 14})`}>
            <circle cx={5} cy={5} r={5} fill={fill} stroke="#fff" strokeWidth={1} />
            <text x={14} y={9.5} fill={P.navy} fontSize={8} fontFamily="monospace">{label}</text>
          </g>
        ))}
      </svg>

      {tt && (
        <div style={{
          position: "absolute",
          left: Math.min(tt.x + 12, (ref.current?.offsetWidth || 700) - 200),
          top: Math.max(tt.y - 42, 4),
          background: "#fff", border: `2px solid ${tt.col}`, borderRadius: 6,
          padding: "5px 11px", fontFamily: "monospace", fontSize: "0.68rem", color: P.navy,
          pointerEvents: "none", whiteSpace: "nowrap",
          boxShadow: "0 2px 10px rgba(7,25,58,.2)", zIndex: 20,
        }}>
          <strong>{tt.name}</strong><br />
          <span style={{ color: tt.col }}>{MAP_COLORS[tt.st]?.label}</span>
        </div>
      )}

      {/* Contadores */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", padding: "7px 12px", background: P.blueLL, borderTop: `1px solid ${P.border}` }}>
        {Object.entries(MAP_COLORS).filter(([k]) => counts[k] > 0).map(([k, { fill, label }]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "monospace", fontSize: "0.6rem", color: P.txt2 }}>
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: fill, flexShrink: 0 }} />
            <span>{label}: <strong style={{ color: fill }}>{counts[k]}</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Gráfico de impacto ────────────────────────────────────────────────────────
function ImpactChart({ impacto }) {
  if (!impacto) return null;
  const overall = Math.round((IMPACT_CATS.reduce((s, c) => s + (impacto[c.key] || 0), 0) / IMPACT_CATS.length) * 10) / 10;
  const oc = impColor(overall);
  return (
    <div style={{ background: P.bg, border: `1px solid ${P.border}`, borderRadius: 8, padding: "14px 16px" }}>
      {IMPACT_CATS.map(({ key, label }) => {
        const s = impacto[key] || 0; const c = impColor(s);
        return (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
            <div style={{ fontFamily: "monospace", fontSize: "0.59rem", color: P.txt2, width: 172, flexShrink: 0, textTransform: "uppercase", letterSpacing: ".03em", lineHeight: 1.3 }}>{label}</div>
            <div style={{ flex: 1, height: 14, background: "#dce8f5", borderRadius: 3, overflow: "hidden", position: "relative" }}>
              <div style={{ width: `${s * 10}%`, height: "100%", background: c.bar, borderRadius: 3, transition: "width .6s ease" }}>
                <span style={{ position: "absolute", right: 5, top: "50%", transform: "translateY(-50%)", fontFamily: "monospace", fontSize: "0.57rem", color: "rgba(255,255,255,.8)", fontWeight: 500 }}>{s}/10</span>
              </div>
            </div>
            <div style={{ fontFamily: "monospace", fontSize: "0.65rem", color: c.text, width: 22, textAlign: "right", fontWeight: 600 }}>{s}</div>
          </div>
        );
      })}
      <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 6, background: oc.bg, border: `1px solid ${oc.bar}50`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontFamily: "monospace", fontSize: "0.7rem", color: oc.text, fontWeight: 700 }}>Impacto global: {overall}/10</div>
        <div style={{ background: oc.bar, color: "#fff", fontSize: "0.65rem", fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>{oc.label}</div>
        {impacto.descripcion && <div style={{ fontSize: "0.72rem", color: P.txt2, flex: 1, lineHeight: 1.4 }}>{impacto.descripcion}</div>}
      </div>
    </div>
  );
}

// ── PDF ───────────────────────────────────────────────────────────────────────
function exportPDF(f) {
  const date = new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const taxa = f.taxonomia || {};
  const trows = [["Reino", taxa.reino], ["Filo/División", taxa.filo], ["Clase", taxa.clase], ["Orden", taxa.orden], ["Familia", taxa.familia], ["Género", taxa.genero], ["Especie", taxa.especie]]
    .filter(r => r[1]).map(([k, v]) => `<tr><td style="color:#185fa5;font-family:monospace;font-size:7.5pt;text-transform:uppercase;padding:3px 7px;border-bottom:1px solid #ccdaec;width:28mm;background:#f0f6fd">${k}</td><td style="font-size:9pt;padding:3px 7px;border-bottom:1px solid #ccdaec${["Género", "Especie"].includes(k) ? ";font-style:italic" : ""}">${v}</td></tr>`).join("");
  const srcs = (f.fuentes || []).map((s, i) => `<div style="display:flex;gap:7px;margin-bottom:5px;font-size:8pt;color:#3a5070;line-height:1.4"><span style="color:#185fa5;font-family:monospace;flex-shrink:0;font-weight:700">[${i + 1}]</span><span>${s}</span></div>`).join("");
  const sec = (lbl, txt) => txt ? `<div style="margin-bottom:12px"><div style="font-family:monospace;font-size:6.5pt;color:#185fa5;text-transform:uppercase;padding:3px 8px;background:#e6f1fb;border-left:3px solid #185fa5;margin-bottom:6px">${lbl}</div><div style="font-size:9pt;color:#0d1e30;line-height:1.6;padding:0 2px">${txt}</div></div>` : "";
  const imp = f.impacto_comercial;
  const pres = f.presencia_mundial || [];
  const pg = { presente: [], cuarentena: [], ausente_riesgo: [], erradicada: [] };
  pres.forEach(p => { if (pg[p.estado]) pg[p.estado].push(p.nombre || p.iso); });
  const pcol = { presente: "#1472c4", cuarentena: "#a32d2d", ausente_riesgo: "#c8900a", erradicada: "#6050a0" };
  const plbl = { presente: "Presente", cuarentena: "Cuarentena", ausente_riesgo: "Riesgo de ingreso", erradicada: "Erradicada" };
  const presSec = Object.entries(pg).filter(([, v]) => v.length > 0).map(([k, names]) => `<div style="margin-bottom:5px;display:flex;gap:7px"><div style="width:9px;height:9px;border-radius:50%;background:${pcol[k]};flex-shrink:0;margin-top:2px"></div><div><strong style="font-size:7.5pt;color:${pcol[k]}">${plbl[k]}:</strong> <span style="font-size:8.5pt">${names.slice(0, 18).join(", ")}${names.length > 18 ? " (+más)" : ""}</span></div></div>`).join("");
  const impSec = imp ? IMPACT_CATS.map(({ key, label }) => { const s = imp[key] || 0; const bar = s <= 2 ? "#1d9e75" : s <= 4 ? "#639922" : s <= 6 ? "#c8900a" : s <= 8 ? "#d86020" : "#a32d2d"; return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px"><div style="font-family:monospace;font-size:6.5pt;color:#3a5070;width:125px;flex-shrink:0">${label}</div><div style="flex:1;height:10px;background:#dce8f5;border-radius:2px;overflow:hidden"><div style="width:${s * 10}%;height:100%;background:${bar}"></div></div><div style="font-family:monospace;font-size:7pt;color:${bar};width:18px;text-align:right;font-weight:700">${s}</div></div>`; }).join("") : "";
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>FitoFicha</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',sans-serif;background:#fff}.page{max-width:185mm;margin:0 auto;padding:8mm 12mm}.hdr{background:#0c3060;color:#fff;padding:7mm 12mm;margin:-8mm -12mm 9mm;border-bottom:3px solid #1472c4}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><div class="page"><div class="hdr"><div style="font-family:monospace;font-size:6pt;color:#aac4e0;text-transform:uppercase;letter-spacing:.12em;margin-bottom:3px">Ficha Fitosanitaria · SENASA · FitoFichas</div><div style="font-family:Georgia,serif;font-size:18pt;font-style:italic;color:#fff;margin-bottom:2px">${f.nombre_cientifico || ""}</div>${f.nombre_vulgar ? `<div style="font-size:8.5pt;color:#aac4e0">▸ ${f.nombre_vulgar}</div>` : ""}${f.tipoplaga ? `<div style="display:inline-block;margin-top:4px;font-family:monospace;font-size:6pt;background:rgba(107,168,50,.18);color:#8ecf3f;border:1px solid rgba(107,168,50,.3);padding:2px 7px;border-radius:2px;text-transform:uppercase">${f.tipoplaga}</div>` : ""}</div>${f.sinonimias ? `<div style="margin-bottom:8px;padding:5px 8px;background:#f0f6fd;border-left:3px solid #185fa5"><span style="font-family:monospace;font-size:6pt;color:#185fa5;text-transform:uppercase;font-weight:700">Sinonimias: </span><span style="font-size:8.5pt;font-style:italic;color:#3a5070">${f.sinonimias}</span></div>` : ""}${trows ? `<div style="margin-bottom:12px"><div style="font-family:monospace;font-size:6.5pt;color:#185fa5;text-transform:uppercase;padding:3px 8px;background:#e6f1fb;border-left:3px solid #185fa5;margin-bottom:0">Árbol Taxonómico</div><table style="border-collapse:collapse;width:100%;border:1px solid #ccdaec"><tbody>${trows}</tbody></table></div>` : ""}${sec("Descripción Biológica", f.descripcion_biologica)}${sec("Signos, Síntomas y Daños", f.signos_sintomas)}${sec("Condiciones Predisponentes", f.condiciones_predisponentes)}${presSec ? `<div style="margin-bottom:12px"><div style="font-family:monospace;font-size:6.5pt;color:#185fa5;text-transform:uppercase;padding:3px 8px;background:#e6f1fb;border-left:3px solid #185fa5;margin-bottom:7px">Distribución Mundial · ${pg.presente.length} países con presencia confirmada</div>${presSec}</div>` : ""}${impSec ? `<div style="margin-bottom:12px"><div style="font-family:monospace;font-size:6.5pt;color:#185fa5;text-transform:uppercase;padding:3px 8px;background:#e6f1fb;border-left:3px solid #185fa5;margin-bottom:7px">Impacto Comercial para Argentina (0–10)</div>${impSec}${imp.descripcion ? `<div style="font-size:8pt;color:#3a5070;margin-top:5px;padding:4px 7px;background:#f0f6fd;border-radius:3px">${imp.descripcion}</div>` : ""}</div>` : ""}${srcs ? `<div style="margin-bottom:12px"><div style="font-family:monospace;font-size:6.5pt;color:#185fa5;text-transform:uppercase;padding:3px 8px;background:#e6f1fb;border-left:3px solid #185fa5;margin-bottom:6px">Fuentes de Información</div>${srcs}</div>` : ""}<div style="margin-top:10mm;border-top:1px solid #ccdaec;padding-top:4px;display:flex;justify-content:space-between;font-family:monospace;font-size:5.5pt;color:#7090b0"><span>FitoFichas · SENASA Argentina</span><span>Generado: ${date}</span></div></div><script>window.onload=()=>window.print()<\/script></body></html>`;
  const w = window.open("", "_blank"); if (w) { w.document.write(html); w.document.close(); }
}

function parseJSON(txt) {
  const clean = txt.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No se encontró un objeto JSON válido.");
  const obj = JSON.parse(match[0]);
  if (!obj.nombre_cientifico) throw new Error("Falta el campo 'nombre_cientifico'.");
  return obj;
}

// ═══ APP ══════════════════════════════════════════════════════════════════════
export default function App() {
  const [fichas, setFichas] = useState([]);
  const [tab, setTab] = useState("fichas");
  const [jsonTxt, setJsonTxt] = useState("");
  const [jsonErr, setJsonErr] = useState("");
  const [ok, setOk] = useState(false);
  const [view, setView] = useState(null);
  const [edit, setEdit] = useState(null);
  const [del, setDel] = useState(null);

  useEffect(() => { try { const s = localStorage.getItem("ffd"); if (s) setFichas(JSON.parse(s)); } catch {} }, []);
  const persist = arr => { setFichas(arr); try { localStorage.setItem("ffd", JSON.stringify(arr)); } catch {} };

  const loadJSON = () => {
    setJsonErr(""); setOk(false);
    try {
      const ficha = parseJSON(jsonTxt);
      ficha.id = Date.now().toString();
      ficha.createdAt = new Date().toISOString();
      persist([ficha, ...fichas.filter(f => f.nombre_cientifico !== ficha.nombre_cientifico)]);
      setOk(true);
      setTimeout(() => { setJsonTxt(""); setOk(false); setTab("fichas"); setView(ficha.id); }, 800);
    } catch (e) { setJsonErr(e.message); }
  };

  const get = id => fichas.find(f => f.id === id);
  const doDelete = id => { persist(fichas.filter(f => f.id !== id)); setDel(null); setView(null); };
  const doSave = () => {
    const idx = fichas.findIndex(f => f.id === edit.id); if (idx === -1) return;
    const arr = [...fichas]; arr[idx] = edit; persist(arr); setView(edit.id); setEdit(null);
  };
  const upd = (k, v) => setEdit(p => ({ ...p, [k]: v }));
  const updT = (k, v) => setEdit(p => ({ ...p, taxonomia: { ...p.taxonomia, [k]: v } }));
  const types = new Set(fichas.map(f => f.tipoplaga).filter(Boolean));

  // Estilos
  const BTN = { fontFamily: "'Inter','Segoe UI',sans-serif", fontSize: "0.74rem", fontWeight: 600, padding: "8px 16px", borderRadius: 5, cursor: "pointer", border: "1px solid", display: "inline-flex", alignItems: "center", gap: 5, transition: "all .12s" };
  const BP = { ...BTN, background: P.blue, borderColor: P.blue, color: "#fff" };
  const BS = { ...BTN, background: "transparent", borderColor: P.border2, color: P.txt2 };
  const BW = { ...BTN, background: P.goldL, borderColor: "#e0b870", color: P.gold };
  const BD = { ...BTN, background: P.redL, borderColor: "#e0a0a0", color: P.red, marginLeft: "auto" };
  const BSM = { ...BTN, fontSize: "0.66rem", fontWeight: 500, padding: "4px 10px", borderRadius: 4 };
  const OV = { position: "fixed", inset: 0, background: "rgba(7,25,58,.75)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(3px)" };
  const MOD = { background: P.bgW, border: `1px solid ${P.border}`, borderRadius: 10, width: "100%", maxWidth: 820, maxHeight: "93vh", overflowY: "auto", boxShadow: "0 8px 40px rgba(7,25,58,.25)" };
  const MHDR = { position: "sticky", top: 0, background: P.navy, padding: "15px 20px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, zIndex: 10, borderRadius: "10px 10px 0 0" };
  const MACT = { padding: "14px 20px 20px", display: "flex", gap: 8, flexWrap: "wrap", borderTop: `1px solid ${P.border}`, background: P.bg };
  const IN = { width: "100%", background: P.bgW, border: `1px solid ${P.border2}`, borderRadius: 5, padding: "8px 11px", color: P.txt, fontFamily: "inherit", fontSize: "0.78rem", outline: "none" };
  const SL = lbl => <div style={{ fontFamily: "monospace", fontSize: "0.6rem", color: P.blue, textTransform: "uppercase", letterSpacing: ".09em", display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>{lbl}<div style={{ flex: 1, height: 1, background: P.border }} /></div>;
  const FV = ({ children }) => <div style={{ background: P.bgW, border: `1px solid ${P.border}`, borderRadius: 6, padding: "10px 13px", fontSize: "0.8rem", color: P.txt2, lineHeight: 1.6 }}>{children}</div>;
  const FLD = ({ label, children }) => <div style={{ marginBottom: 16 }}>{SL(label)}<FV>{children}</FV></div>;

  const tipoBg = t => {
    if (!t) return { bg: P.badge, color: P.blue };
    if (t.includes("Hongo") || t.includes("Pseudo")) return { bg: "#e1f5ee", color: "#0f6e56" };
    if (t.includes("Insecto")) return { bg: "#faeeda", color: "#854f0b" };
    if (t.includes("Bacteria")) return { bg: "#fcebeb", color: P.red };
    if (t.includes("Virus")) return { bg: "#fbeaf0", color: "#993556" };
    if (t.includes("Nemát")) return { bg: "#eeedfe", color: "#534ab7" };
    if (t.includes("Ácaro")) return { bg: "#faeeda", color: "#633806" };
    return { bg: P.badge, color: P.blue };
  };

  const CloseBtn = ({ onClick }) => (
    <button onClick={onClick} style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", width: 30, height: 30, borderRadius: 6, cursor: "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
  );

  const ViewModal = () => {
    const f = get(view); if (!f) return null;
    const taxa = f.taxonomia || {};
    const tb = tipoBg(f.tipoplaga);
    const presCount = (f.presencia_mundial || []).filter(p => p.estado === "presente").length;
    return (
      <div style={OV} onClick={e => e.target === e.currentTarget && setView(null)}>
        <div style={MOD}>
          <div style={MHDR}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 28, height: 28, background: "rgba(255,255,255,.15)", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🌿</div>
                <span style={{ fontFamily: "monospace", fontSize: "0.58rem", color: "#aac4e0", letterSpacing: ".1em", textTransform: "uppercase" }}>Ficha Fitosanitaria · SENASA · FitoFichas</span>
              </div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: "1.5rem", fontStyle: "italic", color: "#fff", lineHeight: 1.2, marginBottom: 4 }}>{f.nombre_cientifico}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {f.nombre_vulgar && <span style={{ fontSize: "0.78rem", color: "#aac4e0" }}>▸ {f.nombre_vulgar}</span>}
                {f.tipoplaga && <span style={{ background: tb.bg, color: tb.color, fontFamily: "monospace", fontSize: "0.6rem", padding: "2px 9px", borderRadius: 20, fontWeight: 700, textTransform: "uppercase" }}>{f.tipoplaga}</span>}
              </div>
            </div>
            <CloseBtn onClick={() => setView(null)} />
          </div>
          <div style={{ background: P.navy2, padding: "8px 20px", display: "flex", gap: 20, borderBottom: `1px solid ${P.blue}40` }}>
            {[["Orden", taxa.orden || "—"], ["Familia", taxa.familia || "—"], ["Presencia", presCount ? presCount + " países" : "—"], ["Fuentes", (f.fuentes?.length || 0) + " ref."]].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontFamily: "monospace", fontSize: "0.55rem", color: "#7090b0", textTransform: "uppercase", letterSpacing: ".08em" }}>{k}</div>
                <div style={{ fontSize: "0.78rem", color: "#aac4e0", fontStyle: k === "Familia" ? "italic" : "normal" }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: "18px 20px", background: P.bg }}>
            {f.sinonimias && <FLD label="Sinonimias"><span style={{ fontFamily: "monospace", fontSize: "0.74rem", fontStyle: "italic" }}>{f.sinonimias}</span></FLD>}
            {Object.values(taxa).some(Boolean) && (
              <div style={{ marginBottom: 16 }}>{SL("Árbol Taxonómico")}
                <FV>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "4px 16px" }}>
                    {[["Reino", taxa.reino], ["Filo / División", taxa.filo], ["Clase", taxa.clase], ["Orden", taxa.orden], ["Familia", taxa.familia], ["Género", taxa.genero], ["Especie", taxa.especie]].filter(([, v]) => v).map(([k, v]) => (
                      <div key={k} style={{ display: "flex", gap: 8, alignItems: "baseline", padding: "3px 0", borderBottom: `1px solid ${P.border}` }}>
                        <span style={{ fontFamily: "monospace", fontSize: "0.58rem", color: P.blue, textTransform: "uppercase", width: 72, flexShrink: 0 }}>{k}</span>
                        <span style={{ fontSize: "0.8rem", color: ["Género", "Especie"].includes(k) ? P.navy : P.txt2, fontStyle: ["Género", "Especie"].includes(k) ? "italic" : "normal", fontWeight: ["Género", "Especie"].includes(k) ? 600 : 400 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </FV>
              </div>
            )}
            {f.descripcion_biologica && <FLD label="Descripción Biológica">{f.descripcion_biologica}</FLD>}
            {f.signos_sintomas && <FLD label="Signos, Síntomas y Daños">{f.signos_sintomas}</FLD>}
            {f.condiciones_predisponentes && <FLD label="Condiciones Predisponentes">{f.condiciones_predisponentes}</FLD>}
            {f.presencia_mundial?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                {SL(`Distribución Mundial · ${presCount} países con presencia confirmada`)}
                <WorldMap presencia={f.presencia_mundial} />
              </div>
            )}
            {f.impacto_comercial && <div style={{ marginBottom: 16 }}>{SL("Impacto Comercial para Argentina")}<ImpactChart impacto={f.impacto_comercial} /></div>}
            {f.fuentes?.length > 0 && (
              <FLD label="Fuentes de Información">
                {f.fuentes.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: "0.76rem", color: P.txt2, marginBottom: 5, lineHeight: 1.4, padding: "4px 0", borderBottom: `1px solid ${P.border}` }}>
                    <span style={{ fontFamily: "monospace", color: P.blue, fontSize: "0.66rem", flexShrink: 0, fontWeight: 700 }}>[{i + 1}]</span>
                    <span>{s}</span>
                  </div>
                ))}
              </FLD>
            )}
          </div>
          <div style={MACT}>
            <button style={BP} onClick={() => exportPDF(f)}>⬇ Exportar PDF</button>
            <button style={BW} onClick={() => { setEdit({ ...f, taxonomia: { ...taxa } }); setView(null); }}>✏️ Editar ficha</button>
            <button style={BD} onClick={() => setDel(f.id)}>🗑 Eliminar</button>
          </div>
        </div>
      </div>
    );
  };

  const EditModal = () => {
    if (!edit) return null;
    const taxa = edit.taxonomia || {};
    const TA = { ...IN, resize: "vertical" };
    const CC = ({ k, max }) => { const l = (edit[k] || "").length; return <div style={{ fontFamily: "monospace", fontSize: "0.58rem", textAlign: "right", marginTop: 2, color: l > max ? P.red : l > max * .85 ? P.gold : P.txt3 }}>{l}/{max}</div>; };
    return (
      <div style={OV} onClick={e => e.target === e.currentTarget && (setView(edit.id), setEdit(null))}>
        <div style={MOD}>
          <div style={MHDR}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "monospace", fontSize: "0.58rem", color: "#aac4e0", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 4 }}>Editar Ficha</div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: "1.3rem", fontStyle: "italic", color: "#fff" }}>{edit.nombre_cientifico}</div>
            </div>
            <CloseBtn onClick={() => { setView(edit.id); setEdit(null); }} />
          </div>
          <div style={{ padding: "18px 20px", background: P.bg }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>{SL("Nombre Científico")}<input style={IN} value={edit.nombre_cientifico || ""} onChange={e => upd("nombre_cientifico", e.target.value)} /></div>
              <div>{SL("Tipo de Plaga")}<select style={{ ...IN, cursor: "pointer" }} value={edit.tipoplaga || ""} onChange={e => upd("tipoplaga", e.target.value)}><option value="">— Seleccionar —</option>{TIPOS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>{SL("Nombre Vulgar")}<input style={IN} value={edit.nombre_vulgar || ""} onChange={e => upd("nombre_vulgar", e.target.value)} /></div>
              <div>{SL("Sinonimias")}<input style={IN} value={edit.sinonimias || ""} onChange={e => upd("sinonimias", e.target.value)} /></div>
            </div>
            <div style={{ marginBottom: 12 }}>{SL("Árbol Taxonómico")}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, background: P.bgW, border: `1px solid ${P.border}`, borderRadius: 6, padding: "10px 12px" }}>
                {["reino", "filo", "clase", "orden", "familia", "genero", "especie"].map(r => (
                  <div key={r}>
                    <div style={{ fontFamily: "monospace", fontSize: "0.55rem", color: P.blue, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 3 }}>{r.charAt(0).toUpperCase() + r.slice(1)}</div>
                    <input style={IN} value={taxa[r] || ""} onChange={e => updT(r, e.target.value)} placeholder={r} />
                  </div>
                ))}
              </div>
            </div>
            {[["descripcion_biologica", "Descripción Biológica", 1000, 5], ["signos_sintomas", "Signos, Síntomas y Daños", 500, 3], ["condiciones_predisponentes", "Condiciones Predisponentes", 500, 3]].map(([k, lbl, max, rows]) => (
              <div key={k} style={{ marginBottom: 12 }}>
                {SL(`${lbl} (máx ${max})`)}<textarea style={TA} rows={rows} value={edit[k] || ""} onChange={e => upd(k, e.target.value.slice(0, max))} /><CC k={k} max={max} />
              </div>
            ))}
            <div style={{ marginBottom: 12 }}>{SL("Impacto Comercial (0–10)")}
              <div style={{ background: P.bgW, border: `1px solid ${P.border}`, borderRadius: 6, padding: "12px 14px" }}>
                {IMPACT_CATS.map(({ key, label }) => (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ fontFamily: "monospace", fontSize: "0.59rem", color: P.txt2, width: 160, flexShrink: 0 }}>{label}</div>
                    <input type="range" min={0} max={10} value={(edit.impacto_comercial || {})[key] || 0} onChange={e => upd("impacto_comercial", { ...edit.impacto_comercial, [key]: +e.target.value })} style={{ flex: 1, accentColor: P.blue }} />
                    <span style={{ fontFamily: "monospace", fontSize: "0.68rem", color: P.blue, width: 20, fontWeight: 700 }}>{(edit.impacto_comercial || {})[key] || 0}</span>
                  </div>
                ))}
                <div style={{ marginTop: 8 }}>{SL("Descripción del impacto")}<textarea style={TA} rows={2} value={(edit.impacto_comercial || {}).descripcion || ""} onChange={e => upd("impacto_comercial", { ...edit.impacto_comercial, descripcion: e.target.value.slice(0, 250) })} /></div>
              </div>
            </div>
            <div>{SL("Fuentes (una por línea)")}<textarea style={TA} rows={4} value={(edit.fuentes || []).join("\n")} onChange={e => upd("fuentes", e.target.value.split("\n"))} /></div>
          </div>
          <div style={MACT}><button style={BP} onClick={doSave}>💾 Guardar cambios</button><button style={BS} onClick={() => { setView(edit.id); setEdit(null); }}>Cancelar</button></div>
        </div>
      </div>
    );
  };

  const DelDialog = () => {
    const f = get(del); if (!f) return null;
    return (
      <div style={{ ...OV, zIndex: 200, background: "rgba(7,25,58,.88)" }}>
        <div style={{ background: P.bgW, border: `1px solid ${P.border}`, borderRadius: 10, padding: 28, maxWidth: 360, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: 10 }}>⚠️</div>
          <div style={{ fontFamily: "Georgia,serif", fontSize: "1.1rem", color: P.navy, marginBottom: 6 }}>Eliminar ficha</div>
          <div style={{ fontSize: "0.82rem", color: P.txt2, marginBottom: 20, lineHeight: 1.5 }}>¿Eliminar <em style={{ color: P.navy }}>{f.nombre_cientifico}</em>? No se puede deshacer.</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button style={BS} onClick={() => setDel(null)}>Cancelar</button>
            <button style={{ ...BTN, background: P.red, borderColor: P.red, color: "#fff" }} onClick={() => doDelete(del)}>Eliminar</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: P.bg, color: P.txt, fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');*{box-sizing:border-box;margin:0;padding:0}@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* HEADER */}
      <div style={{ background: P.navy3, borderBottom: `3px solid ${P.blue2}` }}>
        <div style={{ background: P.navy, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, background: "rgba(255,255,255,.12)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: "1px solid rgba(255,255,255,.15)" }}>🌿</div>
            <div>
              <div style={{ fontFamily: "monospace", fontSize: "0.55rem", color: "#7090b0", textTransform: "uppercase", letterSpacing: ".1em" }}>República Argentina · SENASA</div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: "1.3rem", color: "#fff" }}>FitoFichas</div>
              <div style={{ fontFamily: "monospace", fontSize: "0.54rem", color: "#aac4e0", letterSpacing: ".06em" }}>Sistema Nacional de Fichas Fitosanitarias</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {[["Fichas", fichas.length], ["Tipos", types.size]].map(([l, n]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "monospace", fontSize: "1.3rem", color: "#fff", fontWeight: 600, display: "block" }}>{n}</div>
                <div style={{ fontSize: "0.58rem", color: "#7090b0", textTransform: "uppercase", letterSpacing: ".07em" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: P.navy2, display: "flex", paddingLeft: 24 }}>
          {[["fichas", "📋 Mis Fichas"], ["nueva", "➕ Nueva Ficha"]].map(([key, lbl]) => (
            <button key={key} onClick={() => setTab(key)} style={{ fontFamily: "inherit", fontSize: "0.75rem", fontWeight: 600, padding: "10px 18px", border: "none", borderBottom: `3px solid ${tab === key ? "#fff" : "transparent"}`, background: "transparent", color: tab === key ? "#fff" : "#7090b0", cursor: "pointer", transition: "all .12s" }}>{lbl}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "24px 20px" }}>

        {tab === "nueva" && (
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ background: P.bgW, border: `1px solid ${P.border}`, borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 12px rgba(7,25,58,.08)" }}>
              <div style={{ background: P.blueL, borderBottom: `1px solid ${P.border}`, padding: "12px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, background: P.blue, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15 }}>📥</div>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: P.navy }}>Importar ficha desde Claude</div>
                  <div style={{ fontSize: "0.72rem", color: P.txt2 }}>Pegue el JSON generado por Claude</div>
                </div>
              </div>
              <div style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
                  <div style={{ width: 28, height: 28, background: P.navy, color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>1</div>
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 600, color: P.navy, marginBottom: 4 }}>Solicitar la ficha en el chat</div>
                    <div style={{ background: P.bg, border: `1px solid ${P.border}`, borderRadius: 6, padding: "10px 14px" }}>
                      <div style={{ fontFamily: "monospace", fontSize: "0.7rem", color: P.txt3, marginBottom: 3, textTransform: "uppercase", letterSpacing: ".07em" }}>Ejemplo</div>
                      <div style={{ fontFamily: "monospace", fontSize: "0.88rem", color: P.navy }}>ficha <em style={{ color: P.blue }}>Phytophthora infestans</em></div>
                    </div>
                  </div>
                </div>
                <div style={{ borderTop: `1px solid ${P.border}`, marginBottom: 18 }} />
                <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 28, height: 28, background: P.navy, color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>2</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 600, color: P.navy, marginBottom: 6 }}>Pegar la respuesta JSON de Claude</div>
                    <textarea value={jsonTxt} onChange={e => { setJsonTxt(e.target.value); setJsonErr(""); setOk(false); }}
                      placeholder={"Pegue aquí el JSON de Claude...\n\n```json\n{\"nombre_cientifico\": \"...\", ...}\n```"}
                      style={{ width: "100%", background: P.bg, border: `1.5px solid ${jsonErr ? P.red : ok ? "#1d9e75" : P.border2}`, borderRadius: 6, padding: "10px 13px", color: P.txt, fontFamily: "monospace", fontSize: "0.74rem", outline: "none", resize: "vertical", height: 180, lineHeight: 1.5 }} />
                    {jsonErr && <div style={{ color: P.red, fontFamily: "monospace", fontSize: "0.74rem", marginTop: 6, padding: "6px 10px", background: P.redL, borderRadius: 5, border: `1px solid #e0a0a0` }}>⚠ {jsonErr}</div>}
                    {ok && <div style={{ color: "#0f6e56", fontFamily: "monospace", fontSize: "0.74rem", marginTop: 6, padding: "6px 10px", background: "#e1f5ee", borderRadius: 5, border: "1px solid #9fe1cb" }}>✓ Ficha cargada. Redirigiendo…</div>}
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <button style={{ ...BP, fontSize: "0.8rem", padding: "9px 20px" }} onClick={loadJSON} disabled={!jsonTxt.trim() || ok}>✅ Cargar ficha</button>
                      <button style={{ ...BS, fontSize: "0.8rem" }} onClick={() => { setJsonTxt(""); setJsonErr(""); setOk(false); }}>Limpiar</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "fichas" && (
          fichas.length === 0 ? (
            <div style={{ textAlign: "center", padding: "70px 20px" }}>
              <div style={{ width: 64, height: 64, background: P.blueL, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>🔬</div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: "1.2rem", color: P.navy, marginBottom: 6 }}>Sin fichas registradas</div>
              <div style={{ fontSize: "0.82rem", color: P.txt2, marginBottom: 6, lineHeight: 1.7 }}>
                Escriba en el chat: <code style={{ background: P.blueL, color: P.blue, padding: "2px 8px", borderRadius: 4, fontFamily: "monospace" }}>ficha Botrytis cinerea</code>
              </div>
              <div style={{ fontSize: "0.78rem", color: P.txt3, marginBottom: 24 }}>Luego pegue la respuesta en <strong style={{ color: P.navy }}>➕ Nueva Ficha</strong></div>
              <button style={BP} onClick={() => setTab("nueva")}>➕ Nueva Ficha</button>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: "Georgia,serif", fontSize: "1.1rem", color: P.navy, fontWeight: 600 }}>Fichas registradas</div>
                  <div style={{ fontSize: "0.72rem", color: P.txt3, marginTop: 1 }}>Sistema Nacional de Vigilancia · FitoFichas</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontFamily: "monospace", fontSize: "0.65rem", color: P.txt2, background: P.blueL, border: `1px solid ${P.border}`, padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>{fichas.length} {fichas.length === 1 ? "ficha" : "fichas"}</span>
                  <button style={{ ...BSM, ...BP }} onClick={() => setTab("nueva")}>➕ Nueva</button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 14, paddingBottom: 44 }}>
                {fichas.map((f, i) => {
                  const imp = f.impacto_comercial;
                  const overall = imp ? Math.round((IMPACT_CATS.reduce((s, c) => s + (imp[c.key] || 0), 0) / IMPACT_CATS.length) * 10) / 10 : null;
                  const oc = overall !== null ? impColor(overall) : null;
                  const tb = tipoBg(f.tipoplaga);
                  return (
                    <div key={f.id} style={{ background: P.bgW, border: `1px solid ${P.border}`, borderRadius: 9, overflow: "hidden", animation: "fadeUp .3s ease both", animationDelay: `${Math.min(i * .04, .2)}s`, boxShadow: "0 2px 8px rgba(7,25,58,.06)", transition: "box-shadow .15s,transform .15s" }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 18px rgba(7,25,58,.14)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(7,25,58,.06)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                      <div style={{ height: 4, background: `linear-gradient(90deg,${P.blue},${P.accent})` }} />
                      <div style={{ padding: "12px 14px", borderBottom: `1px solid ${P.border}`, display: "flex", alignItems: "flex-start", gap: 8, justifyContent: "space-between" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: "0.97rem", color: P.navy, lineHeight: 1.28, marginBottom: 2 }}>{f.nombre_cientifico || "Sin nombre"}</div>
                          {f.nombre_vulgar && <div style={{ fontSize: "0.7rem", color: P.txt3 }}>▸ {f.nombre_vulgar}</div>}
                        </div>
                        {f.tipoplaga && <span style={{ background: tb.bg, color: tb.color, fontFamily: "monospace", fontSize: "0.54rem", padding: "2px 7px", borderRadius: 20, fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap", flexShrink: 0, border: `1px solid ${tb.color}30` }}>{f.tipoplaga}</span>}
                      </div>
                      <div style={{ padding: "10px 14px" }}>
                        {f.taxonomia && (f.taxonomia.orden || f.taxonomia.familia) && (
                          <div style={{ marginBottom: 8, padding: "5px 8px", background: P.bg, borderRadius: 5, border: `1px solid ${P.border}` }}>
                            <div style={{ fontFamily: "monospace", fontSize: "0.54rem", color: P.blue, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 2 }}>Clasificación</div>
                            <div style={{ fontSize: "0.74rem", color: P.txt2 }}>{[f.taxonomia.orden, f.taxonomia.familia].filter(Boolean).join(" › ")}</div>
                          </div>
                        )}
                        {oc && (
                          <div style={{ padding: "6px 8px", background: oc.bg, borderRadius: 5, border: `1px solid ${oc.bar}40`, display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: "monospace", fontSize: "0.54rem", color: oc.text, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 1 }}>📊 Impacto ARG</div>
                              <div style={{ fontFamily: "monospace", fontSize: "0.76rem", color: oc.text, fontWeight: 700 }}>{overall}/10 — {oc.label}</div>
                            </div>
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: oc.bar, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "monospace", fontSize: "0.72rem", fontWeight: 700 }}>{overall}</div>
                          </div>
                        )}
                      </div>
                      <div style={{ padding: "9px 14px", borderTop: `1px solid ${P.border}`, background: P.bg, display: "flex", gap: 5, flexWrap: "wrap" }}>
                        <button style={{ ...BSM, background: P.blue, borderColor: P.blue, color: "#fff", fontSize: "0.65rem", padding: "4px 10px" }} onClick={() => setView(f.id)}>👁 Ver ficha</button>
                        <button style={{ ...BSM, ...BW, fontSize: "0.65rem", padding: "4px 10px" }} onClick={() => setEdit({ ...f, taxonomia: { ...f.taxonomia } })}>✏️ Editar</button>
                        <button style={{ ...BSM, background: P.accentL, borderColor: "#9fe1cb", color: "#0f6e56", fontSize: "0.65rem", padding: "4px 10px" }} onClick={() => exportPDF(f)}>⬇ PDF</button>
                        <button style={{ ...BSM, ...BD, fontSize: "0.65rem", padding: "4px 10px" }} onClick={() => setDel(f.id)}>🗑</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )
        )}
      </div>

      {view && !edit && <ViewModal />}
      {edit && <EditModal />}
      {del && <DelDialog />}
    </div>
  );
}
