import { useEffect, useState } from 'react'
import { Inbox, MailOpen, MessageCircleMore, LogOut, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { deleteMessage, fetchMessages, markMessageRead } from '../services/messageService'
import MessageCard from '../components/MessageCard'

export default function Dashboard() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  async function loadMessages() {
    setLoading(true)
    setError('')
    try {
      setMessages(await fetchMessages())
    } catch (loadError) {
      setError(loadError.message || 'Could not load messages.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [])

  async function handleRead(id) {
    setBusyId(id)
    try {
      await markMessageRead(id)
      setMessages((current) => current.map((message) => message.id === id ? { ...message, is_read: true } : message))
    } catch (readError) {
      setError(readError.message || 'Could not mark the message as read.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this anonymous message?')) return
    setBusyId(id)
    try {
      await deleteMessage(id)
      setMessages((current) => current.filter((message) => message.id !== id))
    } catch (deleteError) {
      setError(deleteError.message || 'Could not delete the message.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  const unreadCount = messages.filter((message) => !message.is_read).length

  return (
    <div className="app-shell min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-zinc-900 bg-zinc-950/70 px-5 py-6 md:flex md:flex-col">
        <div className="flex items-center gap-2 font-semibold text-white">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-500/15 text-violet-400"><MessageCircleMore size={18} /></span>
          Anonymous
        </div>
        <nav className="mt-8">
          <div className="flex items-center gap-3 rounded-xl bg-violet-500/10 px-3 py-3 text-sm text-violet-300"><Inbox size={17} /> Inbox</div>
        </nav>
        <button type="button" onClick={handleLogout} className="mt-auto flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-500 transition hover:bg-zinc-900 hover:text-white"><LogOut size={17} /> Logout</button>
      </aside>

      <main className="mx-auto max-w-5xl px-5 py-6 md:ml-64 md:px-8 md:py-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-xs text-emerald-400"><ShieldCheck size={14} /> Admin session</p>
            <h1 className="mt-1 text-2xl font-semibold text-white">Inbox</h1>
          </div>
          <button type="button" onClick={handleLogout} className="flex items-center gap-2 rounded-xl border border-zinc-800 px-3 py-2 text-sm text-zinc-400 md:hidden"><LogOut size={16} /> Logout</button>
        </header>

        <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="glass-card rounded-2xl p-4"><p className="text-xs text-zinc-500">Total messages</p><p className="mt-2 text-3xl font-semibold text-white">{messages.length}</p></div>
          <div className="glass-card rounded-2xl p-4"><p className="text-xs text-zinc-500">Unread</p><p className="mt-2 text-3xl font-semibold text-violet-400">{unreadCount}</p></div>
          <div className="glass-card hidden rounded-2xl p-4 sm:block"><p className="text-xs text-zinc-500">Read</p><p className="mt-2 text-3xl font-semibold text-zinc-300">{messages.length - unreadCount}</p></div>
        </section>

        {error && <div role="alert" className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
        {loading ? (
          <div className="mt-8 flex items-center gap-3 text-sm text-zinc-500"><span className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" /> Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="glass-card mt-8 grid min-h-64 place-items-center rounded-2xl text-center"><div><MailOpen className="mx-auto text-zinc-700" size={32} /><h2 className="mt-3 font-medium text-zinc-300">Inbox is empty</h2><p className="mt-1 text-sm text-zinc-600">New anonymous messages will appear here.</p></div></div>
        ) : (
          <div className="mt-8 space-y-3">
            {messages.map((message) => <MessageCard key={message.id} message={message} busy={busyId === message.id} onRead={handleRead} onDelete={handleDelete} />)}
          </div>
        )}
      </main>
    </div>
  )
}
