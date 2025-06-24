import { createClient } from '@supabase/supabase-js'

// You'll need to replace these with your actual Supabase credentials
// Get these from https://supabase.com/dashboard after creating a project
const supabaseUrl = "https://vybulagplvpqvvhoqffp.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5YnVsYWdwbHZwcXZ2aG9xZmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODY0NTMsImV4cCI6MjA2NjM2MjQ1M30.gCE4azXYneSacdQAYxWP06asMQh8c_Mort2_pD6yEdE"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cloud storage functions
async function getKey(key) {
  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('value')
      .eq('user_id', key)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching data:', error)
      return null
    }
    
    return data?.value || null
  } catch (error) {
    console.error('Error in getKey:', error)
    return null
  }
}

async function saveKey(key, value) {
  try {
    const { error } = await supabase
      .from('user_data')
      .upsert({
        user_id: key,
        value: value,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
    
    if (error) {
      console.error('Error saving data:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in saveKey:', error)
    throw error
  }
}

async function dropKeys() {
  try {
    const { error } = await supabase
      .from('user_data')
      .delete()
      .neq('user_id', '') // Delete all records
    
    if (error) {
      console.error('Error dropping keys:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in dropKeys:', error)
    throw error
  }
}

export {
  getKey,
  saveKey,
  dropKeys
} 