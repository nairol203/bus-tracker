import { NextResponse } from "next/server";
import { StopsResponseSchema } from "@/lib/schemas";

export const revalidate = 86400; // Cache the result for 24 hours

export async function GET() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  try {
    const fetchPromises = characters.map(async (char) => {
      const res = await fetch(
        `https://kvg-internetservice-proxy.p.networkteam.com/internetservice/services/lookup/stopsByCharacter?character=${char}`,
      );
      if (!res.ok) return [];
      const rawData = await res.json();
      const parsed = StopsResponseSchema.parse(rawData);
      return parsed.stops;
    });

    const results = await Promise.all(fetchPromises);
    const allStops = results.flat();

    // Deduplicate by number
    const uniqueStops = Array.from(
      new Map(allStops.map((stop) => [stop.number || stop.id, stop])).values(),
    );

    return NextResponse.json(uniqueStops);
  } catch (error) {
    console.error("Error fetching stops:", error);
    return NextResponse.json(
      { error: "Failed to fetch stops" },
      { status: 500 },
    );
  }
}
