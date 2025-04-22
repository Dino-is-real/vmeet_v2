// This is a simplified service using localStorage with a timestamp-based approach
// In a production app, you would use a real database service

export interface Room {
  id: string
  name: string
  participants: number
  createdAt: number
  lastUpdated: number
}

class FirebaseService {
  private readonly STORAGE_KEY = "v-meet-rooms-global"
  private readonly SAMPLE_ROOMS: Room[] = [
    {
      id: "sample-room-1",
      name: "General Discussion",
      participants: 0,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    },
    {
      id: "sample-room-2",
      name: "Team Meeting",
      participants: 0,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    },
    {
      id: "sample-room-3",
      name: "Coffee Break",
      participants: 0,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    },
  ]

  constructor() {
    // Initialize with sample rooms if none exist
    this.initializeSampleRooms()
  }

  private initializeSampleRooms() {
    const existingRooms = this.getRooms()

    if (existingRooms.length === 0) {
      // Add sample rooms
      this.SAMPLE_ROOMS.forEach((room) => {
        this.addRoom(room)
      })
    }
  }

  // Get all rooms
  getRooms(): Room[] {
    try {
      const roomsJson = localStorage.getItem(this.STORAGE_KEY)
      const rooms = roomsJson ? JSON.parse(roomsJson) : []

      // Filter out rooms that haven't been updated in the last hour
      const oneHourAgo = Date.now() - 3600000
      return rooms.filter((room: Room) => room.lastUpdated > oneHourAgo)
    } catch (error) {
      console.error("Error getting rooms:", error)
      return []
    }
  }

  // Get a specific room by ID
  getRoom(roomId: string): Room | null {
    try {
      const rooms = this.getRooms()
      return rooms.find((room) => room.id === roomId) || null
    } catch (error) {
      console.error("Error getting room:", error)
      return null
    }
  }

  // Add a new room
  addRoom(room: Room): boolean {
    try {
      const rooms = this.getRooms()

      // Check if room already exists
      const existingRoomIndex = rooms.findIndex((r) => r.id === room.id)

      if (existingRoomIndex >= 0) {
        // Update existing room
        rooms[existingRoomIndex] = {
          ...rooms[existingRoomIndex],
          ...room,
          lastUpdated: Date.now(),
        }
      } else {
        // Add new room with current timestamp
        rooms.push({
          ...room,
          lastUpdated: Date.now(),
        })
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(rooms))

      // Broadcast a storage event to other tabs
      this.broadcastUpdate()

      return true
    } catch (error) {
      console.error("Error adding room:", error)
      return false
    }
  }

  // Delete a room
  deleteRoom(roomId: string): boolean {
    try {
      const rooms = this.getRooms()
      const updatedRooms = rooms.filter((room) => room.id !== roomId)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedRooms))

      // Broadcast a storage event to other tabs
      this.broadcastUpdate()

      return true
    } catch (error) {
      console.error("Error deleting room:", error)
      return false
    }
  }

  // Update room participants
  updateParticipants(roomId: string, delta: number): boolean {
    try {
      const rooms = this.getRooms()
      const roomIndex = rooms.findIndex((room) => room.id === roomId)

      if (roomIndex >= 0) {
        // Update participant count and timestamp
        rooms[roomIndex] = {
          ...rooms[roomIndex],
          participants: Math.max(0, rooms[roomIndex].participants + delta),
          lastUpdated: Date.now(),
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(rooms))

        // Broadcast a storage event to other tabs
        this.broadcastUpdate()

        return true
      }

      return false
    } catch (error) {
      console.error("Error updating participants:", error)
      return false
    }
  }

  // Broadcast an update to other tabs/windows
  private broadcastUpdate() {
    // Use a different storage key for broadcasting
    localStorage.setItem("v-meet-rooms-updated", Date.now().toString())
  }
}

export const firebaseService = new FirebaseService()
