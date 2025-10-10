import { useBusStore } from '@/stores/bus-store';
import Link from 'next/link';
import { GeneralAlerts, RouteAlerts } from './alerts';
import BusStatus from './BusStatus';

export default function KVGTable({
	data,
	isPaused,
	direction,
	routeId,
	showGeneralAlerts = true,
	showRouteAlerts = true,
}: {
	data: NormalizedKVGStops;
	isPaused: boolean;
	routeId?: string | null;
	direction?: string | null;
	showGeneralAlerts?: boolean;
	showRouteAlerts?: boolean;
}) {
	const { useRelativeTimes } = useBusStore();

	return (
		<div className='grid gap-1'>
			{showGeneralAlerts && <GeneralAlerts data={data} />}
			{showRouteAlerts && <RouteAlerts data={data} direction={direction} routeId={routeId} />}
			{data.actual.length ? (
				data.actual.map((actual, index) => (
					<Link
						href={`/trip/${actual.tripId}`}
						className='grid grid-cols-[35px_1fr_75px] justify-between gap-2 rounded p-2 bg-bg border border-border shadow text-text'
						key={`${index}-${actual.tripId}`}
					>
						<span className='rounded-lg bg-bgLight border border-border text-center'>{actual.patternText}</span>
						<span className='whitespace-nowrap'>{actual.direction}</span>
						<BusStatus data={actual} isPaused={isPaused} useRelative={useRelativeTimes} />
					</Link>
				))
			) : (
				<div className='p-2'>Keine Daten</div>
			)}
		</div>
	);
}

export function SkeletonKVGTable() {
	return (
		<div className='skeleton grid grid-cols-[35px_1fr_75px] justify-between gap-2 rounded p-2'>
			<span>43</span>
			<span>Kiel Hbf</span>
			<span className='row-span-2 flex items-center justify-end'>22:26</span>
			<span className='col-span-2 text-sm'>Planmäßig</span>
		</div>
	);
}
