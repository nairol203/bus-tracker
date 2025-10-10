import { Select } from '@headlessui/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

function filterUniqueAndSortAscending(arr: string[]) {
	const uniqueArr = Array.from(new Set(arr));
	const sortedArr = uniqueArr.sort();
	return sortedArr;
}

export default function DirectionFilter({ stop }: { stop: NormalizedKVGStops }) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const routeId = searchParams.get('routeId');
	const direction = searchParams.get('direction') ?? 'Alle Richtungen';
	let directions =
		routeId && stop.routes.find((route) => route.id === routeId)
			? stop.routes.find((route) => route.id === routeId)!.directions
			: [''].concat(...stop.routes.map((route) => route.directions));

	if (!routeId || !stop.routes.find((route) => route.id === routeId)) {
		directions.shift();
	}

	directions = filterUniqueAndSortAscending(directions);
	directions.unshift('Alle Richtungen');

	const updatedSearchParams = new URLSearchParams(searchParams);

	return (
		<Select
			className='flex items-center justify-between gap-2 rounded p-2 bg-bg border border-border shadow'
			onChange={(e) => {
				if (!e.target.value || direction === e.target.value) return;
				if (e.target.value === 'Alle Richtungen') {
					updatedSearchParams.delete('direction');
					router.push(pathname + '?' + updatedSearchParams.toString());
				} else {
					updatedSearchParams.set('direction', e.target.value);
					router.push(pathname + '?' + updatedSearchParams.toString());
				}
			}}
			defaultValue={direction}
		>
			{directions.map((_direction) => (
				<option key={_direction} value={_direction}>
					{_direction}
				</option>
			))}
		</Select>
	);
}
