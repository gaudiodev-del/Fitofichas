import { createClient } from '@supabase/supabase-js';

const LS_URL = '_sb_url';
const LS_KEY = '_sb_key';

let _client = null;

export function sbConfig() {
  return {
    url: import.meta.env.VITE_SUPABASE_URL || localStorage.getItem(LS_URL) || '',
    key: import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem(LS_KEY) || '',
  };
}

export function sbSetConfig(url, key) {
  localStorage.setItem(LS_URL, url.trim());
  localStorage.setItem(LS_KEY, key.trim());
  _client = null;
}

export function sbClearConfig() {
  localStorage.removeItem(LS_URL);
  localStorage.removeItem(LS_KEY);
  _client = null;
}

export function sbClient() {
  const { url, key } = sbConfig();
  if (!url || !key) return null;
  if (!_client) _client = createClient(url, key);
  return _client;
}

export const sbReady = () => {
  const { url, key } = sbConfig();
  return Boolean(url && key);
};
