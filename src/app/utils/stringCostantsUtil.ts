import { environment } from "../../environments/environment";

// DOWNLOAD
const ABSTRACT_STREET_DATA = "abstractStreetData";
const GEOMETRY_STREET_DATA = "geometryStreetData";
const JSON_EXTENSION = ".json";
export const GEOMETRY_STREET_DATA_FILENAME = `${GEOMETRY_STREET_DATA}${environment.municipality}${JSON_EXTENSION}`;
export const ABSTRACT_STREET_DATA_FILENAME = `${ABSTRACT_STREET_DATA}${environment.municipality}${JSON_EXTENSION}`;
export const DOWNLOAD_TYPE = "application/json";
export const ANCHOR = "a";

// ALIA
const ALIA_BASE_URL = "/puliziastrade";
const ALIA_MAIN_URL = "/main";
const ALIA_GET_STREETS_URL = "/get_indirizzi";
const ALIA_GET_STRETCHES_URL = "/get_tratti";
const ALIA_CLEANING_URL = "/pulizie";
const ALIA_CALCULATE_DATE_URL = "/calcola_data";
export const AliaEndpoints = {
    getStreets: `${ALIA_BASE_URL}${ALIA_MAIN_URL}${ALIA_GET_STREETS_URL}`,
    getStretches: `${ALIA_BASE_URL}${ALIA_MAIN_URL}${ALIA_GET_STRETCHES_URL}`,
    calculateDate: `${ALIA_BASE_URL}${ALIA_CLEANING_URL}${ALIA_CALCULATE_DATE_URL}`
};

// LOCAL
const ASSETS_URL = "assets/";
export const LocalEndpoints = {
    getLocalGeometryStreetData: `${ASSETS_URL}${GEOMETRY_STREET_DATA_FILENAME}`,
    getLocalAbstractStreetData: `${ASSETS_URL}${ABSTRACT_STREET_DATA_FILENAME}`,
}

// OVERPASS
export const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// HTTP
export const HEADER_KEY_CONTENT_TYPE = "Content-Type";
export const HEADER_VALUE_URLENCODED = "application/x-www-form-urlencoded";
export const RESPONSE_TYPE_TEXT = "text";

// PARAMS
export const PARAM_KEY_MUNICIPALITY = "comune";
export const PARAM_KEY_STREET_ID = "id_strada";
export const PARAM_KEY_DATA = "data";
