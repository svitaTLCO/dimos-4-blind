import type { Place, Route, AccessibilitySettings } from "./types"

export const mockPlaces: Place[] = [
  {
    id: "1",
    name: "Community Center",
    description: "Main community center with meeting rooms and facilities",
    scanQuality: "good",
    mainEntranceId: "lobby",
    createdAt: new Date("2024-01-15"),
    lastAccessedAt: new Date("2024-01-20"),
    rooms: [
      {
        id: "lobby",
        name: "Main Lobby",
        description: "Large open entrance area with reception desk on the right. Seating area straight ahead.",
        isEntrance: true,
        scanComplete: true,
        landmarks: [
          { id: "l1", name: "Reception Desk", description: "On your right as you enter", type: "fixture" },
          { id: "l2", name: "Seating Area", description: "Comfortable chairs straight ahead", type: "furniture" },
          { id: "l3", name: "Water Fountain", description: "Left wall, near restrooms", type: "fixture" },
        ],
        hazards: [
          { id: "h1", name: "Glass Door", description: "Automatic sliding door at entrance", severity: "warning" },
        ],
        connections: [
          { roomId: "hallway", direction: "straight ahead" },
          { roomId: "restrooms", direction: "left" },
        ],
      },
      {
        id: "hallway",
        name: "Main Hallway",
        description: "Long corridor connecting main areas. Meeting rooms on both sides.",
        isEntrance: false,
        scanComplete: true,
        landmarks: [
          { id: "l4", name: "Information Board", description: "Left wall near entrance", type: "fixture" },
          { id: "l5", name: "Fire Extinguisher", description: "Right wall, middle of hallway", type: "fixture" },
        ],
        hazards: [],
        connections: [
          { roomId: "lobby", direction: "behind" },
          { roomId: "meeting-a", direction: "left" },
          { roomId: "meeting-b", direction: "right" },
          { roomId: "cafeteria", direction: "end of hallway" },
        ],
      },
      {
        id: "meeting-a",
        name: "Meeting Room A",
        description: "Medium-sized meeting room with conference table and whiteboard.",
        isEntrance: false,
        scanComplete: true,
        landmarks: [
          { id: "l6", name: "Conference Table", description: "Center of room, seats 8", type: "furniture" },
          { id: "l7", name: "Whiteboard", description: "Far wall", type: "fixture" },
          { id: "l8", name: "TV Screen", description: "Mounted on wall opposite door", type: "fixture" },
        ],
        hazards: [
          { id: "h2", name: "Power Cables", description: "On floor near TV screen", severity: "warning" },
        ],
        connections: [{ roomId: "hallway", direction: "through door" }],
      },
      {
        id: "meeting-b",
        name: "Meeting Room B",
        description: "Small meeting room with round table.",
        isEntrance: false,
        scanComplete: true,
        landmarks: [
          { id: "l9", name: "Round Table", description: "Center, seats 4", type: "furniture" },
        ],
        hazards: [],
        connections: [{ roomId: "hallway", direction: "through door" }],
      },
      {
        id: "cafeteria",
        name: "Cafeteria",
        description: "Open dining area with food service counter and tables.",
        isEntrance: false,
        scanComplete: true,
        landmarks: [
          { id: "l10", name: "Food Counter", description: "Along left wall", type: "fixture" },
          { id: "l11", name: "Dining Tables", description: "Center area, multiple tables", type: "furniture" },
          { id: "l12", name: "Vending Machines", description: "Right corner", type: "fixture" },
        ],
        hazards: [
          { id: "h3", name: "Wet Floor Area", description: "Near drink station, often wet", severity: "warning" },
        ],
        connections: [
          { roomId: "hallway", direction: "back through main door" },
          { roomId: "kitchen", direction: "behind counter" },
        ],
      },
      {
        id: "restrooms",
        name: "Restrooms",
        description: "Public restroom area.",
        isEntrance: false,
        scanComplete: true,
        landmarks: [
          { id: "l13", name: "Accessible Stall", description: "Far left", type: "fixture" },
        ],
        hazards: [
          { id: "h4", name: "Slippery When Wet", description: "Floor may be wet", severity: "warning" },
        ],
        connections: [{ roomId: "lobby", direction: "through door" }],
      },
      {
        id: "kitchen",
        name: "Kitchen",
        description: "Staff kitchen behind cafeteria counter.",
        isEntrance: false,
        scanComplete: false,
        landmarks: [],
        hazards: [],
        connections: [{ roomId: "cafeteria", direction: "through service door" }],
      },
    ],
    routes: [],
  },
  {
    id: "2",
    name: "City Library",
    description: "Public library with multiple reading areas",
    scanQuality: "fair",
    mainEntranceId: "entrance",
    createdAt: new Date("2024-01-10"),
    lastAccessedAt: new Date("2024-01-18"),
    rooms: [
      {
        id: "entrance",
        name: "Entrance Hall",
        isEntrance: true,
        scanComplete: true,
        landmarks: [
          { id: "l1", name: "Security Gates", description: "Immediately after doors", type: "fixture" },
          { id: "l2", name: "Information Desk", description: "Straight ahead", type: "fixture" },
        ],
        hazards: [],
        connections: [
          { roomId: "main-reading", direction: "left" },
          { roomId: "computer-lab", direction: "right" },
        ],
      },
      {
        id: "main-reading",
        name: "Main Reading Room",
        scanComplete: true,
        landmarks: [
          { id: "l3", name: "Study Tables", description: "Center area", type: "furniture" },
          { id: "l4", name: "Book Shelves", description: "Along all walls", type: "furniture" },
        ],
        hazards: [],
        connections: [{ roomId: "entrance", direction: "through archway" }],
      },
      {
        id: "computer-lab",
        name: "Computer Lab",
        scanComplete: false,
        landmarks: [],
        hazards: [],
        connections: [{ roomId: "entrance", direction: "through door" }],
      },
    ],
    routes: [],
  },
]

