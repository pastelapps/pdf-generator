import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Tenant } from './tenant-db.js';

const clientCache = new Map<string, SupabaseClient>();

export function getSupabaseClient(tenant: Tenant): SupabaseClient {
  const cacheKey = `${tenant.supabase_url}:${tenant.supabase_key}`;

  let client = clientCache.get(cacheKey);
  if (!client) {
    client = createClient(tenant.supabase_url, tenant.supabase_key);
    clientCache.set(cacheKey, client);
  }

  return client;
}
