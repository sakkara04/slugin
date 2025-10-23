import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dmppqffyzkcxfjebltps.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtcHBxZmZ5emtjeGZqZWJsdHBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTU5MjIsImV4cCI6MjA3NjEzMTkyMn0.2uGl5Mld_KuG3_2-CbQtOU8giDaOxbxFtLerYxWseIo'

export const supabase = createClient(supabaseUrl, supabaseKey)