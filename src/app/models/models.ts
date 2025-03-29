/* defines a stretch with its cleaning infos */
export interface Stretch {
  stretchName: string;
  cleaningData: CleaningData;
}

/* defines cleaning info */
export interface CleaningData {
  start: Date;
  end: Date;
  recurrence: string;
}

/* defines a street and its sub-stretches */
export interface AbstractStreetData {
  streetName: string;
  stretches: Stretch[];
  osmIDs: number[];
}

/* defines lines in space */
export interface GeometryStreetData extends AbstractStreetData {
  geometryStretches: GeometryStretch[];
}

/* defines a line in space */
export interface GeometryStretch {
  geometry: Coordinate[];
}

/* defines a point in space */
export interface Coordinate {
  lat: number;
  lon: number;
}





