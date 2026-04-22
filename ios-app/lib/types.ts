export interface Landmark {
  id: string
  name: string
  description?: string
  type: "furniture" | "fixture" | "entrance" | "exit" | "custom"
  position?: { x: number; y: number }
}

export interface Hazard {
  id: string
  name: string
  description?: string
  severity: "warning" | "danger"
  position?: { x: number; y: number }
}

export interface RoomConnection {
  roomId: string
  doorType?: "standard" | "automatic" | "revolving" | "sliding"
  direction?: string
}

export interface Room {
  id: string
  name: string
  description?: string
  isEntrance?: boolean
  scanComplete: boolean
  landmarks: Landmark[]
  hazards: Hazard[]
  connections: RoomConnection[]
  area?: number
}

export interface RouteStep {
  id: string
  instruction: string
  landmark?: string
  distance?: string
  safetyNote?: string
}

export interface Route {
  id: string
  name: string
  description?: string
  fromRoom: string
  toRoom: string
  steps: RouteStep[]
  estimatedTime?: string
}

export interface Place {
  id: string
  name: string
  description?: string
  rooms: Room[]
  routes: Route[]
  mainEntranceId?: string
  scanQuality: "good" | "fair" | "needs-update"
  createdAt: Date
  lastAccessedAt: Date
}

export interface AccessibilitySettings {
  voiceOverOptimized: boolean
  highContrast: boolean
  reducedMotion: boolean
  largeText: boolean
  hapticFeedback: boolean
  audioDescriptions: boolean
  speakingRate: number
}

export type UserRole = "scanner" | "explorer" | "both"

export interface UserPreferences {
  role: UserRole
  accessibility: AccessibilitySettings
}
