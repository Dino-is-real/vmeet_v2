"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import type { ILocalVideoTrack, IRemoteVideoTrack } from "agora-rtc-sdk-ng"

interface VideoPlayerProps {
  videoTrack: ILocalVideoTrack | IRemoteVideoTrack
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoTrack }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!videoTrack) return
    if (!ref.current) return

    videoTrack.play(ref.current)

    return () => {
      videoTrack.stop()
    }
  }, [videoTrack])

  return (
    <div ref={ref} className="h-full w-full bg-slate-700">
      {/* Video will be rendered here by Agora */}
    </div>
  )
}

export default VideoPlayer
