import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocalEndpoints, RESPONSE_TYPE_TEXT } from '../utils/stringCostantsUtil';
import { Street } from './kml-parser.service';

@Injectable({
  providedIn: 'root'
})
export class LocalDataRetrieverService {

  constructor(private http: HttpClient) {}

  public getDatasetFile(): Observable<string> {
    return this.http.get(LocalEndpoints.getDatasetFile, { responseType: RESPONSE_TYPE_TEXT });
  }

  public getStreetCleaningData(): Observable<Street[]> {
    return this.http.get<Street[]>(LocalEndpoints.getStreetCleaningDataFile);
  }
  
}
