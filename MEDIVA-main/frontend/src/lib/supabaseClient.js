import { createClient } from "@supabase/supabase-js";

// MEDIVA AI — live Supabase project (client-side anon key is public by design)
export const SUPABASE_URL = "https://hprajleorpfbypjjyddt.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcmFqbGVvcnBmYnlwamp5ZGR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NDQ0MjYsImV4cCI6MjEwNTEyMDQyNn0.gcN_KUb9TFAof3Ipf7Dd0HKkaWHgDnraf_2j0gSwadY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "mediva-auth",
  },
});

export const WOUND_BUCKET = "wound-photos";
