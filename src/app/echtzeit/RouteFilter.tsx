import { Listbox, Transition } from '@headlessui/react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Fragment, useCallback, useEffect, useState } from 'react';

function filterUniqueAndSortAscending(arr: string[]) {
	const uniqueArr = Array.from(new Set(arr));
	const sortedArr = uniqueArr.sort();
	return sortedArr;
}

export default function RouteFilter({ stop }: { stop: KVGStops }) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const routeId = searchParams.get('routeId');
	const direction = searchParams.get('direction');

	const [directionThroughSuggestionChip, setDirectionThroughSuggestionChip] = useState((!!routeId && !!direction) ?? false);

	useEffect(() => {
		setDirectionThroughSuggestionChip((!!routeId && !!direction) ?? false);
	}, [routeId, direction]);

	const routes = direction && !directionThroughSuggestionChip ? stop.routes.filter((route) => route.directions.includes(direction)) : stop.routes;
	const selectedRoute = stop.routes.find((route) => route.id === routeId) ?? null;

	let directions = routeId ? stop.routes.find((route) => route.id === routeId)!.directions : [];
	if (!routeId) {
		directions.shift();
	}
	directions = filterUniqueAndSortAscending(directions);

	const createQueryString = useCallback(
		(name: string, value: string) => {
			const params = new URLSearchParams(searchParams);
			params.set(name, value);

			return params.toString();
		},
		[searchParams]
	);

	const removeQueryStrings = useCallback(
		(names: string[]) => {
			const params = new URLSearchParams(searchParams);
			names.forEach((name) => params.delete(name));

			return params.toString();
		},
		[searchParams]
	);

	return (
		<>
			<Listbox
				value={selectedRoute}
				onChange={(value) => {
					if (!value) return;
					if (routeId === value.id) {
						setDirectionThroughSuggestionChip(false);
						router.push(pathname + '?' + removeQueryStrings(['routeId', 'direction']));
					} else {
						router.push(pathname + '?' + createQueryString('routeId', value.id));
					}
				}}
				as={Fragment}
			>
				<div className='relative'>
					<Listbox.Button
						className={`${
							selectedRoute
								? 'bg-primary text-darkMode-text dark:bg-darkMode-primary dark:text-text'
								: 'bg-secondary dark:bg-darkMode-secondary md:hover:bg-accent md:hover:text-darkMode-text dark:md:hover:bg-darkMode-accent'
						} flex items-center gap-2 rounded px-2 py-1 shadow transition duration-200`}
					>
						{selectedRoute ? `${selectedRoute.authority} ${selectedRoute.name}` : 'Linie'}
						<Image src='/chevron-down.svg' height={15} width={15} alt='Chevron down icon' className={selectedRoute ? 'invert dark:invert-0' : 'dark:invert'} />
					</Listbox.Button>
					<Transition
						as={Fragment}
						enter='transition ease-in duration-100'
						enterFrom='opacity-0'
						enterTo='opacity-100'
						leave='transition ease-in duration-100'
						leaveFrom='opacity-100'
						leaveTo='opacity-0'
					>
						<Listbox.Options className='absolute mt-1 grid max-h-96 w-60 gap-2 overflow-y-auto rounded bg-secondary shadow dark:bg-darkMode-secondary'>
							{routes.map((route) => (
								<Listbox.Option key={route.id} value={route} as={Fragment}>
									{({ active }) => (
										<li
											className={`${active && 'bg-accent text-darkMode-text dark:bg-darkMode-accent'} ${
												routeId === route.id && 'bg-accent text-darkMode-text dark:bg-darkMode-accent'
											} rounded px-2 py-1 text-start`}
										>
											{route.authority} {route.name}
										</li>
									)}
								</Listbox.Option>
							))}
						</Listbox.Options>
					</Transition>
				</div>
			</Listbox>
			{selectedRoute &&
				directions.map((_direction, index) => (
					<button
						onClick={() => {
							if (direction === _direction) {
								setDirectionThroughSuggestionChip(false);
								router.push(pathname + '?' + removeQueryStrings(['direction']));
							} else {
								setDirectionThroughSuggestionChip(true);
								router.push(pathname + '?' + createQueryString('direction', _direction));
							}
						}}
						className={`${
							direction === _direction
								? 'bg-primary text-darkMode-text dark:bg-darkMode-primary dark:text-text'
								: 'bg-secondary dark:bg-darkMode-secondary md:hover:bg-accent md:hover:text-darkMode-text dark:md:hover:bg-darkMode-accent'
						} rounded px-2 py-1 text-start`}
						key={`${index}_${direction}`}
					>
						{_direction}
					</button>
				))}
		</>
	);
}
