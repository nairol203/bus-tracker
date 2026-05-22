import { useCallback, useEffect, useState } from "react";

export interface Stop {
  name: string;
  number: string;
}

export function useRecentStops() {
  const [recentStops, setRecentStops] = useState<Stop[]>([]);

  useEffect(() => {
    // Initial load
    const saved = localStorage.getItem("kvg-recent-stops");
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRecentStops(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to parse recent stops", err);
      }
    }

    // Sync across components
    const handleSync = () => {
      const synced = localStorage.getItem("kvg-recent-stops");
      if (synced) {
        try {
          setRecentStops(JSON.parse(synced));
        } catch {
          // ignore
        }
      } else {
        setRecentStops([]);
      }
    };

    window.addEventListener("kvg-recent-stops-updated", handleSync);
    return () =>
      window.removeEventListener("kvg-recent-stops-updated", handleSync);
  }, []);

  const addRecentStop = useCallback((stop: Stop) => {
    const saved = localStorage.getItem("kvg-recent-stops");
    let current: Stop[] = [];
    if (saved) {
      try {
        current = JSON.parse(saved);
      } catch {}
    }

    const newRecent = [
      stop,
      ...current.filter((s) => s.number !== stop.number),
    ].slice(0, 5);

    localStorage.setItem("kvg-recent-stops", JSON.stringify(newRecent));
    setRecentStops(newRecent);

    setTimeout(() => {
      window.dispatchEvent(new Event("kvg-recent-stops-updated"));
    }, 0);
  }, []);

  const removeRecentStop = useCallback((stopNumber: string) => {
    const saved = localStorage.getItem("kvg-recent-stops");
    let current: Stop[] = [];
    if (saved) {
      try {
        current = JSON.parse(saved);
      } catch {}
    }

    const newRecent = current.filter((s) => s.number !== stopNumber);

    localStorage.setItem("kvg-recent-stops", JSON.stringify(newRecent));
    setRecentStops(newRecent);

    setTimeout(() => {
      window.dispatchEvent(new Event("kvg-recent-stops-updated"));
    }, 0);
  }, []);

  return { recentStops, addRecentStop, removeRecentStop };
}
