import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AbstractStreetData, GeometryStreetData } from '../models/models';
import { LocalEndpoints } from '../utils/stringCostantsUtil';

@Injectable({
  providedIn: 'root'
})
export class LocalDataRetrieverService {

  constructor(private http: HttpClient) {}

  public getAbstractStreetData(): Observable<AbstractStreetData[]> {
    return this.http.get<AbstractStreetData[]>(LocalEndpoints.getLocalAbstractStreetData);
  }

  public getGeometryStreetData(): Observable<GeometryStreetData[]> {
    return this.http.get<GeometryStreetData[]>(LocalEndpoints.getLocalGeometryStreetData);
  }
}
