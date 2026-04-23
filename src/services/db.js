import { sbClient } from '../lib/supabase';

// ── Fichas ─────────────────────────────────────────────────────────────────────

export async function dbLoadFichas() {
  const sb = sbClient();
  if (!sb) throw new Error('no_config');
  const { data, error } = await sb
    .from('fichas')
    .select('id, datos')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(r => ({ ...r.datos, id: r.id }));
}

export async function dbUpsertFicha(ficha) {
  const sb = sbClient();
  if (!sb) return;
  const { error } = await sb.from('fichas').upsert({
    id: String(ficha.id),
    nombre_cientifico: ficha.nombre_cientifico || '',
    nombre_vulgar: ficha.nombre_vulgar || '',
    datos: ficha,
  });
  if (error) throw error;
}

export async function dbDeleteFicha(id) {
  const sb = sbClient();
  if (!sb) return;
  const { error } = await sb.from('fichas').delete().eq('id', String(id));
  if (error) throw error;
}

export async function dbSyncFichas(fichas) {
  const sb = sbClient();
  if (!sb) return;
  const rows = fichas.map(f => ({
    id: String(f.id),
    nombre_cientifico: f.nombre_cientifico || '',
    nombre_vulgar: f.nombre_vulgar || '',
    datos: f,
  }));
  // Upsert en lotes de 50
  for (let i = 0; i < rows.length; i += 50) {
    const { error } = await sb.from('fichas').upsert(rows.slice(i, i + 50));
    if (error) throw error;
  }
}

// ── Search Sets ───────────────────────────────────────────────────────────────

export async function dbLoadSets() {
  const sb = sbClient();
  if (!sb) throw new Error('no_config');
  const { data, error } = await sb
    .from('search_sets')
    .select('*')
    .order('creado_el', { ascending: false });
  if (error) throw error;
  return (data || []).map(r => ({
    id: r.id,
    params: r.params,
    articulos: r.articulos || [],
    estado: r.estado || 'ok',
    error: r.error_msg,
    creadoEl: r.creado_el,
  }));
}

export async function dbUpsertSet(set) {
  const sb = sbClient();
  if (!sb) return;
  const { error } = await sb.from('search_sets').upsert({
    id: set.id,
    params: set.params,
    articulos: set.articulos || [],
    estado: set.estado || 'ok',
    error_msg: set.error || null,
    creado_el: set.creadoEl,
  });
  if (error) throw error;
}

export async function dbDeleteSet(id) {
  const sb = sbClient();
  if (!sb) return;
  const { error } = await sb.from('search_sets').delete().eq('id', id);
  if (error) throw error;
}

export async function dbDeleteAllSets() {
  const sb = sbClient();
  if (!sb) return;
  const { error } = await sb.from('search_sets').delete().neq('id', '');
  if (error) throw error;
}
