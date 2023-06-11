'use client';

import { Fragment, useEffect, useState } from 'react';
import { getStopData } from './actions';
import { Combobox, Switch, Transition } from '@headlessui/react';
import KVGTable from './KVGTable';
import Image from 'next/image';
import Draggable from './Draggable';

function filterUniqueAndSortAscending(arr: string[]) {
	const uniqueArr = Array.from(new Set(arr));
	const sortedArr = uniqueArr.sort();
	return sortedArr;
}

function concatenateDirectionsFromRoutes(arr: Route[]) {
	const concatenatedArray: string[] = [];
	arr.forEach(obj => {
		concatenatedArray.push(...obj.directions);
	});
	return concatenatedArray;
}

export default function Realtime({ allStops }: { allStops: StopByCharacter[] }) {
	const [query, setQuery] = useState('');
	const [reload, setReload] = useState(false);
	const [selectedStop, setSelectedStop] = useState<StopByCharacter | null>(null);
	const [activeStop, setActiveStop] = useState<KVGStops | null>(null);
	const [currentRouteId, setRouteId] = useState<string | undefined>(undefined);
	const [currentDirection, setDirection] = useState<string | undefined>(undefined);

	useEffect(() => {
		async function fetchStopData() {
			if (!selectedStop) return;
			const stopData = await getStopData({ stopId: selectedStop.number, routeId: currentRouteId, direction: currentDirection });
			setActiveStop(stopData);
		}

		fetchStopData();

		const interval = setInterval(() => {
			if (!reload) return;
			fetchStopData();
		}, 10_000);

		return () => {
			clearInterval(interval);
		};
	}, [selectedStop, currentRouteId, currentDirection, reload]);

	const filteredStops = query === '' ? [] : allStops.filter(stop => stop.name.toLowerCase().replace(/\s+/g, '').includes(query.toLowerCase().replace(/\s+/g, ''))).slice(0, 15);

	return (
		<div className='grid gap-4 pt-2 m-2'>
			<div className='grid sm:flex gap-1 justify-between items-center'>
				<h1>KVG Echtzeitabfahrten</h1>
				<div className='flex gap-2'>
					<Switch.Group>
						<Switch checked={reload} onChange={setReload} className={`${reload ? 'bg-blue-600' : 'bg-white'} relative inline-flex h-6 w-11 items-center rounded-full`}>
							<span className={`${reload ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-black transition`} aria-hidden='true' />
						</Switch>
						<Switch.Label>Auto-Aktualisieren</Switch.Label>
					</Switch.Group>
				</div>
			</div>
			<Combobox
				value={selectedStop}
				onChange={e => {
					setSelectedStop(e);
					setRouteId(undefined);
					setDirection(undefined);
				}}
			>
				<div className='relative'>
					<div className='relative w-full'>
						<Combobox.Input
							className='bg-black/10 dark:bg-white/25 rounded p-2 w-full'
							onChange={event => setQuery(event.target.value)}
							displayValue={(stop?: StopByCharacter) => stop?.name || ''}
							placeholder='Suche nach einer Haltestelle'
						/>
						<Combobox.Button className='absolute inset-y-0 right-0 flex items-center pr-2'>
							<Image src='/chevron-down-light.svg' alt='Arrow Down Icon' height={20} width={20} aria-hidden='true' className='dark:hidden' />
							<Image src='/chevron-down-dark.svg' alt='Arrow Down Icon' height={20} width={20} aria-hidden='true' className='hidden dark:block' />
						</Combobox.Button>
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
						<Combobox.Options className='absolute mt-1 bg-white dark:bg-black rounded overflow-auto w-full z-50'>
							{filteredStops.length ? (
								filteredStops.map(stop => (
									<Combobox.Option key={stop.id} value={stop} as={Fragment}>
										{({ active }) => (
											<li className={`${active ? 'bg-black/30 dark:bg-white/50' : 'bg-black/10 dark:bg-white/25'} p-2 cursor-pointer`}>{stop.name}</li>
										)}
									</Combobox.Option>
								))
							) : (
								<li className='bg-black/25 dark:bg-white/25 rounded p-2 wrap'>Keine Ergebnisse</li>
							)}
						</Combobox.Options>
					</Transition>
				</div>
			</Combobox>
			{activeStop && (
				<div className='grid gap-2 relative'>
					<Draggable>
						{currentRouteId && (
							<button
								className='shrink-0 px-2.5 py-1.5 bg-black/80 md:hover:bg-black/90 dark:bg-white/25 dark:md:hover:bg-white/30 rounded-full transition'
								onClick={() => {
									setRouteId(undefined);
									setDirection(undefined);
								}}
							>
								<Image src='/xmark.svg' alt='X Icon' height={15} width={15} />
							</button>
						)}
						{activeStop.routes
							.filter(route => (currentDirection ? route.directions.includes(currentDirection) : true))
							.map(route => (
								<button
									className={
										`${currentRouteId && currentRouteId !== route.id && 'hidden'} ` +
										`${
											currentRouteId === route.id
												? 'bg-black dark:bg-white text-white dark:text-black'
												: 'bg-black/10 md:hover:bg-black/25 dark:bg-white/25 dark:md:hover:bg-white/30'
										} ` +
										`${currentDirection && '-mr-6'} ` +
										'px-2.5 py-1.5 rounded-full transition z-10'
									}
									onClick={() => {
										if (currentRouteId) {
											setRouteId(undefined);
											setDirection(undefined);
										} else {
											setRouteId(route.id);
										}
									}}
									key={route.id}
								>
									{route.authority} {route.name}
								</button>
							))}
						{currentRouteId &&
							filterUniqueAndSortAscending(concatenateDirectionsFromRoutes(activeStop.routes.filter(route => route.id === currentRouteId))).map(direction => (
								<button
									className={
										`${currentDirection && currentDirection !== direction && 'hidden'} ` +
										`${
											currentDirection === direction
												? 'bg-black/80 md:hover:bg-black/90 text-white dark:bg-white/80 dark:md:hover:bg-white/90 dark:text-black rounded-r-full pl-6'
												: 'bg-black/10 md:hover:bg-black/25 dark:bg-white/25 dark:md:hover:bg-white/30 rounded-full'
										} ` +
										'px-2.5 py-1.5 transition'
									}
									onClick={() => setDirection(currentDirection ? undefined : direction)}
									key={direction}
								>
									{direction}
								</button>
							))}
					</Draggable>
					<h2 className='mt-2'>{activeStop.stopName}</h2>
					<KVGTable data={activeStop.actual} />
				</div>
			)}
		</div>
	);
}
