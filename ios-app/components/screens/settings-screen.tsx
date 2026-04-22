"use client"

import { AccessibilityToggle, ListSection } from "@/components/echospace"
import {
  Eye,
  Volume2,
  Vibrate,
  Type,
  Contrast,
  Sparkles,
  Globe,
  Lock,
  Info,
} from "lucide-react"
import { Slider } from "@/components/ui/slider"
import type { AccessibilitySettings } from "@/lib/types"

interface SettingsScreenProps {
  settings: AccessibilitySettings
  onSettingsChange: (settings: AccessibilitySettings) => void
}

export function SettingsScreen({
  settings,
  onSettingsChange,
}: SettingsScreenProps) {
  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value })
  }

  return (
    <div className="flex flex-col gap-6 px-5 py-6 pb-28">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Customize your experience
        </p>
      </header>

      {/* Accessibility */}
      <ListSection title="Accessibility">
        <div className="flex flex-col divide-y divide-border">
          <AccessibilityToggle
            id="voiceover"
            label="VoiceOver Optimized"
            description="Enhanced screen reader support"
            icon={<Eye className="h-5 w-5" />}
            checked={settings.voiceOverOptimized}
            onCheckedChange={(checked) =>
              updateSetting("voiceOverOptimized", checked)
            }
            className="border-0 rounded-none first:rounded-t-xl last:rounded-b-xl"
          />
          <AccessibilityToggle
            id="high-contrast"
            label="High Contrast"
            description="Increase visual contrast"
            icon={<Contrast className="h-5 w-5" />}
            checked={settings.highContrast}
            onCheckedChange={(checked) =>
              updateSetting("highContrast", checked)
            }
            className="border-0 rounded-none first:rounded-t-xl last:rounded-b-xl"
          />
          <AccessibilityToggle
            id="reduced-motion"
            label="Reduced Motion"
            description="Minimize animations"
            icon={<Sparkles className="h-5 w-5" />}
            checked={settings.reducedMotion}
            onCheckedChange={(checked) =>
              updateSetting("reducedMotion", checked)
            }
            className="border-0 rounded-none first:rounded-t-xl last:rounded-b-xl"
          />
          <AccessibilityToggle
            id="large-text"
            label="Large Text"
            description="Increase text size"
            icon={<Type className="h-5 w-5" />}
            checked={settings.largeText}
            onCheckedChange={(checked) => updateSetting("largeText", checked)}
            className="border-0 rounded-none first:rounded-t-xl last:rounded-b-xl"
          />
        </div>
      </ListSection>

      {/* Audio & Haptics */}
      <ListSection title="Audio & Haptics">
        <div className="flex flex-col divide-y divide-border">
          <AccessibilityToggle
            id="audio-descriptions"
            label="Audio Descriptions"
            description="Spoken spatial information"
            icon={<Volume2 className="h-5 w-5" />}
            checked={settings.audioDescriptions}
            onCheckedChange={(checked) =>
              updateSetting("audioDescriptions", checked)
            }
            className="border-0 rounded-none first:rounded-t-xl last:rounded-b-xl"
          />
          <AccessibilityToggle
            id="haptic-feedback"
            label="Haptic Feedback"
            description="Vibration for interactions"
            icon={<Vibrate className="h-5 w-5" />}
            checked={settings.hapticFeedback}
            onCheckedChange={(checked) =>
              updateSetting("hapticFeedback", checked)
            }
            className="border-0 rounded-none first:rounded-t-xl last:rounded-b-xl"
          />
          <div className="flex flex-col gap-4 px-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium">Speaking Rate</span>
              <span className="text-sm text-muted-foreground tabular-nums">
                {settings.speakingRate.toFixed(1)}x
              </span>
            </div>
            <Slider
              value={[settings.speakingRate]}
              onValueChange={([value]) => updateSetting("speakingRate", value)}
              min={0.5}
              max={2.0}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>
      </ListSection>

      {/* Other Settings */}
      <ListSection title="General">
        <div className="flex flex-col divide-y divide-border">
          <button className="flex items-center gap-4 px-4 py-4 text-left hover:bg-accent transition-colors first:rounded-t-xl last:rounded-b-xl">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
              <Globe className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-0.5 flex-1">
              <span className="text-base font-medium">Language & Voice</span>
              <span className="text-sm text-muted-foreground">English (US)</span>
            </div>
          </button>
          <button className="flex items-center gap-4 px-4 py-4 text-left hover:bg-accent transition-colors first:rounded-t-xl last:rounded-b-xl">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
              <Lock className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-0.5 flex-1">
              <span className="text-base font-medium">Privacy & Sharing</span>
              <span className="text-sm text-muted-foreground">
                Manage your data
              </span>
            </div>
          </button>
          <button className="flex items-center gap-4 px-4 py-4 text-left hover:bg-accent transition-colors first:rounded-t-xl last:rounded-b-xl">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
              <Info className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-0.5 flex-1">
              <span className="text-base font-medium">About EchoSpace</span>
              <span className="text-sm text-muted-foreground">Version 1.0.0</span>
            </div>
          </button>
        </div>
      </ListSection>
    </div>
  )
}
