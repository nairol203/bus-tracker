'use server';

export async function getStopData({ stopId, routeId, direction }: { stopId: string; routeId?: string | null; direction?: string | null }): Promise<KVGStops> {
	const endpoint = new URL('https://www.kvg-kiel.de/internetservice/services/passageInfo/stopPassages/stop');

	endpoint.searchParams.append('stop', stopId);
	endpoint.searchParams.append('mode', 'departure');

	if (routeId) {
		endpoint.searchParams.append('routeId', routeId);
	}

	if (direction) {
		endpoint.searchParams.append('direction', direction);
	}

	const res = await fetch(endpoint.toString(), {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		cache: 'no-store',
	});

	return res.json();
}

export async function getTripInfo(tripId: string): Promise<StopInfo> {
	const endpoint = new URL('https://kvg-kiel.de/internetservice/services/tripInfo/tripPassages');

	endpoint.searchParams.append('tripId', tripId);

	const res = await fetch(endpoint.toString(), {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		cache: 'no-store',
	});

	return res.json();
}
