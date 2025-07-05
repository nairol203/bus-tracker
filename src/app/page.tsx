import { getRecommendedSearches } from './(components)/actions';
import RecommendedSearches from './(components)/RecommendedSearches';
import Searchbar from './(components)/Searchbar';

export default async function Page() {
	const recommendedSearches = await getRecommendedSearches();

	return (
		<div className='mx-2 grid gap-2'>
			<Searchbar />
			<RecommendedSearches recommendedSearches={recommendedSearches}/>
		</div>
	);
}
