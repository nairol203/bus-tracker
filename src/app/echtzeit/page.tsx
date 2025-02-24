import { API_BASE_URI } from '@/utils/api';
import { Metadata, ResolvingMetadata } from 'next';
import { getStopData } from '../(components)/actions';
import Departures from './Departures';
import RecommendedSearches from './RecommendedSearches';
import Searchbar from './Searchbar';

const ONE_DAY_IN_SECONDS = 86_400;

const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

async function searchByCharacter(character: string): Promise<StopsByCharacter | undefined> {
	const endpoint = new URL(`${API_BASE_URI}/internetservice/services/lookup/stopsByCharacter`);

	endpoint.searchParams.append('character', character);

	try {
		const res = await fetch(endpoint.toString(), { method: 'GET', headers: { 'Content-Type': 'application/json' }, next: { revalidate: ONE_DAY_IN_SECONDS } });

		if (!res.ok) {
			console.log(await res.text().catch(() => 'res.text() failed'));
			throw new Error(`Request for ${res.url} failed with status code ${res.status} ${res.statusText}`);
		}

		return res.json();
	} catch (error) {
		console.error(error);
	}
}

type SearchParams = { searchParams: Promise<{ stop?: string; routeId?: string; direction?: string }> };

export async function generateMetadata({ searchParams }: SearchParams): Promise<Metadata> {
	const { direction, routeId, stop: stopId } = await searchParams;

	if (!stopId) {
		return {};
	}

	const data = await getStopData({ stopId, direction, routeId });

	return { title: `${data ? `${data.stopName} | KVG Bus Tracker` : 'KVG Bus Tracker'}` };
}

export default async function Page({ searchParams }: SearchParams) {
	const stops: StopByCharacter[] = [];
	const { stop } = await searchParams;

	for (const letter of alphabet) {
		const result = await searchByCharacter(letter);
		if (!result) continue;
		stops.push(...result.stops);
	}

	if (stop) {
		return <Departures stops={stops} />;
	}

	return (
		<div className='mx-2 grid gap-2'>
			<Searchbar allStops={stops} />
			<RecommendedSearches stops={stops} />
		</div>
	);
}
