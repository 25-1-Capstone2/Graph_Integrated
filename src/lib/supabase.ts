// src/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Supabase URL이나 키가 없으면 오류를 발생시킵니다.
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or Key is missing!')
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey)

export default supabase
  