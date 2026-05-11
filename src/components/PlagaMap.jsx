import { useState, useEffect, useRef } from "react";
import { NUM2, CTRD, P } from "../constants";

const W = 1000, H = 507;
const API = "https://api.openalex.org";
const MAILTO = "gaudio.dev@gmail.com";

const proj = ([lon, lat]) => [
  ((lon + 180) / 360) * W,
  ((90 - lat) / 180) * H,
];

function choroplethColor(count) {
  if (!count) return { fill: "#dde8cc", stroke: "#c0ceb0" };
  if (count <= 2)   return { fill: "#b7e4c7", stroke: "#74c69d" };
  if (count <= 10)  return { fill: "#52b788", stroke: "#40916c" };
  if (count <= 30)  return { fill: "#f4a261", stroke: "#e76f51" };
  if (count <= 100) return { fill: "#e76f51", stroke: "#c1440e" };
  return { fill: "#9e2a2b", stroke: "#7b1d1d" };
}

function rebuildAbstract(inv) {
  if (!inv || typeof inv !== "object") return "";
  const pos = {};
  Object.entries(inv).forEach(([w, ps]) => ps.forEach(p => { pos[p] = w; }));
  return Object.keys(pos).sort((a, b) => +a - +b).map(k => pos[k]).join(" ").slice(0, 300);
}

const LEGEND_ITEMS = [
  ["Sin datos", "#dde8cc"],
  ["1–2 artículos", "#b7e4c7"],
  ["3–10 artículos", "#52b788"],
  ["11–30 artículos", "#f4a261"],
  ["31–100 artículos", "#e76f51"],
  ["100+ artículos", "#9e2a2b"],
];

