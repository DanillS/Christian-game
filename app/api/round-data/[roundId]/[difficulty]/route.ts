import { NextResponse } from 'next/server'
import { loadRoundData } from '@/lib/server/roundDataLoader'

export async function GET(
  _request: Request,
  context: { params: { roundId: string; difficulty: string } }
) {
  const { roundId, difficulty } = context.params

  try {
    const questions = await loadRoundData(roundId, difficulty)
    return NextResponse.json({ questions })
  } catch (error) {
    console.error('[round-data] error', error)
    return NextResponse.json({ questions: [] }, { status: 200 })
  }
}

