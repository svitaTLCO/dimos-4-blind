"use client"

import { useState } from "react"
import { TopAppBar, GuidedStepCard, AudioControls, ProgressBand } from "@/components/echospace"
import { cn } from "@/lib/utils"
import type { Place } from "@/lib/types"

interface GuidedTourScreenProps {
  place: Place
  onBack: () => void
}

interface TourStep {
  id: string
  title: string
  description: string
  safetyNote?: string
  roomId: string
}

export function GuidedTourScreen({ place, onBack }: GuidedTourScreenProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // Generate tour steps from place data
  const tourSteps: TourStep[] = place.rooms
    .filter((room) => room.scanComplete)
    .flatMap((room) => {
      const steps: TourStep[] = [
        {
          id: `${room.id}-intro`,
          title: room.name,
          description: room.description || `You are entering ${room.name}.`,
          safetyNote: room.hazards.length > 0
            ? `Caution: ${room.hazards.map((h) => h.name).join(", ")}`
            : undefined,
          roomId: room.id,
        },
      ]

      // Add landmark steps
      room.landmarks.slice(0, 2).forEach((landmark) => {
        steps.push({
          id: `${room.id}-${landmark.id}`,
          title: landmark.name,
          description: landmark.description || `Landmark: ${landmark.name}`,
          roomId: room.id,
        })
      })

      // Add connection step
      if (room.connections.length > 0) {
        const connectedRoomNames = room.connections
          .map((c) => place.rooms.find((r) => r.id === c.roomId)?.name)
          .filter(Boolean)
          .join(", ")

        steps.push({
          id: `${room.id}-connections`,
          title: "Connected Rooms",
          description: `From here you can go to: ${connectedRoomNames}`,
          roomId: room.id,
        })
      }

      return steps
    })

  const currentStep = tourSteps[currentStepIndex]
  const progress = ((currentStepIndex + 1) / tourSteps.length) * 100

  const goToNext = () => {
    if (currentStepIndex < tourSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1)
    }
  }

  const goToPrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopAppBar
        title="Guided Tour"
        subtitle={place.name}
        showBack
        onBack={onBack}
      />

      <div className="flex flex-1 flex-col gap-6 px-5 py-6">
        {/* Progress */}
        <ProgressBand
          value={currentStepIndex + 1}
          max={tourSteps.length}
          label={`Step ${currentStepIndex + 1} of ${tourSteps.length}`}
          showPercentage={false}
          variant={progress === 100 ? "success" : "default"}
        />

        {/* Current Step */}
        {currentStep && (
          <GuidedStepCard
            stepNumber={currentStepIndex + 1}
            totalSteps={tourSteps.length}
            title={currentStep.title}
            description={currentStep.description}
            safetyNote={currentStep.safetyNote}
            isActive={true}
          />
        )}

        {/* Step List */}
        <div className="flex-1 overflow-auto">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground px-1">
            Tour Steps
          </h2>
          <div className="flex flex-col gap-2">
            {tourSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStepIndex(index)}
                className={cn(
                  "flex items-center gap-3 rounded-xl p-3 text-left transition-colors",
                  "min-h-[56px] touch-manipulation",
                  index === currentStepIndex
                    ? "bg-primary/10 border border-primary/20"
                    : index < currentStepIndex
                      ? "bg-success/5 border border-success/10"
                      : "bg-card border border-border hover:bg-accent"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                    index === currentStepIndex && "bg-primary text-primary-foreground",
                    index < currentStepIndex && "bg-success text-success-foreground",
                    index > currentStepIndex && "bg-muted text-muted-foreground"
                  )}
                >
                  {index < currentStepIndex ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium truncate",
                    index === currentStepIndex && "text-foreground",
                    index < currentStepIndex && "text-success",
                    index > currentStepIndex && "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex flex-col gap-4 pt-2">
          <AudioControls
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onRestart={() => {
              setCurrentStepIndex(0)
              setIsPlaying(true)
            }}
            label="Tour audio controls"
          />

          {/* Navigation */}
          <div className="flex gap-3">
            <button
              onClick={goToPrevious}
              disabled={currentStepIndex === 0}
              className={cn(
                "flex-1 rounded-xl border border-border bg-card py-3.5 text-base font-medium",
                "transition-colors hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              Previous
            </button>
            <button
              onClick={goToNext}
              disabled={currentStepIndex === tourSteps.length - 1}
              className={cn(
                "flex-1 rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground",
                "transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              {currentStepIndex === tourSteps.length - 1 ? "Complete" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
