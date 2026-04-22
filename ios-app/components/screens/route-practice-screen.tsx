"use client"

import { useState } from "react"
import { TopAppBar, RouteStepCard, ProgressBand } from "@/components/echospace"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Route } from "@/lib/types"

interface RoutePracticeScreenProps {
  route: Route
  onBack: () => void
}

export function RoutePracticeScreen({ route, onBack }: RoutePracticeScreenProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isComplete, setIsComplete] = useState(false)

  const currentStep = route.steps[currentStepIndex]
  const progress = ((currentStepIndex + 1) / route.steps.length) * 100

  const goToNext = () => {
    if (currentStepIndex < route.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1)
    } else {
      setIsComplete(true)
    }
  }

  const goToPrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1)
    }
  }

  const handleRepeat = () => {
    // Trigger audio repeat
    if (navigator.vibrate) {
      navigator.vibrate(30)
    }
  }

  const handleRestart = () => {
    setCurrentStepIndex(0)
    setIsComplete(false)
  }

  if (isComplete) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <TopAppBar
          title="Route Complete"
          showBack
          onBack={onBack}
        />

        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-12 w-12 text-success" />
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold">Route Practiced!</h2>
            <p className="mt-2 text-base text-muted-foreground">
              You have completed the {route.name} route
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
            <Button
              onClick={handleRestart}
              size="lg"
              className="w-full h-14 rounded-xl"
            >
              Practice Again
            </Button>
            <Button
              onClick={onBack}
              size="lg"
              variant="outline"
              className="w-full h-14 rounded-xl"
            >
              Back to Routes
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopAppBar
        title={route.name}
        subtitle={route.estimatedTime}
        showBack
        onBack={onBack}
        rightAction={
          <button
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            aria-label={isAudioEnabled ? "Mute audio" : "Enable audio"}
            className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-accent"
          >
            {isAudioEnabled ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        }
      />

      <div className="flex flex-1 flex-col gap-6 px-5 py-6">
        {/* Progress */}
        <ProgressBand
          value={currentStepIndex + 1}
          max={route.steps.length}
          label="Route Progress"
          variant={progress > 80 ? "success" : "default"}
        />

        {/* Current Step Card */}
        {currentStep && (
          <RouteStepCard
            currentStep={currentStepIndex + 1}
            totalSteps={route.steps.length}
            instruction={currentStep.instruction}
            landmark={currentStep.landmark}
            distance={currentStep.distance}
            onPrevious={goToPrevious}
            onNext={goToNext}
            onRepeat={handleRepeat}
            hasPrevious={currentStepIndex > 0}
            hasNext={currentStepIndex < route.steps.length - 1}
          />
        )}

        {/* Safety Note */}
        {currentStep?.safetyNote && (
          <div className="flex items-start gap-3 rounded-xl bg-warning/10 border border-warning/20 p-4">
            <svg
              className="h-5 w-5 shrink-0 text-warning-foreground mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-sm text-warning-foreground font-medium">
              {currentStep.safetyNote}
            </p>
          </div>
        )}

        {/* Step Overview */}
        <div className="flex-1 overflow-auto">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground px-1">
            All Steps
          </h2>
          <div className="flex flex-col gap-2">
            {route.steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStepIndex(index)}
                aria-current={index === currentStepIndex ? "step" : undefined}
                className={cn(
                  "flex items-start gap-3 rounded-xl p-3 text-left transition-colors",
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
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold mt-0.5",
                    index === currentStepIndex && "bg-primary text-primary-foreground",
                    index < currentStepIndex && "bg-success text-success-foreground",
                    index > currentStepIndex && "bg-muted text-muted-foreground"
                  )}
                >
                  {index < currentStepIndex ? (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <p
                  className={cn(
                    "text-sm leading-relaxed line-clamp-2",
                    index === currentStepIndex && "text-foreground font-medium",
                    index < currentStepIndex && "text-success",
                    index > currentStepIndex && "text-muted-foreground"
                  )}
                >
                  {step.instruction}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
