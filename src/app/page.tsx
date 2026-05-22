import { Suspense } from "react";
import type { Metadata } from "next";
import { SWRConfig } from "swr";

import { getAllStops } from "@/lib/kvg";
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

export default async function Home() {
  const stopsPromise = getAllStops();

  return (
    <div className="bg-background relative flex min-h-screen flex-col">
      <Suspense
        fallback={
          <div className="relative z-10 flex min-h-screen flex-1 items-center justify-center">
            <div className="border-brand h-12 w-12 animate-spin rounded-full border-t-2 border-b-2"></div>
          </div>
        }
      >
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
