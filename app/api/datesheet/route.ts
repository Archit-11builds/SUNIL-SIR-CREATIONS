import { NextResponse } from 'next/server';
export async function GET(){return NextResponse.json({ok:true,endpoint:'datesheet',mode:'demo',message:'API route is ready for Supabase persistence.'})}
export async function POST(req:Request){const body=await req.json().catch(()=>({}));return NextResponse.json({ok:true,endpoint:'datesheet',mode:'demo',received:body})}
