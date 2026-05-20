import { NextResponse } from "next/server";

import { TripResponseSchema } from "@/lib/schemas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tripId = searchParams.get("tripId");

  if (!tripId) {
    return NextResponse.json({ error: "tripId is required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://kvg-internetservice-proxy.p.networkteam.com/internetservice/services/tripInfo/tripPassages?tripId=${tripId}`,
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch trip info" },
        { status: res.status },
      );
    }

    const rawData = await res.json();
    const parsed = TripResponseSchema.parse(rawData);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error fetching trip info:", error);
    return NextResponse.json(
      { error: "Failed to fetch trip info" },
      { status: 500 },
    );
  }
}
