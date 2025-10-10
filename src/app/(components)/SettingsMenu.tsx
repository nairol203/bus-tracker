'use client';

import { useBusStore } from '@/stores/bus-store';
import { CloseButton, Dialog, DialogBackdrop, DialogPanel, DialogTitle, Select, Switch } from '@headlessui/react';
import { useTheme } from 'next-themes';
import { useState } from 'react';

export default function SettingsMenu() {
	const [isOpen, setIsOpen] = useState(false);
	const { useRelativeTimes, toggleRelativeTimes } = useBusStore();
	const { theme, setTheme } = useTheme();

	return (
		<>
			<button onClick={() => setIsOpen(true)} className='rounded p-2'>
				<svg xmlns='http://www.w3.org/2000/svg' height={20} width={20} viewBox='0 0 512 512' className='fill-text'>
					<path d='M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z' />
				</svg>
			</button>
			<Dialog open={isOpen} onClose={() => setIsOpen(false)} className='relative z-50'>
				<DialogBackdrop className='fixed inset-0 bg-text/50' />
				<div className='fixed inset-0 flex w-screen items-center justify-center p-4'>
					<DialogPanel className='min-h-80 min-w-80 max-w-lg space-y-4 rounded bg-bgDark border border-border p-4 '>
						<div className='flex items-center justify-between gap-2'>
							<DialogTitle className='font-bold'>Einstellungen</DialogTitle>
							<CloseButton className='rounded p-2'>
								<svg xmlns='http://www.w3.org/2000/svg' height={24} width={24} viewBox='0 0 384 512' className='fill-text'>
									<path d='M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z' />
								</svg>
							</CloseButton>
						</div>
						<div className='grid grid-cols-[1fr_6.5rem] items-center justify-between gap-1'>
							<h3>Darstellungsmodus</h3>
							<Select
								className='row-span-2 flex items-center justify-between gap-2 rounded p-2 bg-bg border border-border shadow text-text'
								onChange={(e) => setTheme(e.target.value)}
							>
								<option key='light' value='light' selected={theme === 'light'}>
									Hell
								</option>
								<option key='dark' value='dark' selected={theme === 'dark'}>
									Dunkel
								</option>
								<option key='system' value='system' selected={theme === 'system'}>
									System
								</option>
							</Select>
							<span className='text-sm'>Legt den Darstellungsmodus für die Website fest.</span>
						</div>
						<div className='grid grid-cols-[1fr_2.75rem] items-center justify-between gap-1'>
							<h3>Dynamische Abfahrtzeiten</h3>
							<Switch
								checked={useRelativeTimes}
								onChange={toggleRelativeTimes}
								className='group row-span-2 inline-flex h-6 w-11 items-center rounded-full bg-bg transition duration-200 data-[checked]:bg-textMuted'
							>
								<span className='size-4 translate-x-1 rounded-full bg-textMuted transition duration-200 group-data-[checked]:translate-x-6 group-data-[checked]:bg-bgLight' />
							</Switch>
							<span className='text-sm'>Die Abfahrtzeiten werden in Minuten statt zu einer festen Uhrzeit angezeigt.</span>
						</div>
					</DialogPanel>
				</div>
			</Dialog>
		</>
	);
}
