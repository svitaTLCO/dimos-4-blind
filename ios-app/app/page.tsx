"use client"

import { useState } from "react"
import { TabBar, type TabId } from "@/components/echospace"
import { HomeScreen } from "@/components/screens/home-screen"
import { PlacesScreen } from "@/components/screens/places-screen"
import { RoutesScreen } from "@/components/screens/routes-screen"
import { SettingsScreen } from "@/components/screens/settings-screen"
import { NewPlaceScreen } from "@/components/screens/new-place-screen"
import { LiveScanScreen } from "@/components/screens/live-scan-screen"
import { ProcessingScreen } from "@/components/screens/processing-screen"
import { PlaceOverviewScreen } from "@/components/screens/place-overview-screen"
import { RoomDetailScreen } from "@/components/screens/room-detail-screen"
import { TactileMapScreen } from "@/components/screens/tactile-map-screen"
import { Spatial3DScreen } from "@/components/screens/spatial-3d-screen"
import { GuidedTourScreen } from "@/components/screens/guided-tour-screen"
import { RoutePracticeScreen } from "@/components/screens/route-practice-screen"
import { ShareScreen } from "@/components/screens/share-screen"
import { mockPlaces, mockRoutes, defaultAccessibilitySettings } from "@/lib/mock-data"
import type { Place, Room, AccessibilitySettings } from "@/lib/types"

type Screen =
  | "home"
  | "places"
  | "routes"
  | "settings"
  | "new-place"
  | "live-scan"
  | "processing"
  | "place-overview"
  | "room-detail"
  | "tactile-map"
  | "spatial-3d"
  | "guided-tour"
  | "route-practice"
  | "share"

export default function EchoSpaceApp() {
  const [activeTab, setActiveTab] = useState<TabId>("home")
  const [currentScreen, setCurrentScreen] = useState<Screen>("home")
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>(
    defaultAccessibilitySettings
  )

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab)
    setCurrentScreen(tab)
    setSelectedPlace(null)
    setSelectedRoom(null)
  }

  const handleBack = () => {
    if (currentScreen === "room-detail" || currentScreen === "tactile-map" || 
        currentScreen === "spatial-3d" || currentScreen === "guided-tour" ||
        currentScreen === "share") {
      setCurrentScreen("place-overview")
      setSelectedRoom(null)
    } else if (currentScreen === "place-overview") {
      setCurrentScreen("places")
      setSelectedPlace(null)
    } else if (currentScreen === "route-practice") {
      setCurrentScreen("routes")
      setSelectedRouteId(null)
    } else if (currentScreen === "processing") {
      setCurrentScreen("home")
    } else if (currentScreen === "live-scan") {
      setCurrentScreen("new-place")
    } else if (currentScreen === "new-place") {
      setCurrentScreen("home")
    } else {
      setCurrentScreen(activeTab)
    }
  }

  const handleNewScan = () => {
    setCurrentScreen("new-place")
  }

  const handleStartScan = () => {
    setCurrentScreen("live-scan")
  }

  const handleFinishScan = () => {
    setCurrentScreen("processing")
  }

  const handleProcessingComplete = () => {
    if (mockPlaces[0]) {
      setSelectedPlace(mockPlaces[0])
      setCurrentScreen("place-overview")
    }
  }

  const handleOpenPlace = (placeId: string) => {
    const place = mockPlaces.find((p) => p.id === placeId)
    if (place) {
      setSelectedPlace(place)
      setCurrentScreen("place-overview")
    }
  }

  const handleOpenRoom = (roomId: string) => {
    if (selectedPlace) {
      const room = selectedPlace.rooms.find((r) => r.id === roomId)
      if (room) {
        setSelectedRoom(room)
        setCurrentScreen("room-detail")
      }
    }
  }

  const handlePracticeRoute = (routeId: string) => {
    setSelectedRouteId(routeId)
    setCurrentScreen("route-practice")
  }

  const handleOpenSettings = () => {
    setActiveTab("settings")
    setCurrentScreen("settings")
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return (
          <HomeScreen
            places={mockPlaces}
            recentRoutes={mockRoutes}
            onNewScan={handleNewScan}
            onOpenPlace={handleOpenPlace}
            onPracticeRoute={handlePracticeRoute}
            onOpenSettings={handleOpenSettings}
          />
        )
      case "places":
        return (
          <PlacesScreen
            places={mockPlaces}
            onOpenPlace={handleOpenPlace}
            onNewScan={handleNewScan}
          />
        )
      case "routes":
        return (
          <RoutesScreen
            routes={mockRoutes}
            places={mockPlaces}
            onPracticeRoute={handlePracticeRoute}
          />
        )
      case "settings":
        return (
          <SettingsScreen
            settings={accessibilitySettings}
            onSettingsChange={setAccessibilitySettings}
          />
        )
      case "new-place":
        return (
          <NewPlaceScreen onBack={handleBack} onStartScan={handleStartScan} />
        )
      case "live-scan":
        return (
          <LiveScanScreen onBack={handleBack} onFinish={handleFinishScan} />
        )
      case "processing":
        return <ProcessingScreen onComplete={handleProcessingComplete} />
      case "place-overview":
        return selectedPlace ? (
          <PlaceOverviewScreen
            place={selectedPlace}
            onBack={handleBack}
            onOpenRoom={handleOpenRoom}
            onOpenMap={() => setCurrentScreen("tactile-map")}
            onOpen3D={() => setCurrentScreen("spatial-3d")}
            onStartTour={() => setCurrentScreen("guided-tour")}
            onShare={() => setCurrentScreen("share")}
          />
        ) : null
      case "room-detail":
        return selectedRoom && selectedPlace ? (
          <RoomDetailScreen
            room={selectedRoom}
            place={selectedPlace}
            onBack={handleBack}
            onOpenMap={() => setCurrentScreen("tactile-map")}
          />
        ) : null
      case "tactile-map":
        return selectedPlace ? (
          <TactileMapScreen
            place={selectedPlace}
            selectedRoomId={selectedRoom?.id}
            onBack={handleBack}
            onSelectRoom={handleOpenRoom}
          />
        ) : null
      case "spatial-3d":
        return selectedPlace ? (
          <Spatial3DScreen
            place={selectedPlace}
            onBack={handleBack}
          />
        ) : null
      case "guided-tour":
        return selectedPlace ? (
          <GuidedTourScreen
            place={selectedPlace}
            onBack={handleBack}
          />
        ) : null
      case "route-practice":
        return selectedRouteId ? (
          <RoutePracticeScreen
            route={mockRoutes.find((r) => r.id === selectedRouteId)!}
            onBack={handleBack}
          />
        ) : null
      case "share":
        return selectedPlace ? (
          <ShareScreen place={selectedPlace} onBack={handleBack} />
        ) : null
      default:
        return null
    }
  }

  const showTabBar =
    currentScreen === "home" ||
    currentScreen === "places" ||
    currentScreen === "routes" ||
    currentScreen === "settings"

  return (
    <main className="min-h-screen bg-background">
      {renderScreen()}
      {showTabBar && <TabBar activeTab={activeTab} onTabChange={handleTabChange} />}
    </main>
  )
}
