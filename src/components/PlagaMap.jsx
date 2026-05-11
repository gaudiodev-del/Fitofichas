import { useState, useEffect, useRef } from "react";
import { NUM2, CTRD, P } from "../constants";

const W = 1000, H = 507;
const API    = "https://api.openalex.org";
const MAILTO = "gaudio.dev@gmail.com";

const proj = ([lon, lat]) => [
  ((lon + 180) / 360) * W,
  ((90 - lat)  / 180) * H,
];

// Paleta de colores distinguibles para cada plaga
const PALETTE = [
  "#e63946","#2196F3","#4CAF50","#FF9800","#9C27B0",
  "#00BCD4","#FF5722","#8BC34A","#E91E63","#795548",
  "#607D8B","#F44336","#3F51B5","#009688","#FFC107",
];

let _id = 0;
const uid = () => ++_id;

export default function PlagaMap() {
  const svgRef = useRef();

  // Geometría del mapa
  const [paths, setPaths]   = useState(null);
  const [tt,    setTt]      = useState(null);

  // Lista de plagas: [{id, name, color, visible, loading, countries:{iso2:count}, total}]
  const [pests,  setPests]  = useState([]);
  const [query,  setQuery]  = useState("");

  // País seleccionado → artículos
  const [selCountry,  setSelCountry]  = useState(null); // {iso2, name}
  const [selPestId,   setSelPestId]   = useState(null);
  const [papers,      setPapers]      = useState([]);
  const [papersLoad,  setPapersLoad]  = useState(false);

  // ── Cargar geometría TopoJSON ─────────────────────────────────────────
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

  // ── Agregar plaga ─────────────────────────────────────────────────────
  const addPest = async () => {
    const name = query.trim();
    if (!name) return;
    if (pests.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      setQuery(""); return;
    }
    const id    = uid();
    const color = PALETTE[pests.length % PALETTE.length];
    setQuery("");
    setPests(prev => [...prev, { id, name, color, visible: true, loading: true, countries: {}, total: 0 }]);

    try {
      const url = `${API}/works?search=${encodeURIComponent(name)}&group_by=institutions.country_code&per_page=200&mailto=${MAILTO}`;
      const data = await fetch(url).then(r => r.json());
      const countries = {};
      (data.group_by || []).forEach(({ key, count }) => {
        if (key && key !== "unknown") countries[key.toUpperCase()] = count;
      });
      setPests(prev => prev.map(p =>
        p.id === id ? { ...p, loading: false, countries, total: data.meta?.count || 0 } : p
      ));
    } catch {
      setPests(prev => prev.map(p => p.id === id ? { ...p, loading: false } : p));
    }
  };

  const togglePest = id =>
    setPests(prev => prev.map(p => p.id === id ? { ...p, visible: !p.visible } : p));

  const removePest = id => {
    setPests(prev => prev.filter(p => p.id !== id));
    if (selPestId === id) { setSelPestId(null); setPapers([]); setSelCountry(null); }
  };

  // ── Cargar artículos de un país para una plaga ────────────────────────
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

  // ── Calcular dots por país ────────────────────────────────────────────
  // dotsByCountry: {iso2: [{pest, count}]}
  const dotsByCountry = {};
  pests.filter(p => p.visible && !p.loading).forEach(pest => {
    Object.entries(pest.countries).forEach(([iso2, count]) => {
      if (!dotsByCountry[iso2]) dotsByCountry[iso2] = [];
      dotsByCountry[iso2].push({ pest, count });
    });
  });

  const hasPests   = pests.length > 0;
  const activePests = pests.filter(p => p.visible && !p.loading);

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:P.bg }}>

      {/* Barra de búsqueda */}
      <div style={{ padding:"12px 20px", background:P.blueLL, borderBottom:`1px solid ${P.border}`, display:"flex", gap:10, alignItems:"center", flexShrink:0 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addPest()}
          placeholder="Nombre científico de la plaga…  Ej: Sorghum halepense, Amaranthus palmeri"
          style={{ flex:1, maxWidth:540, padding:"8px 14px", border:`1.5px solid ${P.border2}`, borderRadius:7, fontFamily:"inherit", fontSize:"0.84rem", outline:"none", background:"#fff", color:P.txt }}
        />
        <button onClick={addPest} style={{ padding:"8px 22px", background:P.blue, color:"#fff", border:"none", borderRadius:7, fontWeight:700, cursor:"pointer", fontSize:"0.84rem", flexShrink:0 }}>
          + Agregar plaga
        </button>
        <span style={{ fontFamily:"monospace", fontSize:"0.67rem", color:P.txt3 }}>
          {pests.length === 0
            ? "Agregá plagas para superponer su distribución en el mapa"
            : `${pests.length} plaga${pests.length!==1?"s":""} · ${activePests.length} visible${activePests.length!==1?"s":""}`}
        </span>
      </div>

      {/* Mapa + Panel */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* ── Mapa SVG ── */}
        <div ref={svgRef} style={{ flex:1, background:"#d0e4f0", position:"relative", overflow:"hidden" }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:"100%", display:"block" }}>
            <rect width={W} height={H} fill="#b8d0e8" />

            {paths === null && (
              <text x={500} y={260} textAnchor="middle" fill="#3a6080" fontSize={13} fontFamily="monospace">Cargando mapa…</text>
            )}

            {/* Países base */}
            {paths && paths.map((c, i) => {
              const hasData = !!dotsByCountry[c.iso2];
              return c.d ? (
                <path key={i} d={c.d}
                  fill={hasData ? "#c5daf0" : "#dde8cc"}
                  stroke={hasData ? "#8fb8d8" : "#c0ceb0"}
                  strokeWidth={hasData ? 0.6 : 0.4}
                  opacity={hasPests ? (hasData ? 0.92 : 0.4) : 0.78}
                />
              ) : null;
            })}

            {/* Dots agrupados por país */}
            {Object.entries(dotsByCountry).map(([iso2, pestList]) => {
              const c = CTRD[iso2];
              if (!c) return null;
              const [cx, cy] = proj([c.lon, c.lat]);
              const n       = pestList.length;
              const spacing = 12;
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
                  {/* Anillo de selección */}
                  {isSel && <circle cx={cx} cy={cy} r={n*6+9} fill="none" stroke="#fff" strokeWidth={3} opacity={0.6} />}

                  {/* Un dot por plaga, en fila horizontal centrada */}
                  {pestList.map(({ pest }, idx) => (
                    <circle key={pest.id}
                      cx={startX + idx * spacing} cy={cy} r={5.5}
                      fill={pest.color} stroke="#fff" strokeWidth={1.5}
                    />
                  ))}
                </g>
              );
            })}

            {/* Leyenda de plagas activas */}
            {activePests.length > 0 && (() => {
              const rows  = activePests.length;
              const boxH  = rows * 18 + 26;
              const boxY  = H - boxH - 4;
              return (
                <g>
                  <rect x={4} y={boxY} width={224} height={boxH} rx={4} fill="rgba(255,255,255,.94)" stroke="#a8c4d8" strokeWidth={0.8} />
                  <text x={14} y={boxY+14} fill={P.navy} fontSize={9} fontFamily="monospace" fontWeight="bold">PLAGAS VISIBLES</text>
                  {activePests.map((pest, i) => (
                    <g key={pest.id} transform={`translate(11,${boxY+20+i*18})`}>
                      <circle cx={6} cy={6} r={5.5} fill={pest.color} stroke="#fff" strokeWidth={1}/>
                      <text x={18} y={10} fill={P.navy} fontSize={9} fontFamily="monospace">
                        {pest.name.length > 23 ? pest.name.slice(0,23)+"…" : pest.name}
                      </text>
                    </g>
                  ))}
                </g>
              );
            })()}

            {/* Mensaje inicial */}
            {!hasPests && paths && (
              <text x={500} y={H/2} textAnchor="middle" fill="#3a6080" fontSize={13} fontFamily="monospace">
                Agregá una plaga para visualizar su distribución en artículos científicos
              </text>
            )}
          </svg>

          {/* Tooltip hover */}
          {tt && (
            <div style={{ position:"absolute", left:Math.min(tt.x+14,(svgRef.current?.offsetWidth||700)-250), top:Math.max(tt.y-64,4), background:"#fff", border:`1.5px solid ${P.border2}`, borderRadius:7, padding:"8px 13px", fontFamily:"monospace", fontSize:"0.68rem", color:P.navy, pointerEvents:"none", boxShadow:"0 2px 12px rgba(7,25,58,.18)", zIndex:20, minWidth:160 }}>
              <div style={{ fontWeight:700, marginBottom:5, fontSize:"0.74rem", borderBottom:`1px solid ${P.border}`, paddingBottom:4 }}>{tt.name}</div>
              {tt.pestList.map(({ pest, count }) => (
                <div key={pest.id} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                  <div style={{ width:9, height:9, borderRadius:"50%", background:pest.color, flexShrink:0 }}/>
                  <span style={{ color:P.txt2, flex:1 }}>{pest.name.length>20?pest.name.slice(0,20)+"…":pest.name}</span>
                  <span style={{ color:pest.color, fontWeight:700 }}>{count}</span>
                </div>
              ))}
              <div style={{ fontSize:"0.6rem", color:P.txt3, marginTop:5 }}>Clic para ver artículos</div>
            </div>
          )}
        </div>

        {/* ── Panel lateral ── */}
        <div style={{ width:310, flexShrink:0, background:"#fff", borderLeft:`1px solid ${P.border}`, display:"flex", flexDirection:"column", overflow:"hidden" }}>

          {/* Header */}
          <div style={{ padding:"11px 16px", background:P.navy, color:"#fff", flexShrink:0 }}>
            <div style={{ fontFamily:"monospace", fontSize:"0.74rem", fontWeight:700 }}>🌱 Plagas cargadas</div>
            <div style={{ fontSize:"0.61rem", color:"rgba(255,255,255,.45)", marginTop:2 }}>Tildá o destildá para superponer en el mapa</div>
          </div>

          {/* Lista de plagas */}
          <div style={{ overflowY:"auto", padding:"10px", flexShrink:0, maxHeight: selCountry ? "46%" : "100%", borderBottom: selCountry ? `1px solid ${P.border}` : "none" }}>
            {pests.length === 0 ? (
              <div style={{ textAlign:"center", padding:"28px 12px", color:P.txt3, fontFamily:"monospace", fontSize:"0.69rem", lineHeight:1.8 }}>
                <div style={{ fontSize:"1.8rem", opacity:.28, marginBottom:8 }}>🔬</div>
                <div>Usá el buscador para agregar plagas y visualizar su distribución mundial en artículos científicos</div>
              </div>
            ) : (
              pests.map(pest => (
                <div key={pest.id} style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 10px", marginBottom:6, background:pest.visible?P.blueLL:"#f7f7f7", border:`1.5px solid ${pest.visible?pest.color+"50":P.border}`, borderRadius:8, transition:"all .15s", opacity:pest.visible?1:0.52 }}>

                  <input type="checkbox" checked={pest.visible} onChange={() => togglePest(pest.id)}
                    style={{ width:14, height:14, accentColor:pest.color, cursor:"pointer", flexShrink:0 }} />

                  <div style={{ width:10, height:10, borderRadius:"50%", background:pest.color, flexShrink:0, boxShadow:`0 0 0 2px ${pest.color}30` }}/>

                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:"monospace", fontSize:"0.71rem", fontWeight:700, color:P.navy, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {pest.name}
                    </div>
                    <div style={{ fontFamily:"monospace", fontSize:"0.6rem", color:P.txt3, marginTop:1 }}>
                      {pest.loading
                        ? "Buscando…"
                        : `${Object.keys(pest.countries).length} países · ${pest.total.toLocaleString("es-AR")} arts.`}
                    </div>
                  </div>

                  {pest.loading && (
                    <div style={{ width:13, height:13, border:`2px solid ${P.border}`, borderTop:`2px solid ${pest.color}`, borderRadius:"50%", animation:"spin .7s linear infinite", flexShrink:0 }}/>
                  )}

                  {!pest.loading && (
                    <button onClick={() => removePest(pest.id)}
                      style={{ background:"none", border:"none", color:P.txt3, cursor:"pointer", fontSize:"1rem", padding:"0 2px", lineHeight:1, flexShrink:0, borderRadius:3 }}
                      onMouseOver={e => e.currentTarget.style.color="#c0392b"}
                      onMouseOut={e  => e.currentTarget.style.color=P.txt3}>×</button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Panel de artículos del país seleccionado */}
          {selCountry && (
            <>
              {/* Sub-header con tabs por plaga */}
              <div style={{ padding:"9px 14px", background:P.navy2, color:"#fff", flexShrink:0 }}>
                <div style={{ fontFamily:"monospace", fontSize:"0.71rem", fontWeight:700, marginBottom:6 }}>
                  📄 {selCountry.name}
                </div>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                  {pests.filter(p => p.visible && p.countries[selCountry.iso2]).map(pest => (
                    <button key={pest.id}
                      onClick={() => loadPapers(pest, selCountry.iso2, selCountry.name)}
                      style={{ padding:"3px 8px", borderRadius:4, border:"none", cursor:"pointer", fontFamily:"monospace", fontSize:"0.6rem", fontWeight:700, transition:"all .15s", background: selPestId===pest.id ? pest.color : `${pest.color}30`, color: selPestId===pest.id ? "#fff" : pest.color }}>
                      {pest.name.length>15?pest.name.slice(0,15)+"…":pest.name} ({pest.countries[selCountry.iso2]})
                    </button>
                  ))}
                </div>
              </div>

              {/* Listado de artículos */}
              <div style={{ flex:1, overflowY:"auto", padding:"10px" }}>
                {papersLoad && (
                  <div style={{ textAlign:"center", padding:"20px", color:P.txt3, fontFamily:"monospace", fontSize:"0.7rem" }}>Cargando artículos…</div>
                )}
                {!papersLoad && papers.length === 0 && selPestId && (
                  <div style={{ textAlign:"center", padding:"20px", color:P.txt3, fontFamily:"monospace", fontSize:"0.7rem" }}>Sin resultados</div>
                )}
                {!papersLoad && papers.map((paper, i) => {
                  const doi     = paper.doi?.replace("https://doi.org/","");
                  const journal = paper.primary_location?.source?.display_name || "";
                  const isOA    = paper.open_access?.is_oa;
                  const auths   = (paper.authorships||[]).slice(0,2).map(a=>a.author?.display_name).filter(Boolean).join("; ");
                  const extra   = (paper.authorships||[]).length > 2 ? ` +${paper.authorships.length-2}` : "";
                  const selPest = pests.find(p => p.id === selPestId);
                  return (
                    <div key={paper.id||i} style={{ background:P.blueLL, border:`1px solid ${selPest?.color+"33"||P.border}`, borderRadius:7, padding:"9px 11px", marginBottom:7 }}>
                      <div style={{ fontFamily:"monospace", fontSize:"0.6rem", color:P.txt3 }}>{paper.publication_year||"—"}</div>
                      <div style={{ fontSize:"0.74rem", fontWeight:700, color:P.navy, lineHeight:1.35, marginBottom:4 }}>{paper.title||"Sin título"}</div>
                      {journal && <div style={{ fontSize:"0.64rem", color:P.blue, fontStyle:"italic", marginBottom:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{journal}</div>}
                      {auths && <div style={{ fontSize:"0.61rem", color:P.txt3, marginBottom:5 }}>{auths}{extra}</div>}
                      <div style={{ display:"flex", gap:5 }}>
                        {doi && <a href={`https://doi.org/${doi}`} target="_blank" rel="noopener noreferrer" style={{ fontSize:"0.6rem", padding:"2px 8px", borderRadius:4, background:P.blueL, color:P.blue, textDecoration:"none", fontWeight:700, border:`1px solid ${P.border2}` }}>↗ DOI</a>}
                        {isOA && <span style={{ fontSize:"0.6rem", padding:"2px 8px", borderRadius:4, background:P.accentL, color:P.accent, fontWeight:700 }}>Acceso Abierto</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
