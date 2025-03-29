import { Coordinate } from "./models";

export interface OverpassGeometryResponse {
    version: number;
    generator: string;
    osm3s: {
      timestamp_osm_base: string;
      copyright: string;
    };
    elements: OverpassElement[];
  }
  
  export interface OverpassElement {
    type: 'way';
    id: number;
    bounds: Bounds;
    nodes: number[];
    geometry: Coordinate[];
    tags: Record<string, string>;
  }
  
  export interface Bounds {
    minlat: number;
    minlon: number;
    maxlat: number;
    maxlon: number;
  }
  