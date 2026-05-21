import { z } from "zod";

// 1. Stops
export const StopSchema = z.object({
  name: z.string(),
  number: z.string(),
});

export const StopsResponseSchema = z.object({
  stops: z.array(StopSchema),
});

// 2. Departures
export const DepartureSchema = z.object({
  actualRelativeTime: z.number(),
  actualTime: z.string().optional(),
  plannedTime: z.string().optional(),
  direction: z.string(),
  patternText: z.string(),
  tripId: z.string(),
  status: z.string().optional(),
});

export const DeparturesResponseSchema = z.object({
  actual: z.array(DepartureSchema),
  old: z.array(DepartureSchema),
});

// 3. Trip Info
export const TripPassageSchema = z.object({
  stop: z.object({
    name: z.string(),
  }),
  actualTime: z.string().optional(),
  plannedTime: z.string().optional(),
});

export const TripResponseSchema = z.object({
  actual: z.array(TripPassageSchema),
  old: z.array(TripPassageSchema),
});
