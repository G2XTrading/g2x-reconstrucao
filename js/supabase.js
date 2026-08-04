import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://nzfpjmhfvngvxaelktys.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_f8hvUVfiH7XUehUjnotk6g_l-6RNOV-";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);