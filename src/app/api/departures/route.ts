import { NextResponse } from 'next/server';
import { DeparturesResponseSchema } from '@/lib/schemas';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stopId = searchParams.get('stopId');

  if (!stopId) {
    return NextResponse.json({ error: 'stopId is required' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://kvg-internetservice-proxy.p.networkteam.com/internetservice/services/passageInfo/stopPassages/stop?stop=${stopId}&mode=departure`);
    
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch departures' }, { status: res.status });
    }

    const text = await res.text();
    if (!text) {
      return NextResponse.json({ actual: [], old: [] });
    }
    
    const rawData = JSON.parse(text);
    const parsed = DeparturesResponseSchema.parse(rawData);
    return NextResponse.json(parsed);

  } catch (error) {
    console.error('Error fetching departures:', error);
    return NextResponse.json({ error: 'Failed to fetch departures' }, { status: 500 });
  }
}
