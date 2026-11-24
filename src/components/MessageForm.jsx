import { useState } from 'react'
import { Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { submitMessage } from '../services/messageService'

export default function MessageForm() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    setNotice(null)
    if (!content.trim()) {
      setNotice({ type: 'error', text: 'Please write a message before sending.' })
      return
    }

    setLoading(true)
    try {
      await submitMessage(content)
      setContent('')
      setNotice({ type: 'success', text: 'Your anonymous message was sent.' })
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'Could not send your message.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card enter rounded-3xl p-4 sm:p-6">
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        maxLength={1000}
        rows={7}
        placeholder="Write something honest..."
        aria-label="Anonymous message"
        className="violet-ring w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-4 text-[15px] leading-7 text-white placeholder:text-zinc-600"
      />
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className={`text-xs ${content.length === 1000 ? 'text-violet-400' : 'text-zinc-500'}`}>
          {content.length} / 1000
        </span>
        <button type="submit" disabled={loading} className="flex min-w-36 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Send size={16} />}
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </div>
      {notice && (
        <div role="status" className={`mt-4 flex items-start gap-2 rounded-xl border px-3 py-3 text-sm ${notice.type === 'success' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-red-500/20 bg-red-500/10 text-red-300'}`}>
          {notice.type === 'success' ? <CheckCircle2 size={17} className="mt-0.5 shrink-0" /> : <AlertCircle size={17} className="mt-0.5 shrink-0" />}
          {notice.text}
        </div>
      )}
    </form>
  )
}
