'use client';

import { Switch } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { getTripInfo } from 'src/app/(components)/actions';

function timeToDate(time: string) {
	const [hours, minutes] = time.split(':').map(Number);

	const date = new Date();

	if (hours < date.getHours()) {
		date.setDate(date.getDate() + 1);
	}

	date.setHours(hours);
	date.setMinutes(minutes);
	date.setSeconds(0);
	date.setMilliseconds(0);

	return date;
}

function formatTimeDifference(date: Date, old = false) {
	const currentTime = new Date();
	const timeDifferenceMin = Math.floor((old ? currentTime.getTime() - date.getTime() : date.getTime() - currentTime.getTime()) / 1000 / 60);

	if (timeDifferenceMin <= 0) {
		return 'Sofort';
	} else {
		return `${timeDifferenceMin} min`;
	}
}

export default function Page({ params }: { params: { tripId: string } }) {
	const { data: tripInfo, isError } = useQuery({
		queryKey: ['tripInfo'],
		queryFn: async () => {
			const res = await getTripInfo(params.tripId);
			return res;
		},
		refetchInterval: 10_000,
	});

	if (isError) {
		return (
			<div className='grid gap-2 mx-2'>
				<h1>Fehler</h1>
				<span>Die Fahrt konnte nicht gefunden werden.</span>
				<Link href='/' className='px-2.5 py-1.5 rounded bg-white/80 dark:bg-white/10'>
					Zurück
				</Link>
			</div>
		);
	}

	if (!tripInfo) {
		return (
			<div className='grid gap-2 mx-2'>
				<div className='flex'>
					<h1 className='skeleton'>Lorem ipsum dolor sit.</h1>
				</div>
				<div className='grid gap-1'>
					<div className='flex justify-between p-2 rounded bg-white/80 dark:bg-white/10 skeleton'>Lorem ipsum dolor sit amet.</div>
					<div className='flex justify-between p-2 rounded bg-white/80 dark:bg-white/10 skeleton'>Lorem ipsum dolor sit amet.</div>
					<div className='flex justify-between p-2 rounded bg-white/80 dark:bg-white/10 skeleton'>Lorem ipsum dolor sit amet.</div>
					<div className='flex justify-between p-2 rounded bg-white/80 dark:bg-white/10 skeleton'>Lorem ipsum dolor sit amet.</div>
					<div className='flex justify-between p-2 rounded bg-white/80 dark:bg-white/10 skeleton'>Lorem ipsum dolor sit amet.</div>
					<div className='flex justify-between p-2 rounded bg-white/80 dark:bg-white/10 skeleton'>Lorem ipsum dolor sit amet.</div>
					<div className='flex justify-between p-2 rounded bg-white/80 dark:bg-white/10 skeleton'>Lorem ipsum dolor sit amet.</div>
					<div className='flex justify-between p-2 rounded bg-white/80 dark:bg-white/10 skeleton'>Lorem ipsum dolor sit amet.</div>
					<div className='flex justify-between p-2 rounded bg-white/80 dark:bg-white/10 skeleton'>Lorem ipsum dolor sit amet.</div>
				</div>
			</div>
		);
	}

	return (
		<div className='grid gap-2 mx-2'>
			<h1>
				{tripInfo.routeName} {tripInfo.directionText}
			</h1>
			<div className='grid gap-1'>
				{tripInfo.actual.map(a => (
					<div key={a.stop_seq_num} className='flex justify-between p-2 rounded bg-white/80 dark:bg-white/10'>
						<span>{a.stop.name}</span>
						{a.status !== 'STOPPING' && <span>{formatTimeDifference(timeToDate(a.actualTime || a.plannedTime))}</span>}
					</div>
				))}
			</div>
		</div>
	);
}
