export interface KVGStops {
	actual: Actual[];
	directions: any[];
	firstPassageTime: number;
	generalAlerts: GeneralAlert[];
	lastPassageTime: number;
	old: Actual[];
	routes: Route[];
	stopName: string;
	stopShortName: string;
}

export interface Actual {
	actualRelativeTime: number;
	actualTime?: string;
	direction: string;
	mixedTime: string;
	passageid: string;
	patternText: string;
	plannedTime: string;
	routeId: string;
	status: string;
	tripId: string;
	vehicleId: string;
}

export interface GeneralAlert {
	title: string;
}

export interface Route {
	alerts: any[];
	authority: string;
	directions: string[];
	id: string;
	name: string;
	routeType: string;
	shortName: string;
}
