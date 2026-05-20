import { StopsResponseSchema } from "@/lib/schemas";
import { Stop } from "@/components/Searchbar";

export async function getAllStops(): Promise<Stop[]> {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const fetchPromises = characters.map(async (char) => {
    const res = await fetch(
      `https://kvg-internetservice-proxy.p.networkteam.com/internetservice/services/lookup/stopsByCharacter?character=${char}`,
      { next: { revalidate: 86400 } }, // Cache the result for 24 hours
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

  return uniqueStops as Stop[];
}
