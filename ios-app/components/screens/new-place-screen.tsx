"use client"

import { useState } from "react"
import { TopAppBar } from "@/components/echospace"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { MapPin, Info } from "lucide-react"

interface NewPlaceScreenProps {
  onBack: () => void
  onStartScan: () => void
}

export function NewPlaceScreen({ onBack, onStartScan }: NewPlaceScreenProps) {
  const [placeName, setPlaceName] = useState("")
  const [description, setDescription] = useState("")

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopAppBar
        title="New Place"
        showBack
        onBack={onBack}
      />

      <div className="flex flex-1 flex-col gap-6 px-5 py-6">
        {/* Icon Header */}
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MapPin className="h-10 w-10" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold">Create New Place</h2>
            <p className="mt-1 text-base text-muted-foreground">
              Give your space a name before scanning
            </p>
          </div>
        </div>

        {/* Form */}
        <FieldGroup className="gap-5">
          <Field>
            <FieldLabel htmlFor="place-name">Place Name</FieldLabel>
            <Input
              id="place-name"
              placeholder="e.g., Community Center"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              className="h-14 text-lg rounded-xl"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="description">
              Description (Optional)
            </FieldLabel>
            <Textarea
              id="description"
              placeholder="Brief description of this place..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] text-base rounded-xl resize-none"
            />
          </Field>
        </FieldGroup>

        {/* Tips */}
        <div className="flex items-start gap-3 rounded-xl bg-secondary p-4">
          <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Scanning Tips</span>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Move slowly and steadily</li>
              <li>Look at corners and edges</li>
              <li>Scan each room separately</li>
            </ul>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action */}
        <Button
          onClick={onStartScan}
          disabled={!placeName.trim()}
          size="lg"
          className="w-full h-14 text-lg rounded-xl"
        >
          Start Scanning
        </Button>
      </div>
    </div>
  )
}
