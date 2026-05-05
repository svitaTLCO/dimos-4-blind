"use client"
import { useState } from "react"
import { TopAppBar } from "@/components/echospace"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
interface NewPlaceScreenProps { onBack: () => void; onStartScan: (input: { placeName: string; description: string }) => void }
export function NewPlaceScreen({ onBack, onStartScan }: NewPlaceScreenProps) {
  const [placeName, setPlaceName] = useState(""); const [description, setDescription] = useState("")
  return <div className="flex min-h-screen flex-col bg-background"><TopAppBar title="New Place" showBack onBack={onBack} /><div className="flex flex-1 flex-col gap-6 px-5 py-6"><Input placeholder="Place" value={placeName} onChange={(e)=>setPlaceName(e.target.value)} /><Textarea placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} /><div className="flex-1" /><Button onClick={()=>onStartScan({placeName,description})} disabled={!placeName.trim()}>Start Scanning</Button></div></div>
}
