// DOWNLOAD
const DATASET = "pulizia_strade";
const KML_EXTENSION = ".kml";
const JSON_EXTENSION = ".json";
const STREET_CLEANING_DATA = "streetCleaningData";
export const STREET_CLEANING_DATA_FILENAME = `${STREET_CLEANING_DATA}${JSON_EXTENSION}`;
export const DOWNLOAD_TYPE = "application/json";
export const ANCHOR = "a";


// LOCAL
const ASSETS_URL = "assets/";
export const LocalEndpoints = {
    getDatasetFile: `${ASSETS_URL}${DATASET}${KML_EXTENSION}`,
    getStreetCleaningDataFile: `${ASSETS_URL}${STREET_CLEANING_DATA_FILENAME}`,
}

// HTTP
export const HEADER_KEY_CONTENT_TYPE = "Content-Type";
export const HEADER_VALUE_URLENCODED = "application/x-www-form-urlencoded";
export const RESPONSE_TYPE_TEXT = "text";

// PARAMS
export const PARAM_KEY_MUNICIPALITY = "comune";
export const PARAM_KEY_STREET_ID = "id_strada";
export const PARAM_KEY_DATA = "data";
