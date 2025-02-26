// app/api/viewerCount/route.ts
import { NextResponse } from "next/server";

let viewerCount = 0;

export async function GET() {
  return NextResponse.json({ viewerCount });
}

export async function POST(request: Request) {
  const { action }: { action: "increment" | "decrement" } = await request.json();

  if (action === "increment") {
    viewerCount += 1;
  } else if (action === "decrement") {
    viewerCount -= 1;
  }

  return NextResponse.json({ viewerCount });
}