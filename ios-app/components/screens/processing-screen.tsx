"use client"
import { useEffect, useState } from "react"
import { callDimosMcp, finishScanSession, getScanSession } from "@/lib/dimos-api"
interface ProcessingScreenProps { onComplete: (summary: string) => void; sessionId: string }
export function ProcessingScreen({ onComplete, sessionId }: ProcessingScreenProps) {
const [msg,setMsg]=useState('Processing scan...')
useEffect(()=>{const run=async()=>{try{await finishScanSession(sessionId); for(let i=0;i<4;i++){await new Promise(r=>setTimeout(r,2000)); await getScanSession(sessionId)} const res=await callDimosMcp({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'query',arguments:{question:`Summarize session ${sessionId}`}}}); const text=res?.result?.content?.[0]?.text; if(text){setMsg(text); onComplete(text); return} setMsg('Backend returned no summary'); onComplete('')}catch(e){setMsg(`Backend error: ${String(e)}`); onComplete('')}}; void run()},[onComplete,sessionId])
return <div><p>{msg}</p></div>
}
