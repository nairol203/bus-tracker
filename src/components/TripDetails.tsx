"use client";

import { useEffect } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Bus } from 'lucide-react';
import { getDelayMinutes } from '@/utils/time';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface StopPassage {
  stop: {
    name: string;
  };
  actualTime?: string;
  plannedTime?: string;
}

interface TripDetailsProps {
  tripId: string | null;
  line: string;
  destination: string;
  onClose: () => void;
}

export default function TripDetails({ tripId, line, destination, onClose }: TripDetailsProps) {
  const { data, isLoading } = useSWR(tripId ? `/api/trip?tripId=${tripId}` : null, fetcher, {
    refreshInterval: 15000,
  });

  return (
    <AnimatePresence>
      {tripId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-surface border-l border-border shadow-2xl z-50 flex flex-col"
          >
            <div className="p-6 border-b border-border flex items-start justify-between bg-surface">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-brand text-white px-3 py-1 rounded-lg font-bold">
                    {line}
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{destination}</h2>
                </div>
                <p className="text-sm text-muted flex items-center mt-1">
                  <Bus className="w-4 h-4 mr-2 text-brand" /> 
                  {data?.actual && data.actual.length > 0 ? (
                    <span>Nächster Halt: <strong className="text-foreground">{data.actual[0].stop.name}</strong></span>
                  ) : (
                    'Routeninformation'
                  )}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 bg-background hover:bg-surface-hover text-muted hover:text-foreground rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center space-x-4 animate-pulse">
                      <div className="w-4 h-4 rounded-full bg-border" />
                      <div className="h-4 bg-border rounded w-3/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute top-2 bottom-2 left-[7px] w-0.5 bg-border z-0" />
                  <div className="space-y-6 relative z-10">
                    {(() => {
                      const allPassages = [...(data?.old || []), ...(data?.actual || [])];
                      if (allPassages.length === 0) return <p className="text-muted text-center py-4">Keine Routendaten verfügbar</p>;
                      
                      const nextStopIdx = data?.old ? data.old.length : 0;
                      
                      return allPassages.map((passage: StopPassage, idx: number) => {
                        const isLast = idx === allPassages.length - 1;
                        const hasTime = !!passage.actualTime || !!passage.plannedTime;
                        const timeString = passage.actualTime || passage.plannedTime;
                        
                        let showDiff = false;
                        let isDelayed = false;
                        if (passage.plannedTime && passage.actualTime) {
                          const delay = getDelayMinutes(passage.plannedTime, passage.actualTime);
                          isDelayed = delay > 1;
                          const isEarly = delay < 0;
                          showDiff = isDelayed || isEarly;
                        }
                        
                        const isNextStop = idx === nextStopIdx && data?.actual?.length > 0;
                        const isPast = idx < nextStopIdx;
                        
                        return (
                          <div key={idx} className={`flex items-start space-x-6 ${isPast ? 'opacity-40' : ''}`}>
                            <div className="relative mt-1">
                              <div className={`flex-shrink-0 w-4 h-4 rounded-full border-2 ${isNextStop ? 'border-brand bg-brand shadow-[0_0_10px_rgba(59,130,246,0.5)]' : isLast ? 'border-brand bg-brand' : isPast ? 'border-border bg-surface' : 'border-brand bg-surface'}`} />
                              {isNextStop && (
                                <span className="absolute top-0 left-0 animate-ping h-4 w-4 rounded-full bg-brand opacity-75"></span>
                              )}
                            </div>
                            <div className="flex-1 flex justify-between items-start">
                              <div>
                                <p className={`font-medium ${isNextStop ? 'text-brand font-bold text-lg' : isLast ? 'text-foreground font-bold' : 'text-foreground'}`}>
                                  {passage.stop.name}
                                </p>
                                {isNextStop && <p className="text-[10px] text-brand font-bold uppercase tracking-widest mt-1">Nächster Halt</p>}
                              </div>
                              {hasTime && (
                                <div className="flex flex-col items-end">
                                  {showDiff ? (
                                    <>
                                      <span className="text-[10px] line-through text-muted">{passage.plannedTime}</span>
                                      <span className={`text-sm font-mono px-2 py-0.5 rounded border ${isDelayed ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'}`}>
                                        {passage.actualTime}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-sm font-mono text-muted bg-background px-2 py-0.5 rounded">
                                      {timeString}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
