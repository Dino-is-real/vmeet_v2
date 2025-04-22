import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <header className="container mx-auto py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">V-Meet</h1>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link href="/" className="hover:text-blue-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-400 transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container mx-auto flex-1 flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-5xl font-bold mb-6">Connect with anyone, anywhere</h2>
        <p className="text-xl text-slate-300 max-w-2xl mb-10">
          High-quality video calls with real-time chat. No downloads required, just create a room and share the link.
        </p>
        <Link href="/lobby">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-full">
            Start a Meeting <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </main>

      <footer className="container mx-auto py-6 text-center text-slate-400">
        <p>© 2025 V-Meet. All rights reserved.</p>
      </footer>
    </div>
  )
}
