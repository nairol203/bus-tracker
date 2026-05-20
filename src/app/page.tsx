"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bus, BusFront } from 'lucide-react';
import useSWR from 'swr';
import Searchbar, { Stop } from '@/components/Searchbar';
import DeparturesList from '@/components/DeparturesList';
import TripDetails from '@/components/TripDetails';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function TrackerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);

  const { data: stopsData } = useSWR<Stop[]>('/api/stops', fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });

  useEffect(() => {
    const stops = stopsData || [];
    const stopIdOrNumber = searchParams.get('stop');

    if (stopIdOrNumber) {
      // First try to find it in the downloaded stops array
      if (stops.length > 0) {
        const found = stops.find(s => s.number === stopIdOrNumber || s.id === stopIdOrNumber);
        if (found) {
          setSelectedStop(found);
          return;
        }
      }
      
      // Fallback to localStorage cache so we don't blink "Lade Haltestelle..." if possible
      const saved = localStorage.getItem('kvg-selected-stop');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.number === stopIdOrNumber || parsed.id === stopIdOrNumber) {
            setSelectedStop(parsed);
            return;
          }
        } catch (e) {}
      }

      // If we don't know the name yet, show a placeholder until stops loads
      const isNumber = stopIdOrNumber.length < 10;
      setSelectedStop({ 
        id: isNumber ? '' : stopIdOrNumber, 
        name: 'Lade Haltestelle...', 
        number: isNumber ? stopIdOrNumber : undefined 
      });
      return;
    }

    // 2. Fallback to localStorage if URL is clean
    const saved = localStorage.getItem('kvg-selected-stop');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSelectedStop(parsed);
        
        // Sync to URL so it's instantly shareable without cluttering history
        const params = new URLSearchParams(searchParams.toString());
        params.set('stop', parsed.number || parsed.id);
        router.replace(`/?${params.toString()}`);
      } catch (e) {}
    }
  }, [searchParams, router, stopsData]);

  const handleSelectStop = (stop: Stop) => {
    setSelectedStop(stop);
    localStorage.setItem('kvg-selected-stop', JSON.stringify(stop));
    
    // Update URL to make it shareable, pushing state to history
    // We intentionally wipe out lines/dirs filters when selecting a NEW stop
    const params = new URLSearchParams();
    params.set('stop', stop.number || stop.id);
    router.push(`/?${params.toString()}`);
  };
  
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedTripLine, setSelectedTripLine] = useState<string>('');
  const [selectedTripDest, setSelectedTripDest] = useState<string>('');

  const handleSelectTrip = (tripId: string, line: string, destination: string) => {
    setSelectedTripId(tripId);
    setSelectedTripLine(line);
    setSelectedTripDest(destination);
  };

  const handleCloseTrip = () => {
    setSelectedTripId(null);
  };

  return (
    <>
      <header className="pt-16 pb-8 px-4 text-center z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center justify-center p-3 bg-surface border border-border rounded-2xl shadow-xl mb-6"
        >
          <BusFront className="w-8 h-8 text-brand" />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4"
        >
          KVG Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-brand">Tracker</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted text-lg max-w-xl mx-auto"
        >
          Echtzeit Abfahrten und Routen für Kiel.
        </motion.p>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 z-10 flex flex-col mb-16">
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
            <Bus className="w-16 h-16 text-muted mb-4" />
            <p className="text-muted text-center max-w-sm">
              Suchen und wählen Sie oben eine Haltestelle, um Live-Abfahrten zu sehen.
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
    <div className="min-h-screen bg-background relative flex flex-col">
      {/* Decorative Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-dark/20 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center min-h-screen z-10 relative">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
        </div>
      }>
        <TrackerContent />
      </Suspense>
    </div>
  );
}
