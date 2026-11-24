import { Link } from 'react-router-dom'
import { LockKeyhole, MessageCircleMore } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-6 sm:px-8">
      <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-white">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-violet-500/15 text-violet-400">
          <MessageCircleMore size={17} />
        </span>
        Anonymous
      </Link>
      <Link to="/login" className="flex items-center gap-2 rounded-xl border border-zinc-800 px-3 py-2 text-sm text-zinc-400 transition hover:border-zinc-700 hover:text-white">
        <LockKeyhole size={15} />
        Admin
      </Link>
    </nav>
  )
}
