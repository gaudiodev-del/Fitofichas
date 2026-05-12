import { useState, useEffect, useRef } from "react";
import { NUM2, CTRD } from "../constants";

const W = 1000, H = 507;
const API    = "https://api.openalex.org";
const MAILTO = "gaudio.dev@gmail.com";

const proj = ([lon, lat]) => [
  ((lon + 180) / 360) * W,
  ((90 - lat)  / 180) * H,
];

const PALETTE = [
  "#ef4444","#3b82f6","#22c55e","#f97316","#a855f7",
  "#06b6d4","#f59e0b","#ec4899","#14b8a6","#8b5cf6",
  "#84cc16","#f43f5e","#0ea5e9","#10b981","#fb923c",
];

// Colores inspirados en geomap_app
const C = {
  accent:  "#2563eb",
  accentH: "#1d4ed8",
  accentL: "#eff6ff",
  navy:    "#1e3a8a",
  surface: "#ffffff",
  bg:      "#f1f5f9",
  border:  "#e2e8f0",
  borderS: "#cbd5e1",
  text:    "#0f172a",
  muted:   "#64748b",
  ocean:   "#1a3050",
  land:    "#2d4a3e",
  landH:   "#1e3a8a",
};

let _id = 0;
const uid = () => ++_id;

export default function PlagaMap() {
  const svgRef = useRef();
  const [paths, setPaths] = useState(null);
  const [tt,    setTt]    = useState(null);
  const [pests, setPests] = useState([]);
  const [query, setQuery] = useState("");

  const [selCountry, setSelCountry] = useState(null);
  const [selPestId,  setSelPestId]  = useState(null);
  const [papers,     setPapers]     = useState([]);
  const [papersLoad, setPapersLoad] = useState(false);

  // ── TopoJSON ──────────────────────────────────────────────────────────
  useEffect(() => {
    const loadScript = src => new Promise((res, rej) => {
      if (window.topojson) { res(); return; }
      const ex = document.querySelector(`script[data-id="topojson"]`);
      if (ex) { ex.addEventListener("load", res); return; }
      const s = document.createElement("script");
      s.src = src; s.setAttribute("data-id","topojson");
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
    let cancelled = false;
    loadScript("https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js")
      .then(() => fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"))
      .then(r => r.json())
      .then(topo => {
        if (cancelled) return;
        const features = window.topojson.feature(topo, topo.objects.countries).features;
        setPaths(features.map(feat => {
          const iso2 = NUM2[parseInt(feat.id)] || null;
          let d = "";
          const geom = feat.geometry;
          if (!geom) return { iso2, d };
          const polys = geom.type === "Polygon" ? [geom.coordinates]
            : geom.type === "MultiPolygon" ? geom.coordinates : [];
          polys.forEach(poly => poly.forEach(ring => {
            if (!ring.length) return;
            const [x0, y0] = proj(ring[0]);
            d += `M${x0.toFixed(1)},${y0.toFixed(1)}`;
            let px = x0;
            for (let i = 1; i < ring.length; i++) {
              const [x, y] = proj(ring[i]);
              d += Math.abs(x - px) > 500
                ? `M${x.toFixed(1)},${y.toFixed(1)}`
                : `L${x.toFixed(1)},${y.toFixed(1)}`;
              px = x;
            }
            d += "Z";
          }));
          return { iso2, d };
        }));
      })
      .catch(() => setPaths([]));
    return () => { cancelled = true; };
  }, []);

  // ── Plagas ────────────────────────────────────────────────────────────
  const addPest = async () => {
    const name = query.trim();
    if (!name) return;
    if (pests.some(p => p.name.toLowerCase() === name.toLowerCase())) { setQuery(""); return; }
    const id = uid();
    const color = PALETTE[pests.length % PALETTE.length];
    setQuery("");
    setPests(prev => [...prev, { id, name, color, visible: true, loading: true, countries: {}, total: 0 }]);
    try {
      const url = `${API}/works?search=${encodeURIComponent(name)}&group_by=institutions.country_code&per_page=200&mailto=${MAILTO}`;
      const data = await fetch(url).then(r => r.json());
      const countries = {};
      (data.group_by || []).forEach(({ key, count }) => {
        if (!key) return;
        const iso2 = key.replace(/^https?:\/\/openalex\.org\/countries\//i, "").trim().toUpperCase();
        if (iso2 && iso2 !== "UNKNOWN" && iso2.length <= 3) countries[iso2] = count;
      });
      setPests(prev => prev.map(p =>
        p.id === id ? { ...p, loading: false, countries, total: data.meta?.count || 0 } : p
      ));
    } catch {
      setPests(prev => prev.map(p => p.id === id ? { ...p, loading: false } : p));
    }
  };

  const togglePest = id => setPests(prev => prev.map(p => p.id === id ? { ...p, visible: !p.visible } : p));
  const removePest = id => {
    setPests(prev => prev.filter(p => p.id !== id));
    if (selPestId === id) { setSelPestId(null); setPapers([]); setSelCountry(null); }
  };

  const loadPapers = async (pest, iso2, countryName) => {
    setSelCountry({ iso2, name: countryName });
    setSelPestId(pest.id);
    setPapers([]);
    setPapersLoad(true);
    try {
      const fields = "id,title,doi,publication_year,authorships,primary_location,open_access";
      const url = `${API}/works?search=${encodeURIComponent(pest.name)}&filter=institutions.country_code:${iso2.toLowerCase()}&per_page=6&select=${fields}&mailto=${MAILTO}`;
      const data = await fetch(url).then(r => r.json());
      setPapers(data.results || []);
    } catch { setPapers([]); }
    finally { setPapersLoad(false); }
  };

  // ── Dots ──────────────────────────────────────────────────────────────
  const dotsByCountry = {};
  pests.filter(p => p.visible && !p.loading).forEach(pest => {
    Object.entries(pest.countries).forEach(([iso2, count]) => {
      if (!dotsByCountry[iso2]) dotsByCountry[iso2] = [];
      dotsByCountry[iso2].push({ pest, count });
    });
  });

  const hasPests    = pests.length > 0;
  const activePests = pests.filter(p => p.visible && !p.loading);
  const totalDots   = Object.keys(dotsByCountry).filter(k => CTRD[k]).length;

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", fontFamily:"'Inter',system-ui,sans-serif", background:C.bg }}>

      {/* ── Header / Barra de búsqueda ── */}
      <div style={{
        background:"linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 60%,#3b82f6 100%)",
        padding:"0 20px", display:"flex", alignItems:"center", gap:12,
        flexShrink:0, height:54, boxShadow:"0 2px 12px rgba(37,99,235,.4)", zIndex:10,
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:9, flexShrink:0 }}>
          <div style={{ width:32, height:32, background:"rgba(255,255,255,.18)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🌿</div>
          <span style={{ color:"#fff", fontWeight:700, fontSize:15, letterSpacing:"-.3px" }}>
            PlagaMap <span style={{ color:"rgba(255,255,255,.5)", fontWeight:400 }}>· distribución global</span>
          </span>
        </div>

        {/* Buscador */}
        <div style={{ flex:1, display:"flex", gap:8, maxWidth:560 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addPest()}
            placeholder="Nombre científico de la plaga… Ej: Sorghum halepense"
            style={{
              flex:1, padding:"8px 14px",
              background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.25)",
              borderRadius:8, color:"#fff", fontSize:"0.84rem", outline:"none",
              fontFamily:"inherit",
            }}
          />
          <button onClick={addPest} style={{
            padding:"8px 18px", background:"rgba(255,255,255,.2)",
            border:"1px solid rgba(255,255,255,.35)", borderRadius:8,
            color:"#fff", fontWeight:700, cursor:"pointer", fontSize:"0.84rem",
            flexShrink:0, transition:"all .2s",
          }}
            onMouseOver={e => e.currentTarget.style.background="rgba(255,255,255,.32)"}
            onMouseOut={e  => e.currentTarget.style.background="rgba(255,255,255,.2)"}
          >+ Agregar</button>
        </div>

        {/* Stats */}
        {hasPests && (
          <div style={{ display:"flex", gap:8, marginLeft:"auto", flexShrink:0 }}>
            <div style={{ background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.2)", borderRadius:8, padding:"3px 12px", textAlign:"center" }}>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:15, fontWeight:600, color:"#fff", lineHeight:1 }}>{pests.length}</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,.55)", textTransform:"uppercase", letterSpacing:1, marginTop:2 }}>plagas</div>
            </div>
            <div style={{ background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.2)", borderRadius:8, padding:"3px 12px", textAlign:"center" }}>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:15, fontWeight:600, color:"#fff", lineHeight:1 }}>{totalDots}</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,.55)", textTransform:"uppercase", letterSpacing:1, marginTop:2 }}>países</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Cuerpo: mapa + sidebar ── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* ── Mapa SVG ── */}
        <div ref={svgRef} style={{ flex:1, position:"relative", overflow:"hidden", background:C.ocean }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:"100%", display:"block" }}>

            {/* Océano */}
            <rect width={W} height={H} fill={C.ocean} />

            {paths === null && (
              <text x={500} y={260} textAnchor="middle" fill="rgba(255,255,255,.4)" fontSize={13} fontFamily="monospace">
                Cargando mapa…
              </text>
            )}

            {/* Países */}
            {paths && paths.map((country, i) => {
              const hasData = !!dotsByCountry[country.iso2];
              return country.d ? (
                <path key={i} d={country.d}
                  fill={hasData ? "#1e40af" : "#2d4a3e"}
                  stroke={hasData ? "#3b82f6" : "#1a3330"}
                  strokeWidth={hasData ? 0.7 : 0.3}
                  opacity={hasPests ? (hasData ? 0.9 : 0.35) : 0.7}
                />
              ) : null;
            })}

            {/* Dots por país */}
            {Object.entries(dotsByCountry).map(([iso2, pestList]) => {
              const c = CTRD[iso2];
              if (!c) return null;
              const [cx, cy] = proj([c.lon, c.lat]);
              const n       = pestList.length;
              const spacing = 15;
              const startX  = cx - ((n - 1) * spacing) / 2;
              const isSel   = selCountry?.iso2 === iso2;

              return (
                <g key={iso2} style={{ cursor:"pointer" }}
                  onMouseMove={e => {
                    if (!svgRef.current) return;
                    const r = svgRef.current.getBoundingClientRect();
                    setTt({ x:e.clientX-r.left, y:e.clientY-r.top, name:c.n, pestList });
                  }}
                  onMouseLeave={() => setTt(null)}
                  onClick={() => pestList[0] && loadPapers(pestList[0].pest, iso2, c.n)}
                >
                  {/* Halo selección */}
                  {isSel && <circle cx={cx} cy={cy} r={n*7+12} fill="none" stroke="#fff" strokeWidth={2.5} opacity={0.6} />}

                  {/* Halo glow */}
                  {pestList.map(({ pest }, idx) => (
                    <circle key={`g-${pest.id}`}
                      cx={startX + idx * spacing} cy={cy} r={11}
                      fill={pest.color} opacity={0.2}
                    />
                  ))}

                  {/* Dot */}
                  {pestList.map(({ pest }, idx) => (
                    <circle key={pest.id}
                      cx={startX + idx * spacing} cy={cy} r={7}
                      fill={pest.color} stroke="#fff" strokeWidth={2}
                    />
                  ))}
                </g>
              );
            })}

            {/* Leyenda */}
            {activePests.length > 0 && (() => {
              const boxH = activePests.length * 19 + 26;
              const boxY = H - boxH - 6;
              return (
                <g>
                  <rect x={6} y={boxY} width={220} height={boxH} rx={6}
                    fill="rgba(15,23,42,.82)" stroke="rgba(255,255,255,.12)" strokeWidth={1} />
                  <text x={16} y={boxY+15} fill="rgba(255,255,255,.5)" fontSize={8}
                    fontFamily="'JetBrains Mono',monospace" fontWeight="bold" letterSpacing="1.5">
                    PLAGAS ACTIVAS
                  </text>
                  {activePests.map((pest, i) => (
                    <g key={pest.id} transform={`translate(10,${boxY+21+i*19})`}>
                      <circle cx={7} cy={7} r={6} fill={pest.color} />
                      <text x={19} y={11} fill="#fff" fontSize={9} fontFamily="'JetBrains Mono',monospace">
                        {pest.name.length > 24 ? pest.name.slice(0,24)+"…" : pest.name}
                      </text>
                    </g>
                  ))}
                </g>
              );
            })()}

            {/* Mensaje vacío */}
            {!hasPests && paths && (
              <text x={500} y={H/2} textAnchor="middle" fill="rgba(255,255,255,.3)" fontSize={13} fontFamily="monospace">
                Agregá una plaga para visualizar su distribución global
              </text>
            )}
          </svg>

          {/* Tooltip */}
          {tt && (
            <div style={{
              position:"absolute",
              left:Math.min(tt.x+14,(svgRef.current?.offsetWidth||700)-240),
              top:Math.max(tt.y-70,4),
              background:"rgba(15,23,42,.95)", border:"1px solid rgba(255,255,255,.15)",
              borderRadius:10, padding:"10px 14px",
              fontFamily:"'Inter',system-ui,sans-serif", fontSize:"0.7rem", color:"#fff",
              pointerEvents:"none", boxShadow:"0 8px 24px rgba(0,0,0,.4)", zIndex:20, minWidth:170,
            }}>
              <div style={{ fontWeight:700, marginBottom:6, fontSize:"0.76rem",
                borderBottom:"1px solid rgba(255,255,255,.12)", paddingBottom:5 }}>
                {tt.name}
              </div>
              {tt.pestList.map(({ pest, count }) => (
                <div key={pest.id} style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:pest.color, flexShrink:0 }}/>
                  <span style={{ color:"rgba(255,255,255,.7)", flex:1, fontSize:"0.68rem" }}>
                    {pest.name.length>22?pest.name.slice(0,22)+"…":pest.name}
                  </span>
                  <span style={{ color:pest.color, fontWeight:700, fontFamily:"monospace" }}>{count.toLocaleString()}</span>
                </div>
              ))}
              <div style={{ fontSize:"0.6rem", color:"rgba(255,255,255,.35)", marginTop:5 }}>
                Clic para ver artículos
              </div>
            </div>
          )}
        </div>

        {/* ── Panel lateral derecho ── */}
        <div style={{
          width:320, flexShrink:0, background:C.surface,
          borderLeft:`1px solid ${C.border}`,
          display:"flex", flexDirection:"column", overflow:"hidden",
          boxShadow:"-2px 0 12px rgba(0,0,0,.06)",
        }}>

          {/* Header sidebar */}
          <div style={{
            padding:"14px 16px", borderBottom:`1px solid ${C.border}`,
            background:C.surface, flexShrink:0,
          }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:"1.5px",
              textTransform:"uppercase", color:C.muted, marginBottom:10,
              display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:20, height:20, background:C.accentL, borderRadius:5,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:11 }}>🌱</div>
              Plagas cargadas
            </div>

            {pests.length === 0 ? (
              <div style={{ textAlign:"center", padding:"24px 8px", color:C.muted, fontSize:"0.72rem", lineHeight:1.8 }}>
                <div style={{ fontSize:"2rem", opacity:.2, marginBottom:8 }}>🔬</div>
                Usá el buscador para agregar plagas y visualizar su distribución mundial
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {pests.map(pest => (
                  <div key={pest.id} style={{
                    display:"flex", alignItems:"center", gap:8,
                    padding:"9px 11px",
                    background: pest.visible ? C.accentL : C.bg,
                    border:`1.5px solid ${pest.visible ? pest.color+"55" : C.border}`,
                    borderRadius:10, transition:"all .15s",
                    opacity: pest.visible ? 1 : 0.5,
                  }}>
                    <input type="checkbox" checked={pest.visible} onChange={() => togglePest(pest.id)}
                      style={{ width:14, height:14, accentColor:pest.color, cursor:"pointer", flexShrink:0 }} />
                    <div style={{ width:10, height:10, borderRadius:"50%", background:pest.color,
                      flexShrink:0, boxShadow:`0 0 0 3px ${pest.color}22` }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:"0.72rem", fontWeight:600, color:C.text,
                        whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                        {pest.name}
                      </div>
                      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.59rem", color:C.muted, marginTop:1 }}>
                        {pest.loading ? "Buscando…"
                          : `${Object.keys(pest.countries).length} países · ${pest.total.toLocaleString()} arts.`}
                      </div>
                    </div>
                    {pest.loading && (
                      <div style={{ width:13, height:13, border:`2px solid ${C.border}`,
                        borderTop:`2px solid ${pest.color}`, borderRadius:"50%",
                        animation:"spin .7s linear infinite", flexShrink:0 }} />
                    )}
                    {!pest.loading && (
                      <button onClick={() => removePest(pest.id)} style={{
                        background:"none", border:"none", color:C.muted, cursor:"pointer",
                        fontSize:"1.1rem", padding:"0 2px", lineHeight:1, flexShrink:0, borderRadius:4,
                      }}
                        onMouseOver={e => e.currentTarget.style.color="#ef4444"}
                        onMouseOut={e  => e.currentTarget.style.color=C.muted}>×</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Panel artículos */}
          {selCountry ? (
            <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
              {/* Sub-header país */}
              <div style={{ padding:"11px 16px", background:"#0f172a", flexShrink:0 }}>
                <div style={{ fontSize:"0.74rem", fontWeight:700, color:"#fff", marginBottom:7 }}>
                  📄 {selCountry.name}
                </div>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                  {pests.filter(p => p.visible && p.countries[selCountry.iso2]).map(pest => (
                    <button key={pest.id}
                      onClick={() => loadPapers(pest, selCountry.iso2, selCountry.name)}
                      style={{
                        padding:"3px 9px", borderRadius:5, border:"none", cursor:"pointer",
                        fontFamily:"monospace", fontSize:"0.6rem", fontWeight:700, transition:"all .15s",
                        background: selPestId===pest.id ? pest.color : `${pest.color}30`,
                        color: selPestId===pest.id ? "#fff" : pest.color,
                      }}>
                      {pest.name.length>14?pest.name.slice(0,14)+"…":pest.name}
                      <span style={{ opacity:.7, marginLeft:4 }}>({pest.countries[selCountry.iso2]})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista artículos */}
              <div style={{ flex:1, overflowY:"auto", padding:"12px" }}>
                {papersLoad && (
                  <div style={{ textAlign:"center", padding:"24px", color:C.muted, fontSize:"0.72rem" }}>
                    Cargando artículos…
                  </div>
                )}
                {!papersLoad && papers.length === 0 && selPestId && (
                  <div style={{ textAlign:"center", padding:"24px", color:C.muted, fontSize:"0.72rem" }}>
                    Sin resultados para este país
                  </div>
                )}
                {!papersLoad && papers.map((paper, i) => {
                  const doi     = paper.doi?.replace("https://doi.org/","");
                  const journal = paper.primary_location?.source?.display_name || "";
                  const isOA    = paper.open_access?.is_oa;
                  const auths   = (paper.authorships||[]).slice(0,2)
                    .map(a => a.author?.display_name).filter(Boolean).join("; ");
                  const extra   = (paper.authorships||[]).length > 2
                    ? ` +${paper.authorships.length-2}` : "";
                  const selPest = pests.find(p => p.id === selPestId);
                  return (
                    <div key={paper.id||i} style={{
                      background:C.bg, border:`1px solid ${C.border}`,
                      borderLeft:`3px solid ${selPest?.color||C.accent}`,
                      borderRadius:8, padding:"10px 12px", marginBottom:8,
                      transition:".15s",
                    }}>
                      <div style={{ fontFamily:"monospace", fontSize:"0.58rem", color:C.muted, marginBottom:3 }}>
                        {paper.publication_year||"—"}
                        {journal && <span> · {journal.length>28?journal.slice(0,28)+"…":journal}</span>}
                      </div>
                      <div style={{ fontSize:"0.73rem", fontWeight:600, color:C.text,
                        lineHeight:1.38, marginBottom:5 }}>
                        {paper.title||"Sin título"}
                      </div>
                      {auths && (
                        <div style={{ fontSize:"0.6rem", color:C.muted, marginBottom:6 }}>
                          {auths}{extra}
                        </div>
                      )}
                      <div style={{ display:"flex", gap:5 }}>
                        {doi && (
                          <a href={`https://doi.org/${doi}`} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize:"0.6rem", padding:"2px 9px", borderRadius:4,
                              background:C.accentL, color:C.accent,
                              textDecoration:"none", fontWeight:700,
                              border:`1px solid #bfdbfe` }}>
                            ↗ DOI
                          </a>
                        )}
                        {isOA && (
                          <span style={{ fontSize:"0.6rem", padding:"2px 9px", borderRadius:4,
                            background:"#f0fdf4", color:"#16a34a", fontWeight:700,
                            border:"1px solid #bbf7d0" }}>
                            Acceso Abierto
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center",
              flexDirection:"column", gap:10, color:C.muted, padding:20, textAlign:"center" }}>
              <div style={{ fontSize:"2.5rem", opacity:.15 }}>🗺️</div>
              <div style={{ fontSize:"0.72rem", lineHeight:1.7 }}>
                Hacé clic en un punto del mapa para ver los artículos científicos de ese país
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
      `}</style>
    </div>
  );
}
