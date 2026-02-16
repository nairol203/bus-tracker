import RecommendedSearches from './(components)/RecommendedSearches';
import Searchbar from './(components)/Searchbar';

export default function Page() {
	return (
		<div className='mx-2 grid gap-2'>
			<Searchbar />
			<noscript>⚠️ Bitte aktivieren Sie JavaScript, um die Suche zu benutzen.</noscript>
			<RecommendedSearches />
		</div>
	);
}
