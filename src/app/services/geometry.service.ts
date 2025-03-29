import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { concatMap, delay, from, map, Observable, retry, toArray } from 'rxjs';
import { HEADER_KEY_CONTENT_TYPE, HEADER_VALUE_URLENCODED, OVERPASS_URL, PARAM_KEY_DATA } from '../utils/stringCostantsUtil';
import { environment } from '../../environments/environment';
import { createBaseBodyHttp, createHeaders } from '../utils/httpUtils';
import { AbstractStreetData, GeometryStreetData } from '../models/models';
import { OverpassGeometryResponse } from '../models/overpassModels';
import { parseOverpassResponse } from '../utils/parseOverpassResponse';

@Injectable({
  providedIn: 'root'
})
export class GeometryService {

  private SOUTH: number = environment.boundingBox.south;
  private NORTH: number = environment.boundingBox.north;
  private EAST: number = environment.boundingBox.east;
  private WEST: number = environment.boundingBox.west;

  constructor(private http: HttpClient) {}

  private getGeometry(abstractStreetData: AbstractStreetData): Observable<GeometryStreetData> {
    let query: string;

    if (abstractStreetData.osmIDs && abstractStreetData.osmIDs.length > 0) {
      const idList = abstractStreetData.osmIDs.join(',');
      query = `
        [out:json];
        way(id:${idList});
        out geom;
      `;
    } else {
      // fallback se mancano osmIDs
      query = `
        [out:json];
        way["name"~"^${abstractStreetData.streetName}$", i](${this.SOUTH},${this.WEST},${this.NORTH},${this.EAST});
        out geom;
      `;
    }

    return this.http.post<OverpassGeometryResponse>(OVERPASS_URL, createBaseBodyHttp(PARAM_KEY_DATA, query), {
      headers: createHeaders(HEADER_KEY_CONTENT_TYPE, HEADER_VALUE_URLENCODED)
    }).pipe(
      map((response: OverpassGeometryResponse) => parseOverpassResponse(response, abstractStreetData))
    );
  }

  public getAllGeometries(abstractStreetDataArray: AbstractStreetData[]): Observable<GeometryStreetData[]> {
    return from(abstractStreetDataArray).pipe(
      concatMap((abstractStreet, index) =>
        this.getGeometry(abstractStreet).pipe(
          retry(3),
          delay(5000),
          map(result => {
            console.log(`✅ [${index + 1}/${abstractStreetDataArray.length}] ${abstractStreet.streetName}`);
            return result;
          })
        )
      ),
      toArray()
    );
  }
}
