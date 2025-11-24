import { NextResponse } from 'next/server'
import { fetchRoundIcons } from '@/lib/server/roundIcons'

export async function GET() {
  try {
    const icons = await fetchRoundIcons()
    return NextResponse.json({ icons })
  } catch (error) {
    console.error('[round-icons] error', error)
    return NextResponse.json({ icons: {} }, { status: 200 })
  }
}

