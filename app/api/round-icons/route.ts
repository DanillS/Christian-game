// app/api/round-icons/route.ts
import { NextResponse } from 'next/server'
import { fetchRoundIcons } from '@/path/to/your/supabaseClient'

export async function GET() {
  try {
    const icons = await fetchRoundIcons()
    
    return NextResponse.json({ 
      success: true, 
      icons 
    })
  } catch (error) {
    console.error('[API round-icons] Error:', error)
    
    // Возвращаем пустой объект вместо ошибки
    return NextResponse.json({ 
      success: true, 
      icons: {} 
    })
  }
}