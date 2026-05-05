import { NextResponse } from "next/server"
const BASE=(process.env.DIMOS_WEB_SCAN_URL??"http://127.0.0.1:9991").replace(/\/$/,"")
async function forward(path:string,method:string,body?:string){try{const u=await fetch(`${BASE}${path}`,{method,headers:{"Content-Type":"application/json",...(process.env.DIMOS_WEB_SCAN_TOKEN?{Authorization:`Bearer ${process.env.DIMOS_WEB_SCAN_TOKEN}`}:{})},body,cache:"no-store"});return new NextResponse(await u.text(),{status:u.status,headers:{"Content-Type":u.headers.get("content-type")??"application/json"}})}catch(e){return NextResponse.json({ok:false,error:`backend unreachable: ${String(e)}`},{status:502})}}
export async function POST(req:Request){return forward('/webscan/sessions','POST',JSON.stringify(await req.json()))}
export async function GET(){return forward('/webscan/sessions','GET')}
