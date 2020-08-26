const COUNTY_DATA_URL = 'https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=false&outSR=4326&f=json';
const TODAYS_SUMMED_DATA_URL = 'https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?f=json&where=1=1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&outStatistics=[{%22statisticType%22:%22sum%22,%22onStatisticField%22:%22cases%22,%22outStatisticFieldName%22:%22totalCases%22},{%22statisticType%22:%22sum%22,%22onStatisticField%22:%22deaths%22,%22outStatisticFieldName%22:%22totalDeaths%22}]&resultType=standard&cacheHint=true';

export type RkiCountyFeatureAttributes = {
	"OBJECTID": number,
	"ADE": number,
	"GF": number,
	"BSG": number,
	"RS": string,
	"AGS": string,
	"SDV_RS": string,
	"GEN": string,
	"BEZ": string,
	"IBZ": number,
	"BEM": string,
	"NBD": string,
	"SN_L": string,
	"SN_R": string,
	"SN_K": string,
	"SN_V1": string,
	"SN_V2": string,
	"SN_G": string,
	"FK_S3": string,
	"NUTS": string,
	"RS_0": string,
	"AGS_0": string,
	"WSK": string,
	"EWZ": number,
	"KFL": number,
	"DEBKG_ID": string,
	"Shape__Area": number,
	"Shape__Length": number,
	"death_rate": number,
	"cases": number,
	"deaths": number,
	"cases_per_100k": number,
	"cases_per_population": number,
	"BL": string,
	"BL_ID": string,
	"county": string,
	"last_update": string,
	"cases7_per_100k": number,
	"recovered": null
}

export type RkiSummedDayData =  {"totalCases":number, "totalDeaths":number};

export type RkiFeatureData<T> = {
	features: [{ attributes: T }]
}


type ResolveAndReject<T> = [(arg: T)=>void, (arg: any)=>void];

class DataLoader<T> {

	private isLoading = false;
	private listeners: ResolveAndReject<T>[] = []

	private loadedData: T | null = null;

	constructor(
		private url: string
	){}

	load() {
		if(this.loadedData !== null) {
			return Promise.resolve(this.loadedData);
		}

		this.loadDataOnce();

		return new Promise<T>((resolve, reject) => {
			this.listeners.push([resolve, reject]);
		});
	}

	private async loadDataOnce() {
		if(this.isLoading){
			return;
		}
		this.isLoading = true;

		try {
			this.loadedData = await (await fetch(this.url)).json() as T;
			
			this.listeners.forEach(([resolve, reject]) => resolve(this.loadedData!));
		}catch(e) {
			this.listeners.forEach(([resolve, reject]) => reject(e));
		}
	}
}



let countyDataLoader = new DataLoader<RkiFeatureData<RkiCountyFeatureAttributes>>(COUNTY_DATA_URL);
export function loadCountyData(): Promise<RkiFeatureData<RkiCountyFeatureAttributes>> {
	return countyDataLoader.load();
}

let todaysSummedDataLoader = new DataLoader<RkiFeatureData<RkiSummedDayData>>(TODAYS_SUMMED_DATA_URL);
export function loadTodaysSummedData(): Promise<RkiFeatureData<RkiSummedDayData>> {
	return todaysSummedDataLoader.load();
}