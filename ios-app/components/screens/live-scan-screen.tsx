"use client"

import { useEffect, useRef, useState } from "react"
import { ProgressBand, ScanGuidance, RoomChip } from "@/components/echospace"
import { Button } from "@/components/ui/button"
import { Pause, Play, Check, Mic, X } from "lucide-react"

interface LiveScanScreenProps {
  onBack: () => void
  onFinish: () => void
}

type GuidanceType = "move-slower" | "look-corners" | "door-detected" | "furniture-detected" | "need-coverage" | "good-progress" | "almost-done"

export function LiveScanScreen({ onBack, onFinish }: LiveScanScreenProps) {
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentGuidance, setCurrentGuidance] = useState<GuidanceType>("look-corners")
  const [rooms, setRooms] = useState([{ id: "1", name: "Room 1", complete: false }])
  const [cameraError, setCameraError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    let cancelled = false
    let stream: MediaStream | null = null

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        })
        if (cancelled || !videoRef.current) return
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      } catch (error) {
        setCameraError(error instanceof Error ? error.message : "Failed to access camera")
      }
    }

    void startCamera()

    return () => {
      cancelled = true
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 1, 100))
    }, 250)

    return () => clearInterval(interval)
  }, [isPaused])

  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.readyState < 2) return

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.drawImage(video, 0, 0)

      const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.65)
      const base64 = jpegDataUrl.split(",")[1]
      const roomId = rooms[rooms.length - 1]?.id ?? "1"

      void fetch("/api/scan/frame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_b64: base64,
          format: "RGB",
          frame_id: "ios_camera",
          room_id: roomId,
          guidance_hint: currentGuidance,
          ts: Date.now() / 1000,
        }),
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPaused, rooms, currentGuidance])

  const handleCompleteRoom = () => {
    setRooms((prev) => [...prev.slice(0, -1), { ...prev[prev.length - 1], complete: true }, { id: String(prev.length + 1), name: `Room ${prev.length + 1}`, complete: false }])
    setProgress(0)
    setCurrentGuidance("good-progress")
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-foreground">
      <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative z-10 flex flex-col gap-4 p-5 pt-safe bg-black/30">
        <div className="flex items-center justify-between">
          <button onClick={onBack} aria-label="Cancel scan" className="flex h-11 w-11 items-center justify-center rounded-full bg-background/20 text-background backdrop-blur-md">
            <X className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            {rooms.map((room) => (
              <RoomChip key={room.id} name={room.name} isComplete={room.complete} isActive={!room.complete} className="bg-background/20 backdrop-blur-md border-background/30 text-background" />
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-background/20 p-4 backdrop-blur-md">
          <ProgressBand value={progress} label="Room Coverage" variant={progress > 80 ? "success" : "default"} />
          {cameraError ? <p className="mt-2 text-sm text-red-200">Camera error: {cameraError}</p> : null}
        </div>

        <div className="flex justify-center">
          <ScanGuidance type={currentGuidance} />
        </div>
      </div>

      <div className="relative z-10 mt-auto p-5 pb-safe bg-black/30">
        <div className="flex items-center justify-between gap-4">
          <Button onClick={() => setIsPaused(!isPaused)} variant="secondary" size="lg" className="h-14 flex-1 rounded-xl gap-2" aria-label={isPaused ? "Resume scan" : "Pause scan"}>
            {isPaused ? <><Play className="h-5 w-5" />Resume</> : <><Pause className="h-5 w-5" />Pause</>}
          </Button>
          <Button onClick={handleCompleteRoom} disabled={progress < 60} size="lg" className="h-14 flex-1 rounded-xl gap-2">
            <Check className="h-5 w-5" />Finish Room
          </Button>
          <button aria-label="Add voice note" className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
            <Mic className="h-6 w-6" />
          </button>
        </div>

        {rooms.filter((r) => r.complete).length > 0 && (
          <Button onClick={onFinish} variant="outline" size="lg" className="mt-4 w-full h-14 rounded-xl bg-background/20 backdrop-blur-md border-background/30 text-background hover:bg-background/30">
            Finish All Rooms ({rooms.filter((r) => r.complete).length} complete)
          </Button>
        )}
      </div>
    </div>
  )
}
