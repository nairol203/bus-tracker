"use client";

import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return <div className="h-10 w-10" />;
  }

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-surface border-border text-muted hover:text-foreground flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition-colors"
        aria-label="Theme Menü öffnen"
      >
        {resolvedTheme === "dark" ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="border-border bg-background absolute top-full right-0 z-50 mt-2 w-36 origin-top-right overflow-hidden rounded-xl border shadow-lg"
          >
            <div className="flex flex-col p-1">
              <button
                onClick={() => {
                  setTheme("light");
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${theme === "light" ? "bg-surface text-foreground font-medium" : "text-muted hover:bg-surface/50 hover:text-foreground"}`}
              >
                <Sun className="h-4 w-4" /> Hell
              </button>
              <button
                onClick={() => {
                  setTheme("dark");
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${theme === "dark" ? "bg-surface text-foreground font-medium" : "text-muted hover:bg-surface/50 hover:text-foreground"}`}
              >
                <Moon className="h-4 w-4" /> Dunkel
              </button>
              <button
                onClick={() => {
                  setTheme("system");
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${theme === "system" ? "bg-surface text-foreground font-medium" : "text-muted hover:bg-surface/50 hover:text-foreground"}`}
              >
                <Monitor className="h-4 w-4" /> System
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
