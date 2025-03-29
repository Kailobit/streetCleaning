import { AbstractStreetData, GeometryStreetData, GeometryStretch, Coordinate } from '../models/models';
import { OverpassGeometryResponse } from '../models/overpassModels';

/**
 * Converte una response di Overpass in un oggetto GeometryStreetData
 * @param response - la risposta JSON da Overpass
 * @param abstractData - i dati logici senza geometria
 * @returns GeometryStreetData
 */
export function parseOverpassResponse(response: OverpassGeometryResponse, abstractData: AbstractStreetData): GeometryStreetData {

  const geometryStretches: GeometryStretch[] = (response.elements ?? [])
    .filter(el => el.geometry && el.geometry.length > 0)
    .map(el => ({
      geometry: el.geometry.map(g => ({ lat: g.lat, lon: g.lon } as Coordinate))
    }));

  const geometryStreetData: GeometryStreetData = {
    streetName: abstractData.streetName,
    stretches: abstractData.stretches,
    osmIDs: abstractData.osmIDs,
    geometryStretches
  };

  return geometryStreetData;
}
