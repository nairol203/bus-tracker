'use client';

import { getStopData, getTripInfo } from '@/app/(components)/actions';
import KVGTable, { SkeletonKVGTable } from '@/app/(components)/KVGTable';
import { useBusStore } from '@/stores/bus-store';
import { queryClient } from '@/utils/Providers';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import HealthIndicator from 'src/app/(components)/HealthIndicator';

function getTimeDisplay(date: Date, useRelative: boolean, isPaused: boolean, departed = false) {
	if (isPaused || !useRelative) {
		return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
	}
	const timeDifferenceMin = Math.floor(((new Date().getTime() - date.getTime()) * (departed ? 1 : -1)) / 60000);
	if (departed) return `vor ${timeDifferenceMin} min`;
	return timeDifferenceMin < 1 ? 'Sofort' : `${timeDifferenceMin} min`;
}

export default function Trip({ tripId }: { tripId: string }) {
	const router = useRouter();
	const {
		data: tripInfo,
		isFetching,
		isError,
		isPaused,
	} = useQuery({
		queryKey: ['tripInfo'],
		queryFn: async () => {
			queryClient.invalidateQueries({ queryKey: ['connectingBus'] });
			const res = await getTripInfo(tripId);
			return res;
		},
		refetchInterval: 15_000,
	});

	const { useRelativeTimes } = useBusStore();

	if (isError) {
		return (
			<div className='mx-2 grid gap-2'>
				<h1>Fehler</h1>
				<span>Die Fahrt konnte nicht geladen werden.</span>
				<button onClick={() => queryClient.refetchQueries({ queryKey: ['tripInfo'] })} className='px-2.5 py-1.5 rounded p-2 bg-bgLight border border-border shadow'>
					Erneut versuchen
				</button>
				<button onClick={() => router.back()} className='px-2.5 py-1.5 rounded p-2 bg-bg border border-border shadow'>
					Zurück
				</button>
			</div>
		);
	}

	if (!tripInfo) {
		return (
			<div className='mx-2 grid gap-3'>
				<h1 className='flex gap-2'>
					<span className='rounded-lg px-2 skeleton'>00</span>
					<span className='skeleton'>Lorem ipsum.</span>
				</h1>
				<div className='flex items-center justify-between'>
					<h2 className='skeleton'>Lorem ipsum dolor sit.</h2>
					<HealthIndicator isError={isError} isFetching={isFetching} isPaused={isPaused} />
				</div>
				<div className='grid gap-1'>
					<SkeletonKVGTable />
					<SkeletonKVGTable />
					<SkeletonKVGTable />
				</div>
				<div className='flex items-center justify-between'>
					<h2 className='skeleton'>Lorem ipsum dolor sit.</h2>
					<HealthIndicator isError={isError} isFetching={isFetching} isPaused={isPaused} />
				</div>
				<div className='grid gap-1'>
					<SkeletonKVGTable />
					<SkeletonKVGTable />
					<SkeletonKVGTable />
					<SkeletonKVGTable />
					<SkeletonKVGTable />
					<SkeletonKVGTable />
				</div>
			</div>
		);
	}

	const ConnectingBus: React.FC<{}> = () => {
		const {
			data: busStop,
			isFetching,
			isError,
			isPaused,
		} = useQuery({
			queryKey: ['connectingBus'],
			queryFn: () => getStopData({ stopId: tripInfo.actual[0].stop.shortName }),
			refetchInterval: 15_000,
		});

		if (!busStop) return;

		const filteredStop: NormalizedKVGStops = {
			...busStop,
			actual: busStop.actual.filter((a) => tripInfo.routeName !== a.patternText && a.actualRelativeTime < 1800 && a.actualDate > tripInfo.actual[0].actualDate).slice(0, 5),
		};

		if (!filteredStop.actual.length) return;

		return (
			<div className='grid gap-1'>
				<div className='flex items-center justify-between'>
					<h2>Anschluss Busse für {tripInfo.actual[0].stop.name}</h2>
					<HealthIndicator isError={isError} isFetching={isFetching} isPaused={isPaused} />
				</div>
				<KVGTable data={filteredStop} isPaused={isPaused} />
				{busStop.actual.filter((a) => tripInfo.routeName !== a.patternText && a.actualRelativeTime < 1800 && a.actualDate > tripInfo.actual[0].actualDate).length !==
					filteredStop.actual.length && (
					<Link className='rounded text-center p-2 bg-bg border border-border shadow' href={`/stop/${tripInfo.actual[0].stop.shortName}`}>
						Mehr anzeigen
					</Link>
				)}
			</div>
		);
	};

	const NextStops: React.FC<{}> = () => {
		const stops = [...tripInfo.old, ...tripInfo.actual];

		function formatStatus(status: 'STOPPING' | 'PREDICTED' | 'PLANNED' | 'DEPARTED') {
			switch (status) {
				case 'STOPPING':
					return 'Hält';
				case 'PLANNED':
				case 'PREDICTED':
					return 'Geplant';
				case 'DEPARTED':
					return 'Abgefahren';
			}
		}

		return (
			<div className='grid gap-1'>
				<div className='flex items-center justify-between'>
					<h2>Nächste Haltestellen</h2>
					<HealthIndicator isError={isError} isFetching={isFetching} isPaused={isPaused} />
				</div>
				<div className='grid grid-cols-[1.25rem_1fr] gap-x-2'>
					{stops.map((a, index) => (
						<>
							<div
								className={`flex items-center justify-center ${a.status === 'DEPARTED' ? 'bg-bg' : 'bg-bgLight'} ${index === 0 ? 'rounded-t-full mt-0.5' : ''}  ${index === stops.length - 1 ? 'rounded-b-full mb-0.5' : ''}`}
							>
								<div className={`w-2 h-2 bg-textMuted rounded-full`}></div>
							</div>
							<Link
								href={`/stop/${a.stop.shortName}`}
								key={a.stopSequenceNumber}
								className={`flex items-center justify-between gap-2 my-0.5 rounded p-2 bg-bg border border-border shadow ${a.status === 'DEPARTED' ? 'bg-bgDark border-bgDark' : ''}`}
							>
								<span>
									{a.stop.name}
									<br />
									<span className='text-sm'>{formatStatus(a.status)}</span>
								</span>
								{a.actualDate && <span>{getTimeDisplay(a.actualDate, useRelativeTimes, isPaused, a.status === 'DEPARTED')}</span>}
							</Link>
						</>
					))}
				</div>
			</div>
		);
	};

	return (
		<div className='mx-2 grid gap-3'>
			<h1 className='flex gap-2'>
				<span className='rounded-lg px-2 bg-bgLight border border-border'>{tripInfo.routeName}</span>
				<span>{tripInfo.directionText}</span>
			</h1>
			{tripInfo.actual.length ? (
				<>
					<ConnectingBus />
					<NextStops />
				</>
			) : (
				<>
					<span>Der Bus hat die Endstation erreicht.</span>
					<button onClick={() => router.back()} className='px-2.5 py-1.5 rounded p-2 bg-bgLight border border-border shadow'>
						Zurück
					</button>
				</>
			)}
		</div>
	);
}
