'use client';

import { useBusStore } from '@/stores/bus-store';
import { usePlausible } from 'next-plausible';
import Image from 'next/image';
import Link from 'next/link';

export default function RecommendedSearches({
	recommendedSearches,
}: {
	recommendedSearches: (
		| {
				number: string;
				name: string;
		  }
		| undefined
	)[];
}) {
	const plausible = usePlausible();
	const { lastSearches } = useBusStore();

	return (
		<>
			{lastSearches.length ? (
				<div className='mt-2 grid gap-2'>
					<h2>Letzte Suchanfragen</h2>
					{lastSearches
						.toReversed()
						.slice(0, 10)
						.map((stop, index) => (
							<Link
								className='group flex gap-3 rounded bg-secondary p-2 shadow transition duration-200 md:hover:bg-accent md:hover:text-darkMode-text dark:bg-darkMode-secondary dark:md:hover:bg-darkMode-accent'
								href={`/stop/${stop.number}`}
								key={`${index}_${stop.id}`}
								onClick={() =>
									plausible('lastSearch', {
										props: {
											searchQuery: `${stop.number} (${stop.name})`,
										},
									})
								}
							>
								<Image src='/clock-rotate-left.svg' height={20} width={20} alt='Clock rotate left icon' className='md:group-hover:invert dark:invert' />
								{stop.name}
							</Link>
						))}
				</div>
			) : (
				<></>
			)}
			{recommendedSearches?.length ? (
				<div className='mt-2 grid gap-2'>
					<h2>Beliebte Suchanfragen</h2>
					{recommendedSearches?.slice(0, 5).map(
						(stop, index) =>
							stop && (
								<Link
									className='group flex gap-3 rounded bg-secondary p-2 shadow transition duration-200 md:hover:bg-accent md:hover:text-darkMode-text dark:bg-darkMode-secondary dark:md:hover:bg-darkMode-accent'
									href={`/stop/${stop.number}`}
									key={`${index}_${stop.number}`}
									onClick={() =>
										plausible('lastSearch', {
											props: {
												searchQuery: `${stop.number} (${stop.name})`,
											},
										})
									}
								>
									<Image src='/clock-rotate-left.svg' height={20} width={20} alt='Clock rotate left icon' className='md:group-hover:invert dark:invert' />
									{stop.name}
								</Link>
							),
					)}
				</div>
			) : (
				<></>
			)}
		</>
	);
}
