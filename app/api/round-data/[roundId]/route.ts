import { NextResponse } from "next/server";
import { loadRoundData } from "@/lib/server/roundDataLoader";

export async function GET(
  _request: Request,
  context: { params: { roundId: string } }
) {
  const { roundId } = context.params;

  try {
    const questions = await loadRoundData(roundId);
    return NextResponse.json(
      { questions },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("[round-data] error", error);
    return NextResponse.json({ questions: [] }, { status: 200 });
  }
}
