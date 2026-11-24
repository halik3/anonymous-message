import { supabase, supabaseConfigured } from '../lib/supabase'

export async function submitMessage(content) {
  const cleaned = content.trim()
  if (!cleaned) throw new Error('Please write a message before sending.')
  if (cleaned.length > 1000) throw new Error('Messages must be 1000 characters or fewer.')
  if (!supabaseConfigured || !supabase) throw new Error('Supabase is not configured yet.')

  const { error } = await supabase.functions.invoke('submit-message', {
    body: { content: cleaned },
  })
  if (error) {
    const response = error.context
    if (response instanceof Response) {
      const payload = await response.json().catch(() => null)
      throw new Error(payload?.error || error.message)
    }
    throw error
  }
}

export async function fetchMessages() {
  if (!supabaseConfigured || !supabase) throw new Error('Supabase is not configured yet.')
  const { data, error } = await supabase
    .from('messages')
    .select('id, content, is_read, created_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function markMessageRead(id) {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('id', id)
  if (error) throw error
}

export async function deleteMessage(id) {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', id)
  if (error) throw error
}
