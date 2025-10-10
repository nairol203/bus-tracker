function filterIdenticalAlerts<T extends GeneralAlert | RouteAlert>(alerts: T[]) {
	const uniqueAlerts: T[] = [];

	for (const alert of alerts) {
		const isIdentical = uniqueAlerts.some((uniqueAlert) => JSON.stringify(uniqueAlert) === JSON.stringify(alert));
		if (isIdentical) continue;
		uniqueAlerts.push(alert);
	}

	return uniqueAlerts;
}

export function GeneralAlerts({ data }: { data: NormalizedKVGStops }) {
	return (
		<>
			{filterIdenticalAlerts(data.generalAlerts).map((alert, index) => (
				<div className='shadows flex gap-2 rounded p-2 bg-bg border border-border shadow text-text' key={`alert-${index}-${data.stopShortName}`}>
					<svg xmlns='http://www.w3.org/2000/svg' height={35} width={35} viewBox='0 0 512 512' fill='fill-text'>
						<path d='M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z' />
					</svg>
					<span className='font-medium'>{alert.title}</span>
				</div>
			))}
		</>
	);
}

export function RouteAlerts({ data, direction, routeId }: { data: NormalizedKVGStops; routeId?: string | null; direction?: string | null }) {
	return (
		<>
			{data.routes
				.filter((route) => (routeId ? route.id === routeId : true))
				.map((route) =>
					filterIdenticalAlerts(route.alerts)
						.filter((alert) => (direction ? alert.direction.includes(direction) : true))
						.map((alert, index) => (
							<div
								className='grid gap-1 md:flex md:justify-between rounded p-2 bg-bg border border-border shadow text-text'
								key={`alert-${index}-${data.stopShortName}`}
							>
								<div className='flex gap-4'>
									<span>{route.name}</span>
									<span>{alert.direction.join('; ')}</span>
								</div>
								<div className='flex gap-2'>
									<svg xmlns='http://www.w3.org/2000/svg' height={25} width={25} viewBox='0 0 512 512' className='fill-textMuted'>
										<path d='M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z' />
									</svg>
									<span>{alert.title}</span>
								</div>
							</div>
						)),
				)}
		</>
	);
}
