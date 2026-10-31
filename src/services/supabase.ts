import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://fjopekgbhvfneqhawalh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_CE7qXx24FSYoEMew9SSgrg_E1JGgVSB";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
