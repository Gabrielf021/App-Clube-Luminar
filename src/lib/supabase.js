import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://zuikkaipvfrmetxdlhaw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1aWtrYWlwdmZybWV0eGRsaGF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NDUwMTYsImV4cCI6MjA4ODQyMTAxNn0.gPetzRdgcg4zF-fiPWs5HM_tEPxUzetsxwdq1jP1G4w'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
