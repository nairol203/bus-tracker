import { Suspense } from "react";
import type { Metadata } from "next";
import { SWRConfig } from "swr";

import { getAllStops } from "@/lib/kvg";
import { PageSkeleton } from "@/components/PageSkeleton";
import TrackerContent from "@/components/TrackerContent";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const params = await searchParams;
  const stopNumber = params.stop;

  if (typeof stopNumber === "string") {
    const stops = await getAllStops();
    const stop = stops.find((s) => s.number === stopNumber);
    if (stop) {
      return {
        title: `${stop.name} | KVG Bus Tracker`,
        description: `Aktuelle Abfahrtszeiten für die Haltestelle ${stop.name}. Echtzeit-Infos der KVG Kiel, alle Buslinien und Verspätungen auf einen Blick.`,
      };
    }
  }

  return {};
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const stopNumber = typeof params.stop === "string" ? params.stop : null;
  const stopsPromise = getAllStops();

  return (
    <div className="bg-background relative flex min-h-screen flex-col">
      <Suspense fallback={<PageSkeleton stopNumber={stopNumber} />}>
        <SWRConfig
          value={{
            fallback: {
              "/api/stops": stopsPromise,
            },
          }}
        >
          <TrackerContent />
        </SWRConfig>
      </Suspense>
    </div>
  );
}
