import { NextResponse } from "next/server"
const BASE=(process.env.DIMOS_WEB_SCAN_URL??"http://127.0.0.1:9991").replace(/\/$/,"")
export async function POST(req:Request,{params}:{params:{sessionId:string}}){
  try{
    const body = req.method === 'POST' ? await req.text() : undefined
    const u=await fetch(`${BASE}/webscan/sessions/${params.sessionId}/frame`,{method:'POST',headers:{"Content-Type":"application/json",...(process.env.DIMOS_WEB_SCAN_TOKEN?{Authorization:`Bearer ${process.env.DIMOS_WEB_SCAN_TOKEN}`}:{})},body,cache:'no-store'})
    return new NextResponse(await u.text(),{status:u.status,headers:{"Content-Type":u.headers.get('content-type')??'application/json'}})
  }catch(e){return NextResponse.json({ok:false,error:`backend unreachable: ${String(e)}`},{status:502})}
}
