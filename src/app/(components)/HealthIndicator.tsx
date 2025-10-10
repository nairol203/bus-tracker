export default function HealthIndicator({ isError, isFetching, isPaused }: { isFetching: boolean; isError: boolean; isPaused: boolean }) {
	if (isPaused)
		return (
			<div className='flex items-center gap-2 rounded-full bg-textMuted px-2.5 py-1 shadow'>
				<span>Offline</span>
				<span className='relative flex h-3 w-3'>
					<span className={`${isFetching && 'animate-ping'} absolute inline-flex h-full w-full rounded-full bg-text opacity-75`}></span>
					<span className={'relative inline-flex h-3 w-3 rounded-full bg-textMuted'}></span>
				</span>
			</div>
		);

	if (isError)
		return (
			<div className='flex items-center gap-2 rounded-full bg-textMuted px-2.5 py-1 shadow'>
				<span>Error</span>
				<span className='relative flex h-3 w-3'>
					<span className={`${isFetching && 'animate-ping'} absolute inline-flex h-full w-full rounded-full bg-text opacity-75`}></span>
					<span className={'relative inline-flex h-3 w-3 rounded-full bg-textMuted'}></span>
				</span>
			</div>
		);

	return (
		<div className='px-2.5 py-1'>
			<span className='relative flex h-3 w-3'>
				<span className={`${isFetching && 'animate-ping'} absolute inline-flex h-full w-full rounded-full bg-text opacity-75`}></span>
				<span className={`relative inline-flex h-3 w-3 rounded-full bg-textMuted`}></span>
			</span>
		</div>
	);
}
