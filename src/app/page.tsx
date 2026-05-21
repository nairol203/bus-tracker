import { Suspense } from "react";
import { SWRConfig } from "swr";

import { getAllStops } from "@/lib/kvg";
import TrackerContent from "@/components/TrackerContent";

export const dynamic = "force-dynamic";

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