export default function PlagaMap() {
  const svgRef = useRef();

  // Geometría del mapa
  const [paths, setPaths] = useState(null);
  const [tt, setTt] = useState(null);

  // Búsqueda
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [countryData, setCountryData] = useState({});
  const [totalPapers, setTotalPapers] = useState(0);
  const [searchedPest, setSearchedPest] = useState("");

  // Panel de artículos
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [papers, setPapers] = useState([]);
  const [papersLoading, setPapersLoading] = useState(false);
  const [papersTotal, setPapersTotal] = useState(0);
  const [papersPage, setPapersPage] = useState(1);

  // Cargar geometría TopoJSON (reutiliza el script si ya está cargado)
  useEffect(() => {
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

    let cancelled = false;
    loadScript("https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js")
      .then(() => fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"))
      .then(r => r.json())
      .then(topo => {
        if (cancelled) return;
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
              let prevX = x0;
              for (let i = 1; i < ring.length; i++) {
                const [x, y] = proj(ring[i]);
                if (Math.abs(x - prevX) > 500) {
                  d += `M${x.toFixed(1)},${y.toFixed(1)}`;
                } else {
                  d += `L${x.toFixed(1)},${y.toFixed(1)}`;
                }
                prevX = x;
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

  // ── Búsqueda por especie ────────────────────────────────────────────────
  const doSearch = async e => {
    e.preventDefault();
    const pest = query.trim();
    if (!pest) return;
    setLoading(true);
    setCountryData({});
    setSelectedCountry(null);
    setPapers([]);
    setSearchedPest(pest);

    try {
      const url = `${API}/works?search=${encodeURIComponent(pest)}&group_by=institutions.country_code&per_page=200&mailto=${MAILTO}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTotalPapers(data.meta?.count || 0);
      const cd = {};
      (data.group_by || []).forEach(({ key, count }) => {
        if (key && key !== "unknown") cd[key.toUpperCase()] = count;
      });
      setCountryData(cd);
    } catch (err) {
      console.error("PlagaMap search error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Selección de país ───────────────────────────────────────────────────
  const selectCountry = async (iso2, name, count) => {
    if (!searchedPest || !count) return;
    setSelectedCountry({ iso2, name, count });
    setPapers([]);
    setPapersPage(1);
    setPapersTotal(count);
    setPapersLoading(true);

    try {
      const fields = "id,title,doi,publication_year,authorships,primary_location,abstract_inverted_index,open_access";
      const url = `${API}/works?search=${encodeURIComponent(searchedPest)}&filter=institutions.country_code:${iso2.toLowerCase()}&per_page=8&page=1&select=${fields}&mailto=${MAILTO}`;
      const res = await fetch(url);
      const data = await res.json();
      setPapers(data.results || []);
      setPapersTotal(data.meta?.count || count);
    } catch (err) {
      console.error("PlagaMap papers error:", err);
    } finally {
      setPapersLoading(false);
    }
  };

  // ── Cargar más artículos ────────────────────────────────────────────────
  const loadMore = async () => {
    const nextPage = papersPage + 1;
    setPapersPage(nextPage);
    setPapersLoading(true);
    try {
      const fields = "id,title,doi,publication_year,authorships,primary_location,abstract_inverted_index,open_access";
      const url = `${API}/works?search=${encodeURIComponent(searchedPest)}&filter=institutions.country_code:${selectedCountry.iso2.toLowerCase()}&per_page=8&page=${nextPage}&select=${fields}&mailto=${MAILTO}`;
      const res = await fetch(url);
      const data = await res.json();
      setPapers(prev => [...prev, ...(data.results || [])]);
    } catch (err) {
      console.error(err);
    } finally {
      setPapersLoading(false);
    }
  };

  const countriesCount = Object.keys(countryData).length;

  // ── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: P.bg }}>

      {/* ── Barra de búsqueda ── */}
      <div style={{
        padding: "14px 24px", background: P.blueLL,
        borderBottom: `1px solid ${P.border}`,
        display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", flexShrink: 0,
      }}>
        <form onSubmit={doSearch} style={{ display: "flex", gap: 8, flex: 1, minWidth: 280 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Nombre científico de la plaga o maleza…  Ej: Sorghum halepense, Amaranthus palmeri"
            style={{
              flex: 1, padding: "9px 14px",
              border: `1.5px solid ${P.border2}`, borderRadius: 7,
              fontFamily: "inherit", fontSize: "0.85rem", outline: "none",
              background: "#fff", color: P.txt,
            }}
          />
          <button type="submit" disabled={loading} style={{
            padding: "9px 22px", background: loading ? P.txt3 : P.blue,
            color: "#fff", border: "none", borderRadius: 7,
            fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
            fontSize: "0.85rem", transition: "background .15s", flexShrink: 0,
          }}>
            {loading ? "Buscando…" : "🔍 Buscar"}
          </button>
        </form>

        {searchedPest && !loading && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{
              background: P.blueL, border: `1px solid ${P.border2}`, borderRadius: 20,
              padding: "3px 13px", fontFamily: "monospace", fontSize: "0.68rem",
              color: P.navy, fontWeight: 700,
            }}>
              {totalPapers.toLocaleString("es-AR")} artículos
            </span>
            <span style={{
              background: P.accentL, border: `1px solid ${P.accent}40`, borderRadius: 20,
              padding: "3px 13px", fontFamily: "monospace", fontSize: "0.68rem",
              color: P.accent, fontWeight: 700,
            }}>
              {countriesCount} países
            </span>
          </div>
        )}
      </div>

      {/* ── Mapa + Panel ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── Mapa SVG ── */}
        <div ref={svgRef} style={{ flex: 1, background: "#d0e4f0", position: "relative", overflow: "hidden" }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%", display: "block" }}>
            <rect width={W} height={H} fill="#b8d0e8" />

            {paths === null && (
              <text x={500} y={260} textAnchor="middle" fill="#3a6080" fontSize={13} fontFamily="monospace">
                Cargando mapa…
              </text>
            )}

            {/* Países */}
            {paths && paths.map((c, i) => {
              const count = countryData[c.iso2] || 0;
              const hasPapers = count > 0 && !!searchedPest;
              const isSelected = selectedCountry?.iso2 === c.iso2;
              const { fill, stroke } = choroplethColor(count);
              const name = CTRD[c.iso2]?.n || c.iso2 || "—";
              return c.d ? (
                <path key={i} d={c.d}
                  fill={isSelected ? "#1d6a9e" : fill}
                  stroke={isSelected ? "#0a2550" : stroke}
                  strokeWidth={hasPapers ? 0.7 : 0.4}
                  opacity={hasPapers ? 0.92 : searchedPest ? 0.45 : 0.78}
                  style={{ cursor: hasPapers ? "pointer" : "default", transition: "opacity .2s, fill .2s" }}
                  onMouseMove={e => {
                    if (!svgRef.current) return;
                    const r = svgRef.current.getBoundingClientRect();
                    setTt({ x: e.clientX - r.left, y: e.clientY - r.top, name, count });
                  }}
                  onMouseLeave={() => setTt(null)}
                  onClick={() => hasPapers && selectCountry(c.iso2, name, count)}
                />
              ) : null;
            })}

            {/* Puntos sobre países con artículos */}
            {paths && searchedPest && Object.entries(countryData).map(([iso2, count]) => {
              const c = CTRD[iso2];
              if (!c) return null;
              const [cx, cy] = proj([c.lon, c.lat]);
              const { fill } = choroplethColor(count);
              const isSelected = selectedCountry?.iso2 === iso2;
              return (
                <g key={iso2} style={{ cursor: "pointer" }}
                  onClick={() => selectCountry(iso2, c.n, count)}
                  onMouseMove={e => {
                    if (!svgRef.current) return;
                    const r = svgRef.current.getBoundingClientRect();
                    setTt({ x: e.clientX - r.left, y: e.clientY - r.top, name: c.n, count });
                  }}
                  onMouseLeave={() => setTt(null)}>
                  {isSelected && <circle cx={cx} cy={cy} r={13} fill="none" stroke="#fff" strokeWidth={3} />}
                  {isSelected && <circle cx={cx} cy={cy} r={13} fill="none" stroke={fill} strokeWidth={2} />}
                  <circle cx={cx} cy={cy} r={isSelected ? 7 : 5}
                    fill={fill} stroke="#fff" strokeWidth={isSelected ? 2.5 : 1.5} />
                </g>
              );
            })}

            {/* Leyenda */}
            {searchedPest && (
              <g>
                <rect x={4} y={H - 144} width={196} height={142} rx={4}
                  fill="rgba(255,255,255,.94)" stroke="#a8c4d8" strokeWidth={0.8} />
                <text x={14} y={H - 126} fill={P.navy} fontSize={10} fontFamily="monospace" fontWeight="bold">
                  ARTÍCULOS POR PAÍS
                </text>
                {LEGEND_ITEMS.map(([label, color], i) => (
                  <g key={label} transform={`translate(11,${H - 119 + i * 19})`}>
                    <rect x={0} y={0} width={12} height={12} rx={2} fill={color} />
                    <text x={18} y={10} fill={P.navy} fontSize={10} fontFamily="monospace">{label}</text>
                  </g>
                ))}
              </g>
            )}

            {/* Mensaje inicial */}
            {!searchedPest && paths && (
              <text x={500} y={H / 2 + 6} textAnchor="middle" fill="#3a6080" fontSize={13} fontFamily="monospace">
                Ingresá el nombre científico de una plaga para visualizar su distribución
              </text>
            )}
          </svg>

          {/* Tooltip */}
          {tt && (
            <div style={{
              position: "absolute",
              left: Math.min(tt.x + 14, (svgRef.current?.offsetWidth || 700) - 230),
              top: Math.max(tt.y - 52, 4),
              background: "#fff",
              border: `2px solid ${choroplethColor(tt.count).fill}`,
              borderRadius: 6, padding: "5px 13px",
              fontFamily: "monospace", fontSize: "0.7rem", color: P.navy,
              pointerEvents: "none", whiteSpace: "nowrap",
              boxShadow: "0 2px 10px rgba(7,25,58,.2)", zIndex: 20,
            }}>
              <strong>{tt.name}</strong><br />
              <span style={{ color: choroplethColor(tt.count).fill }}>
                {tt.count
                  ? `${tt.count.toLocaleString("es-AR")} artículo${tt.count !== 1 ? "s" : ""}`
                  : "Sin datos"}
              </span>
            </div>
          )}
        </div>

        {/* ── Panel lateral de artículos ── */}
        <div style={{
          width: 360, flexShrink: 0, background: "#fff",
          borderLeft: `1px solid ${P.border}`,
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {/* Header del panel */}
          <div style={{
            padding: "12px 16px", background: P.navy, color: "#fff", flexShrink: 0,
          }}>
            <div style={{ fontFamily: "monospace", fontSize: "0.75rem", fontWeight: 700 }}>
              {selectedCountry ? `📄 ${selectedCountry.name}` : "📄 Artículos científicos"}
            </div>
            <div style={{ fontSize: "0.63rem", color: "rgba(255,255,255,.55)", marginTop: 3 }}>
              {selectedCountry
                ? `${selectedCountry.count.toLocaleString("es-AR")} artículo${selectedCountry.count !== 1 ? "s" : ""} · "${searchedPest}"`
                : searchedPest
                ? "Hacé clic en un país coloreado del mapa"
                : "Buscá una especie para comenzar"}
            </div>
          </div>

          {/* Lista de artículos */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>

            {/* Estado vacío inicial */}
            {!searchedPest && (
              <PlaceholderMsg
                icon="🌍"
                title="Mapa de literatura científica"
                body="Ingresá el nombre científico de una plaga o maleza. Los países se colorean según la cantidad de artículos publicados por investigadores de esa región."
              />
            )}

            {/* Instrucción post-búsqueda */}
            {searchedPest && !selectedCountry && !loading && (
              <PlaceholderMsg
                icon="🖱️"
                title="Seleccioná un país"
                body="Hacé clic en cualquier país coloreado del mapa para ver los artículos científicos de esa región."
              />
            )}

            {/* Cargando artículos */}
            {papersLoading && papers.length === 0 && (
              <PlaceholderMsg icon="⏳" title="Cargando artículos…" body="" />
            )}

            {/* Tarjetas de artículos */}
            {papers.map((paper, i) => (
              <PaperCard key={paper.id || i} paper={paper} />
            ))}

            {/* Botón cargar más */}
            {selectedCountry && papers.length > 0 && papers.length < papersTotal && (
              <button
                onClick={loadMore}
                disabled={papersLoading}
                style={{
                  width: "100%", padding: "9px", marginTop: 6, borderRadius: 7,
                  background: P.blueL, border: `1px solid ${P.border2}`,
                  color: P.blue, fontWeight: 700, fontSize: "0.76rem",
                  cursor: papersLoading ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}>
                {papersLoading
                  ? "Cargando…"
                  : `Cargar más (${papers.length} de ${papersTotal.toLocaleString("es-AR")})`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function PlaceholderMsg({ icon, title, body }) {
  return (
    <div style={{ textAlign: "center", padding: "36px 20px", color: P.txt3, lineHeight: 1.8 }}>
      <div style={{ fontSize: "2rem", marginBottom: 10, opacity: 0.35 }}>{icon}</div>
      {title && <div style={{ fontWeight: 700, color: P.txt2, fontFamily: "monospace", fontSize: "0.75rem", marginBottom: 6 }}>{title}</div>}
      {body && <div style={{ fontSize: "0.72rem", fontFamily: "monospace" }}>{body}</div>}
    </div>
  );
}

function PaperCard({ paper }) {
  const title   = paper.title || "Sin título";
  const year    = paper.publication_year || "—";
  const doi     = paper.doi?.replace("https://doi.org/", "");
  const journal = paper.primary_location?.source?.display_name || "";
  const isOA    = paper.open_access?.is_oa;
  const abstract = rebuildAbstract(paper.abstract_inverted_index);
  const auths   = (paper.authorships || []).slice(0, 3).map(a => a.author?.display_name).filter(Boolean).join("; ");
  const extra   = (paper.authorships || []).length > 3 ? ` +${paper.authorships.length - 3}` : "";

  return (
    <div style={{
      background: P.blueLL, border: `1px solid ${P.border}`, borderRadius: 8,
      padding: "11px 13px", marginBottom: 10,
    }}>
      <div style={{ fontFamily: "monospace", fontSize: "0.6rem", color: P.txt3, marginBottom: 3 }}>{year}</div>
      <div style={{ fontSize: "0.78rem", fontWeight: 700, color: P.navy, lineHeight: 1.4, marginBottom: 5 }}>{title}</div>
      {journal && (
        <div style={{ fontSize: "0.67rem", color: P.blue, fontStyle: "italic", marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {journal}
        </div>
      )}
      {auths && (
        <div style={{ fontSize: "0.63rem", color: P.txt3, marginBottom: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {auths}{extra}
        </div>
      )}
      {abstract && (
        <div style={{ fontSize: "0.67rem", color: P.txt2, lineHeight: 1.5, marginBottom: 7, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {abstract}
        </div>
      )}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {doi && (
          <a href={`https://doi.org/${doi}`} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: "0.62rem", padding: "3px 9px", borderRadius: 4, background: P.blueL, color: P.blue, textDecoration: "none", fontWeight: 700, border: `1px solid ${P.border2}` }}>
            ↗ DOI
          </a>
        )}
        {isOA && (
          <span style={{ fontSize: "0.62rem", padding: "3px 9px", borderRadius: 4, background: P.accentL, color: P.accent, fontWeight: 700, border: `1px solid ${P.accent}40` }}>
            Acceso Abierto
          </span>
        )}
      </div>
    </div>
  );
}
