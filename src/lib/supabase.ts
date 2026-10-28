import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. See .env.example.");
}

// With RLS on and no policies, the publishable/anon key is rejected (error 42501), so refuse it up front.
const role = key.startsWith("eyJ") ? JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString()).role : "";
if (key.startsWith("sb_publishable_") || role === "anon") {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is the publishable/anon key. Use the secret key (sb_secret_...).");
}

// Server-only client: RLS is on with no policies, so this key is the only way in.
export const supabase = createClient(url, key, { auth: { persistSession: false } });
