"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Video, Users, Plus, Trash2, RefreshCw, LogIn } from "lucide-react"
import { firebaseService, type Room } from "@/lib/firebase-service"

export default function Lobby() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [rooms, setRooms] = useState<Room[]>([])
  const [newRoomName, setNewRoomName] = useState("")
  const [roomIdToJoin, setRoomIdToJoin] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Load rooms on component mount and set up polling
  useEffect(() => {
    loadRooms()

    // Poll for room updates every 3 seconds
    const interval = setInterval(loadRooms, 3000)

    // Listen for storage events from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "v-meet-rooms-updated") {
        loadRooms()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      clearInterval(interval)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const loadRooms = () => {
    setRooms(firebaseService.getRooms())
    setIsLoading(false)
  }

  const createRoom = () => {
    if (!newRoomName.trim()) {
      setError("Please enter a room name")
      return
    }

    setError("")
    const newRoom: Room = {
      id: uuidv4(),
      name: newRoomName,
      participants: 0,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    }

    if (firebaseService.addRoom(newRoom)) {
      setRooms([...rooms, newRoom])
      setNewRoomName("")
    }
  }

  const deleteRoom = (id: string) => {
    // Don't allow deletion of sample rooms
    if (id.startsWith("sample-room-")) {
      setError("Sample rooms cannot be deleted")
      return
    }

    setError("")
    if (firebaseService.deleteRoom(id)) {
      setRooms(rooms.filter((room) => room.id !== id))
    }
  }

  const joinRoom = (roomId: string) => {
    if (!username.trim()) {
      setError("Please enter your username")
      return
    }

    setError("")
    // Store username in localStorage for use in the room
    localStorage.setItem("username", username)

    // Update participant count
    firebaseService.updateParticipants(roomId, 1)

    router.push(`/room/${roomId}`)
  }

  const joinRoomById = () => {
    if (!username.trim()) {
      setError("Please enter your username")
      return
    }

    if (!roomIdToJoin.trim()) {
      setError("Please enter a room ID")
      return
    }

    setError("")
    // Store username in localStorage for use in the room
    localStorage.setItem("username", username)

    // Check if room exists
    const room = firebaseService.getRoom(roomIdToJoin)
    if (room) {
      // Update participant count
      firebaseService.updateParticipants(roomIdToJoin, 1)
    } else {
      // Create the room if it doesn't exist
      const newRoom: Room = {
        id: roomIdToJoin,
        name: `Room ${roomIdToJoin.substring(0, 8)}...`,
        participants: 1,
        createdAt: Date.now(),
        lastUpdated: Date.now(),
      }
      firebaseService.addRoom(newRoom)
    }

    router.push(`/room/${roomIdToJoin}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-2">Welcome to V-Meet</h1>
        <p className="text-slate-300 mb-8">Join an existing room or create a new one</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription className="text-slate-400">Enter your name to join a room</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter your name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>

                <div className="space-y-2 pt-4">
                  <Label htmlFor="roomId">Join by Room ID</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="roomId"
                      placeholder="Enter room ID"
                      value={roomIdToJoin}
                      onChange={(e) => setRoomIdToJoin(e.target.value)}
                      className="bg-slate-700 border-slate-600"
                    />
                    <Button onClick={joinRoomById} className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                      <LogIn className="h-4 w-4 mr-2" /> Join
                    </Button>
                  </div>
                </div>

                {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 md:col-span-2 bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Available Rooms</CardTitle>
                <CardDescription className="text-slate-400">Join an existing room or create a new one</CardDescription>
              </div>
              <Button variant="outline" size="icon" className="border-slate-600 hover:bg-slate-600" onClick={loadRooms}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">Loading rooms...</div>
                ) : rooms.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">No rooms available. Create one below!</div>
                ) : (
                  rooms.map((room) => (
                    <div key={room.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-center">
                        <Video className="h-5 w-5 mr-3 text-blue-400" />
                        <div>
                          <h3 className="font-medium">{room.name}</h3>
                          <p className="text-sm text-slate-400 flex items-center">
                            <Users className="h-3 w-3 mr-1" /> {room.participants} participants
                          </p>
                          <p className="text-xs text-slate-500 mt-1">ID: {room.id}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-600 hover:bg-slate-600"
                          onClick={() => joinRoom(room.id)}
                        >
                          Join
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteRoom(room.id)}
                          disabled={room.id.startsWith("sample-room-")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-slate-700 pt-4">
              <Input
                placeholder="New room name"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="bg-slate-700 border-slate-600 mr-2"
              />
              <Button onClick={createRoom} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" /> Create Room
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
