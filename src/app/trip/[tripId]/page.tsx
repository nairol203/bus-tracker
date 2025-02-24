import { Metadata, ResolvingMetadata } from 'next';
import { getTripInfo } from 'src/app/(components)/actions';
import Trip from './Trip';

type Params = { params: Promise<{ tripId: string }> };

export async function generateMetadata({ params }: Params, parent: ResolvingMetadata): Promise<Metadata> {
	const { tripId } = await params;

	if (!tripId) {
		return {};
	}

	const data = await getTripInfo(tripId);

	return { title: `${data ? `${data.routeName} ${data.directionText} | KVG Bus Tracker` : 'KVG Bus Tracker'}` };
}

export default async function Page({ params }: Params) {
	const { tripId } = await params;

	return <Trip tripId={tripId} />;
}
