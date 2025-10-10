'use client';

import { useBusStore } from '@/stores/bus-store';
import { queryClient } from '@/utils/Providers';
import { stops } from '@/utils/stops';
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions, Transition } from '@headlessui/react';
import Fuse from 'fuse.js';
import { usePlausible } from 'next-plausible';
import { useRouter } from 'next/navigation';
import { Fragment, useMemo, useState } from 'react';

export default function Searchbar({ currentStop }: { currentStop?: NormalizedKVGStops }) {
	const router = useRouter();
	const plausible = usePlausible();

	const [query, setQuery] = useState('');
	const [disabled, setDisabled] = useState(false);
	const [selectedStop, setSelectedStop] = useState<StopByCharacter | null>(null);
	const { setLastSearches } = useBusStore();

	const filteredStops = useMemo(() => {
		const fuse = new Fuse(stops, {
			keys: ['name'],
		});
		const result = fuse.search(query.trim());
		return result.map((item) => item.item).slice(0, 10);
	}, [query, stops]);

	function updateQuery(selectedStop: StopByCharacter) {
		router.push(`/stop/${selectedStop.number}`);
		queryClient.removeQueries({ queryKey: ['stopData'] });
	}

	return (
		<Combobox
			immediate
			disabled={disabled}
			value={selectedStop}
			onChange={(value) => {
				setSelectedStop(value);
				if (value) {
					setDisabled(true);
					updateQuery(value);
					setLastSearches(value);
					setTimeout(() => {
						setDisabled(false);
					}, 50);
					plausible('search', {
						props: {
							searchQuery: `${value.number} (${value.name})`,
						},
					});
				}
			}}
		>
			<div className='relative'>
				<div className='relative w-full'>
					<ComboboxInput
						className='w-full rounded p-3 text-lg shadow bg-bg border-border border text-text'
						onChange={(event) => setQuery(event.target.value)}
						displayValue={(stop?: StopByCharacter) => stop?.name || currentStop?.stopName || ''}
						placeholder='Suche nach einer Haltestelle'
					/>
					<ComboboxButton className='absolute inset-y-0 right-0 flex items-center pr-2'>
						<svg xmlns='http://www.w3.org/2000/svg' height={20} width={20} viewBox='0 0 512 512' className='fill-textMuted'>
							<path d='M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z' />
						</svg>
					</ComboboxButton>
				</div>
				<Transition
					as={Fragment}
					enter='transition ease-in duration-100'
					enterFrom='opacity-0'
					enterTo='opacity-100'
					leave='transition ease-in duration-100'
					leaveFrom='opacity-100'
					leaveTo='opacity-0'
				>
					<ComboboxOptions className={`${query === '' ? '' : 'border border-border'} absolute z-50 mt-1 w-full overflow-auto rounded bg-bg shadow`}>
						{filteredStops.length === 0 && query !== '' ? (
							<li className='wrap rounded text-text bg-bgLight p-2.5'>Keine Ergebnisse</li>
						) : (
							filteredStops.map((stop) => (
								<ComboboxOption key={stop.id} className={({ focus }) => `${focus ? 'text-text bg-bgLight' : ''} cursor-pointer p-2.5`} value={stop}>
									{stop.name}
								</ComboboxOption>
							))
						)}
					</ComboboxOptions>
				</Transition>
			</div>
		</Combobox>
	);
}
