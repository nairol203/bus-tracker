import { NextResponse } from "next/server";

import { DeparturesResponseSchema } from "@/lib/schemas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stopNumber = searchParams.get("stopNumber");

  if (!stopNumber) {
    return NextResponse.json(
      { error: "stopNumber is required" },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(
      `https://kvg-internetservice-proxy.p.networkteam.com/internetservice/services/passageInfo/stopPassages/stop?stop=${stopNumber}&mode=departure`,
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch departures" },
        { status: res.status },
      );
    }

    const rawData = await res.json();
    const parsed = DeparturesResponseSchema.parse(rawData);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error fetching departures:", error);
    return NextResponse.json(
      { error: "Failed to fetch departures" },
      { status: 500 },
    );
  }
}
