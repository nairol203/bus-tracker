import { BusFront, Search } from "lucide-react";

export function PageSkeleton({ stopNumber }: { stopNumber: string | null }) {
  return (
    <div className="flex w-full flex-1 flex-col">
      {stopNumber ? (
        <header className="border-border bg-background/80 sticky top-0 z-50 w-full border-b px-4 py-3 backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-surface border-border block rounded-xl border p-2 shadow-sm">
                <BusFront className="text-brand h-6 w-6" />
              </div>
            </div>
            <div className="text-foreground text-lg font-bold tracking-tight">
              KVG Bus Tracker
            </div>
            <div className="bg-surface-hover/80 h-10 w-10 animate-pulse rounded-md" />
          </div>
        </header>
      ) : (
        <header className="relative z-10 px-4 pt-16 pb-8 text-center">
          <div className="bg-surface-hover/80 absolute top-4 right-4 h-10 w-10 animate-pulse rounded-md" />
          <div className="bg-surface border-border mb-6 inline-flex items-center justify-center rounded-2xl border p-3 shadow-xl">
            <BusFront className="text-brand h-8 w-8" />
          </div>
          <h1 className="text-foreground mb-4 text-4xl font-extrabold tracking-tight md:text-5xl">
            KVG Bus{" "}
            <span className="from-brand-light to-brand bg-gradient-to-r bg-clip-text text-transparent">
              Tracker
            </span>
          </h1>
          <p className="text-muted mx-auto max-w-xl text-lg">
            Echtzeit Abfahrten und Routen für Kiel.
          </p>
        </header>
      )}

      <main
        className={`z-10 mx-auto mb-16 flex w-full max-w-3xl flex-1 flex-col px-4 ${stopNumber ? "pt-6" : ""}`}
      >
        <div className="relative z-50 mx-auto w-full max-w-2xl">
          <div className="bg-surface border-border relative flex w-full items-center rounded-2xl border px-4 py-3 shadow-lg">
            <Search className="text-muted mr-3 h-5 w-5" />
            <div className="bg-surface-hover/80 h-5 w-48 animate-pulse rounded-md" />
          </div>
        </div>

        {stopNumber ? (
          <div className="bg-surface/80 border-border mt-8 overflow-hidden rounded-2xl border shadow-xl backdrop-blur-md">
            <div className="bg-brand/10 border-border flex items-center justify-between border-b px-6 py-4">
              <div className="bg-surface-hover/80 h-7 w-48 animate-pulse rounded-md" />
              <div className="bg-surface-hover/80 h-4 w-24 animate-pulse rounded-md" />
            </div>

            <div className="border-border bg-surface-hover/30 border-b px-6">
              <div className="flex items-center py-3">
                <div className="bg-surface-hover/80 h-8 w-32 animate-pulse rounded-md" />
              </div>
            </div>

            <div className="divide-border divide-y">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div className="flex min-w-0 flex-1 items-center space-x-4">
                    <div className="bg-surface-hover/80 h-12 w-12 flex-shrink-0 animate-pulse rounded-xl" />
                    <div className="min-w-0 flex-1 space-y-2.5 pr-2">
                      <div className="bg-surface-hover/80 h-5 w-32 animate-pulse rounded-md" />
                      <div className="bg-surface-hover/80 h-3 w-20 animate-pulse rounded-md" />
                    </div>
                  </div>
                  <div className="ml-2 flex flex-col items-end space-y-2.5">
                    <div className="bg-surface-hover/80 h-6 w-10 animate-pulse rounded-md" />
                    <div className="bg-surface-hover/80 h-3 w-8 animate-pulse rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8 flex w-full flex-col gap-6">
            <div className="bg-surface-hover/80 mb-2 h-4 w-32 animate-pulse rounded-md" />
            <div className="bg-surface/40 border-border/60 overflow-hidden rounded-2xl border shadow-sm backdrop-blur-md">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`flex w-full items-center p-3.5 ${i !== 3 ? "border-border/40 border-b" : ""}`}
                >
                  <div className="bg-surface-hover/80 mr-3 h-5 w-5 animate-pulse rounded-md" />
                  <div className="bg-surface-hover/80 h-5 w-48 animate-pulse rounded-md" />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
