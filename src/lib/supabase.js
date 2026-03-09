import { createClient } from '@supabase/supabase-js'

// Les variables d'env sont préfixées VITE_ pour être accessibles dans Vue
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// On vérifie que les variables sont bien définies
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables Supabase manquantes dans .env.local')
}

// On crée et exporte le client — sera importé dans tous les stores
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
