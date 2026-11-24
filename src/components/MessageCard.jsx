import { Check, Trash2, Clock3 } from 'lucide-react'

export default function MessageCard({ message, onRead, onDelete, busy }) {
  const date = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(message.created_at))

  return (
    <article className="glass-card enter rounded-2xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <span className={`rounded-full px-2.5 py-1 text-xs ${message.is_read ? 'bg-zinc-800 text-zinc-400' : 'bg-violet-500/15 text-violet-300'}`}>
          {message.is_read ? 'Read' : 'Unread'}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-zinc-600">
          <Clock3 size={13} /> {date}
        </span>
      </div>
      <p className="mt-4 whitespace-pre-wrap break-words text-[15px] leading-7 text-zinc-200">{message.content}</p>
      <div className="mt-5 flex justify-end gap-2">
        {!message.is_read && (
          <button type="button" disabled={busy} onClick={() => onRead(message.id)} className="flex items-center gap-2 rounded-xl border border-zinc-800 px-3 py-2 text-xs text-zinc-400 transition hover:border-emerald-500/30 hover:text-emerald-300 disabled:opacity-50">
            <Check size={15} /> Mark read
          </button>
        )}
        <button type="button" disabled={busy} onClick={() => onDelete(message.id)} className="flex items-center gap-2 rounded-xl border border-zinc-800 px-3 py-2 text-xs text-zinc-400 transition hover:border-red-500/30 hover:text-red-300 disabled:opacity-50">
          <Trash2 size={15} /> Delete
        </button>
      </div>
    </article>
  )
}
