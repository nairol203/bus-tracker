"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Bus, BusFront } from "lucide-react";
import useSWR from "swr";

import DeparturesList from "@/components/DeparturesList";
import Searchbar, { Stop } from "@/components/Searchbar";
import TripDetails from "@/components/TripDetails";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function TrackerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);

  const { data: stopsData } = useSWR<Stop[]>("/api/stops", fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });

  useEffect(() => {
    const stops = stopsData || [];
    const stopIdOrNumber = searchParams.get("stop");

    if (stopIdOrNumber) {
      // First try to find it in the downloaded stops array
      if (stops.length > 0) {
        const found = stops.find(
          (s) => s.number === stopIdOrNumber || s.id === stopIdOrNumber,
        );
        if (found) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setSelectedStop(found);
          return;
        }
      }

      // Fallback to localStorage cache so we don't blink "Lade Haltestelle..." if possible
      const saved = localStorage.getItem("kvg-selected-stop");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (
            parsed.number === stopIdOrNumber ||
            parsed.id === stopIdOrNumber
          ) {
            setSelectedStop(parsed);
            return;
          }
        } catch {}
      }

      // If we don't know the name yet, show a placeholder until stops loads
      const isNumber = stopIdOrNumber.length < 10;
      setSelectedStop({
        id: isNumber ? "" : stopIdOrNumber,
        name: "Lade Haltestelle...",
        number: isNumber ? stopIdOrNumber : undefined,
      });
      return;
    }

    // 2. Fallback to localStorage if URL is clean
    const saved = localStorage.getItem("kvg-selected-stop");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSelectedStop(parsed);

        // Sync to URL so it's instantly shareable without cluttering history
        const params = new URLSearchParams(searchParams.toString());
        params.set("stop", parsed.number || parsed.id);
        router.replace(`/?${params.toString()}`);
      } catch {}
    }
  }, [searchParams, router, stopsData]);

  const handleSelectStop = (stop: Stop) => {
    setSelectedStop(stop);
    localStorage.setItem("kvg-selected-stop", JSON.stringify(stop));

    // Update URL to make it shareable, pushing state to history
    // We intentionally wipe out lines/dirs filters when selecting a NEW stop
    const params = new URLSearchParams();
    params.set("stop", stop.number || stop.id);
    router.push(`/?${params.toString()}`);
  };

  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedTripLine, setSelectedTripLine] = useState<string>("");
  const [selectedTripDest, setSelectedTripDest] = useState<string>("");

  const handleSelectTrip = (
    tripId: string,
    line: string,
    destination: string,
  ) => {
    setSelectedTripId(tripId);
    setSelectedTripLine(line);
    setSelectedTripDest(destination);
  };

  const handleCloseTrip = () => {
    setSelectedTripId(null);
  };

  return (
    <>
      <header className="z-10 px-4 pt-16 pb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border-border mb-6 inline-flex items-center justify-center rounded-2xl border p-3 shadow-xl"
        >
          <BusFront className="text-brand h-8 w-8" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-foreground mb-4 text-4xl font-extrabold tracking-tight md:text-5xl"
        >
          KVG Live{" "}
          <span className="from-brand-light to-brand bg-gradient-to-r bg-clip-text text-transparent">
            Tracker
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted mx-auto max-w-xl text-lg"
        >
          Echtzeit Abfahrten und Routen für Kiel.
        </motion.p>
      </header>

      <main className="z-10 mx-auto mb-16 flex w-full max-w-3xl flex-1 flex-col px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full"
        >
          <Searchbar onSelectStop={handleSelectStop} />
        </motion.div>

        {selectedStop ? (
          <DeparturesList
            stopId={selectedStop.number || selectedStop.id}
            stopName={selectedStop.name}
            onSelectTrip={handleSelectTrip}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 flex flex-col items-center justify-center opacity-50"
          >
            <Bus className="text-muted mb-4 h-16 w-16" />
            <p className="text-muted max-w-sm text-center">
              Suchen und wählen Sie oben eine Haltestelle, um Live-Abfahrten zu
              sehen.
            </p>
          </motion.div>
        )}
      </main>

      <TripDetails
        tripId={selectedTripId}
        line={selectedTripLine}
        destination={selectedTripDest}
        onClose={handleCloseTrip}
      />
    </>
  );
}

export default function Home() {
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
        <TrackerContent />
      </Suspense>
    </div>
  );
}
