"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import AgoraRTC, {
  type IAgoraRTCClient,
  type IAgoraRTCRemoteUser,
  type ICameraVideoTrack,
  type IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Mic, MicOff, VideoIcon, VideoOff, PhoneOff, Save, Trash2 } from "lucide-react"
import VideoPlayer from "@/components/video-player"
import { firebaseService } from "@/lib/firebase-service"

// Replace the placeholder APP_ID with the actual Agora App ID
const APP_ID = "a7ccc3388c164562b91908c12f7664fb"

export default function Room() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string
  const [username, setUsername] = useState("")
  const [users, setUsers] = useState<IAgoraRTCRemoteUser[]>([])
  const [notes, setNotes] = useState("")
  const [isMicOn, setIsMicOn] = useState(true)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [noteSaved, setNoteSaved] = useState(false)

  const client = useRef<IAgoraRTCClient | null>(null)
  const localTracks = useRef<{
    videoTrack: ICameraVideoTrack | null
    audioTrack: IMicrophoneAudioTrack | null
  }>({
    videoTrack: null,
    audioTrack: null,
  })

  useEffect(() => {
    // Get username from localStorage
    const storedUsername = localStorage.getItem("username")
    if (!storedUsername) {
      router.push("/lobby")
      return
    }
    setUsername(storedUsername)

    // Load saved notes for this room
    const savedNotes = localStorage.getItem(`notes-${roomId}`)
    if (savedNotes) {
      setNotes(savedNotes)
    }

    // Initialize Agora client
    client.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })

    // Join the channel
    const initializeAgora = async () => {
      try {
        // In a real app, you would generate a token from your server
        const uid = await client.current!.join(APP_ID, roomId, null, undefined)

        // Create and publish local tracks
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks()
        localTracks.current.audioTrack = audioTrack
        localTracks.current.videoTrack = videoTrack

        await client.current!.publish([audioTrack, videoTrack])

        // Listen for remote users
        client.current!.on("user-published", handleUserPublished)
        client.current!.on("user-left", handleUserLeft)

        // Update room participants count
        updateParticipantCount(1)

        // Set up interval to keep room active
        const keepAliveInterval = setInterval(() => {
          firebaseService.updateParticipants(roomId, 0) // Update timestamp without changing count
        }, 30000)

        return () => clearInterval(keepAliveInterval)
      } catch (error) {
        console.error("Error joining room:", error)
      }
    }

    initializeAgora()

    // Cleanup function
    return () => {
      localTracks.current.audioTrack?.close()
      localTracks.current.videoTrack?.close()
      client.current?.leave()

      // Decrease participant count when leaving
      updateParticipantCount(-1)
    }
  }, [roomId, router])

  // Update participant count
  const updateParticipantCount = (delta: number) => {
    firebaseService.updateParticipants(roomId, delta)
  }

  const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
    await client.current!.subscribe(user, mediaType)

    if (mediaType === "video") {
      setUsers((prevUsers) => {
        if (prevUsers.find((u) => u.uid === user.uid)) {
          return prevUsers.map((u) => (u.uid === user.uid ? user : u))
        }
        return [...prevUsers, user]
      })
    }

    if (mediaType === "audio") {
      user.audioTrack?.play()
    }
  }

  const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
    setUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid))
  }

  const toggleMic = async () => {
    if (localTracks.current.audioTrack) {
      await localTracks.current.audioTrack.setEnabled(!isMicOn)
      setIsMicOn(!isMicOn)
    }
  }

  const toggleCamera = async () => {
    if (localTracks.current.videoTrack) {
      await localTracks.current.videoTrack.setEnabled(!isCameraOn)
      setIsCameraOn(!isCameraOn)
    }
  }

  const leaveRoom = async () => {
    localTracks.current.audioTrack?.close()
    localTracks.current.videoTrack?.close()
    await client.current?.leave()

    // Decrease participant count when leaving
    updateParticipantCount(-1)

    router.push("/lobby")
  }

  const saveNotes = () => {
    localStorage.setItem(`notes-${roomId}`, notes)
    setNoteSaved(true)

    // Reset the saved indicator after 2 seconds
    setTimeout(() => {
      setNoteSaved(false)
    }, 2000)
  }

  const clearNotes = () => {
    setNotes("")
    localStorage.removeItem(`notes-${roomId}`)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <header className="bg-slate-800 py-4 px-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Room: {roomId}</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-300">Logged in as: {username}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Local Video */}
            <div className="relative bg-slate-800 rounded-lg overflow-hidden aspect-video">
              {localTracks.current.videoTrack && <VideoPlayer videoTrack={localTracks.current.videoTrack} />}
              <div className="absolute bottom-2 left-2 bg-slate-900 bg-opacity-70 px-2 py-1 rounded text-sm">
                {username} (You)
              </div>
            </div>

            {/* Remote Videos */}
            {users.map((user) => (
              <div key={user.uid} className="relative bg-slate-800 rounded-lg overflow-hidden aspect-video">
                {user.videoTrack && <VideoPlayer videoTrack={user.videoTrack} />}
                <div className="absolute bottom-2 left-2 bg-slate-900 bg-opacity-70 px-2 py-1 rounded text-sm">
                  User {user.uid}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Notes Area */}
        <div className="w-full md:w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <h2 className="font-bold">Personal Notes</h2>
            <p className="text-xs text-slate-400 mt-1">Only visible to you. These notes will be saved for this room.</p>
          </div>

          <div className="flex-1 p-4 flex flex-col">
            <Textarea
              placeholder="Type your personal notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex-1 min-h-[200px] bg-slate-700 border-slate-600 resize-none"
            />

            <div className="flex justify-between mt-4">
              <Button variant="outline" size="sm" onClick={clearNotes} className="border-slate-600 hover:bg-slate-600">
                <Trash2 className="h-4 w-4 mr-2" /> Clear
              </Button>

              <Button onClick={saveNotes} size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                {noteSaved ? "Saved!" : "Save Notes"}
              </Button>
            </div>

            {noteSaved && <div className="text-center text-green-400 text-sm mt-2">Notes saved successfully!</div>}
          </div>
        </div>
      </main>

      {/* Control Bar */}
      <footer className="bg-slate-800 py-4 px-6 border-t border-slate-700">
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant={isMicOn ? "default" : "destructive"}
            size="lg"
            className="rounded-full h-12 w-12 p-0"
            onClick={toggleMic}
          >
            {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>

          <Button
            variant={isCameraOn ? "default" : "destructive"}
            size="lg"
            className="rounded-full h-12 w-12 p-0"
            onClick={toggleCamera}
          >
            {isCameraOn ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>

          <Button variant="destructive" size="lg" className="rounded-full h-12 w-12 p-0" onClick={leaveRoom}>
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </footer>
    </div>
  )
}