export const mockRoutes: Route[] = [
  {
    id: "r1",
    name: "Lobby to Cafeteria",
    description: "Direct route from main entrance to cafeteria",
    fromRoom: "lobby",
    toRoom: "cafeteria",
    estimatedTime: "2 minutes",
    steps: [
      {
        id: "s1",
        instruction: "Enter through the main entrance and pass the reception desk on your right",
        landmark: "Reception Desk",
        distance: "5 meters",
      },
      {
        id: "s2",
        instruction: "Continue straight ahead past the seating area",
        landmark: "Seating Area",
        distance: "8 meters",
      },
      {
        id: "s3",
        instruction: "Enter the main hallway and continue straight",
        landmark: "Information Board",
        distance: "15 meters",
        safetyNote: "Watch for people exiting meeting rooms",
      },
      {
        id: "s4",
        instruction: "Continue to the end of the hallway. The cafeteria entrance is directly ahead",
        distance: "10 meters",
      },
      {
        id: "s5",
        instruction: "You have arrived at the cafeteria. Food counter is on your left",
        landmark: "Food Counter",
      },
    ],
  },
  {
    id: "r2",
    name: "Lobby to Meeting Room A",
    description: "Route to the larger meeting room",
    fromRoom: "lobby",
    toRoom: "meeting-a",
    estimatedTime: "1 minute",
    steps: [
      {
        id: "s1",
        instruction: "Enter through the main entrance",
        distance: "5 meters",
      },
      {
        id: "s2",
        instruction: "Walk straight ahead into the main hallway",
        distance: "8 meters",
      },
      {
        id: "s3",
        instruction: "Turn left at the first door. This is Meeting Room A",
        landmark: "Meeting Room A Door",
        safetyNote: "Door opens outward",
      },
    ],
  },
]

export const defaultAccessibilitySettings: AccessibilitySettings = {
  voiceOverOptimized: true,
  highContrast: false,
  reducedMotion: false,
  largeText: false,
  hapticFeedback: true,
  audioDescriptions: true,
  speakingRate: 1.0,
}
