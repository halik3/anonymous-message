import Navbar from '../components/Navbar'
import MessageForm from '../components/MessageForm'

export default function Home() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="mx-auto flex w-full max-w-2xl flex-col px-5 pb-10 pt-10 sm:px-8 sm:pt-16">
        <header className="enter mb-8 text-center">
          <span className="mb-4 inline-flex rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
            Your honest inbox
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Send Me an
            <br />
            <span className="text-violet-400">Anonymous Message</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-zinc-400 sm:text-base">
            Share a thought, question, or compliment. No name or account needed.
          </p>
        </header>
        <MessageForm />
        <p className="mt-5 text-center text-xs leading-5 text-zinc-600">
          Infrastructure providers may retain technical logs. Anonymity cannot be guaranteed in absolute terms.
        </p>
      </main>
      <footer className="mx-auto w-full max-w-5xl px-5 py-6 text-center text-xs text-zinc-700 sm:px-8">
        Anonymous Message
      </footer>
    </div>
  )
}
