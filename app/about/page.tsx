import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function About() {
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

      <main className="container mx-auto flex-1 px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">About V-Meet</h2>

          <div className="space-y-6 text-slate-300">
            <p>
              V-Meet is a modern video conferencing platform designed to provide seamless communication for teams,
              friends, and families. Our mission is to make virtual meetings as effective and personal as face-to-face
              interactions.
            </p>

            <h3 className="text-2xl font-semibold text-white mt-8">Key Features</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>High-quality video and audio calls with multiple participants</li>
              <li>Real-time chat messaging during meetings</li>
              <li>Simple room creation and management</li>
              <li>Camera and microphone controls</li>
              <li>No downloads required - works directly in your browser</li>
              <li>Modern, intuitive interface</li>
            </ul>

            <h3 className="text-2xl font-semibold text-white mt-8">Technology</h3>
            <p>V-Meet is built using cutting-edge web technologies:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Next.js and React for the frontend</li>
              <li>Agora.io SDK for real-time video and audio communication</li>
              <li>Tailwind CSS for modern, responsive design</li>
              <li>Deployed on Vercel for optimal performance</li>
            </ul>

            <h3 className="text-2xl font-semibold text-white mt-8">Our Vision</h3>
            <p>
              We believe that communication should be accessible to everyone, everywhere. V-Meet aims to break down
              barriers and connect people regardless of their location, providing tools that enable meaningful
              conversations and collaboration.
            </p>

            <div className="mt-12">
              <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="container mx-auto py-6 text-center text-slate-400">
        <p>© 2025 V-Meet. All rights reserved.</p>
      </footer>
    </div>
  )
}
