import { supabase } from "./supabase-client";

export { supabase } from "./supabase-client";

export function getDb() {
  return supabase;
}

export function closeDb() {
  // no-op with Supabase
}
