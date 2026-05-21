import { Suspense } from "react";
import { SWRConfig } from "swr";

import { getAllStops } from "@/lib/kvg";
import TrackerContent from "@/components/TrackerContent";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Initiate data fetching on the server side
  const stopsPromise = getAllStops();

  return (
    <div className="bg-background relative flex min-h-screen flex-col">
      {/* Decorative Background Gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-brand/20 pointer-events-none absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full blur-[120px]" />
        <div className="bg-brand-dark/20 pointer-events-none absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] rounded-full blur-[120px]" />
      </div>

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
              // Pass the promise to client components.
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
