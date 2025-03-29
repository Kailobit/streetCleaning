import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, concatMap, delay, from, map, of, toArray } from 'rxjs';
import { parseHtmlToCleaningData } from '../utils/parseHtmlToCleaningData';
import { AbstractStreetData, CleaningData, Stretch } from '../models/models';
import { createBaseBodyURLSearch, createDateRequestBodyURLSearch, createHeaders } from '../utils/httpUtils';
import {
  AliaEndpoints,
  HEADER_KEY_CONTENT_TYPE,
  HEADER_VALUE_URLENCODED,
  PARAM_KEY_MUNICIPALITY,
  PARAM_KEY_STREET_ID,
  RESPONSE_TYPE_TEXT
} from '../utils/stringCostantsUtil';
import { AliaDateRequestPayload, AliaStreetResponse, AliaStretchResponse } from '../models/aliaModels';
import { groupStretchesByStreet } from '../utils/groupStretchesByStreet';
import { PhotonService } from './photon.service';
import { DownloadService } from './download.service';

@Injectable({
  providedIn: 'root'
})
export class AliaService {

  constructor(
    private http: HttpClient,
    private photonService: PhotonService
  ) { }

  public getStreets(municipality: string): Observable<AliaStreetResponse[]> {
    return this.http.post<AliaStreetResponse[]>(
      AliaEndpoints.getStreets,
      createBaseBodyURLSearch(PARAM_KEY_MUNICIPALITY, municipality).toString(),
      { headers: createHeaders(HEADER_KEY_CONTENT_TYPE, HEADER_VALUE_URLENCODED) }
    );
  }

  public getStretches(streetID: string): Observable<AliaStretchResponse[]> {
    return this.http.post<AliaStretchResponse[]>(
      AliaEndpoints.getStretches,
      createBaseBodyURLSearch(PARAM_KEY_STREET_ID, streetID).toString(),
      { headers: createHeaders(HEADER_KEY_CONTENT_TYPE, HEADER_VALUE_URLENCODED) }
    );
  }

  public getStretchCleaningData(payload: AliaDateRequestPayload): Observable<CleaningData> {
    return this.http.post(
      AliaEndpoints.calculateDate,
      createDateRequestBodyURLSearch(payload).toString(),
      {
        headers: createHeaders(HEADER_KEY_CONTENT_TYPE, HEADER_VALUE_URLENCODED),
        responseType: RESPONSE_TYPE_TEXT
      }
    ).pipe(map((html: string) => parseHtmlToCleaningData(html)));
  }

  public getAbstractStreetDataMunicipality(municipality: string): Observable<AbstractStreetData[]> {
    return this.getStreets(municipality).pipe(
      concatMap(strade => from(strade)),
      concatMap(strada =>
        this.getStretches(strada.id_strada).pipe(
          concatMap(tratti => {
            const hasStretches = (tratti ?? []).length > 0;

            if (hasStretches) {
              return from(tratti).pipe(
                concatMap(tratto => {
                  const payload: AliaDateRequestPayload = {
                    id_strada: strada.id_strada,
                    trattostrada: tratto.tratto,
                    tipo_strada: strada.tipo_strada,
                    civico: '',
                    comune: municipality
                  };

                  return this.getStretchCleaningData(payload).pipe(
                    map(cleaningData => ({
                      streetName: strada.nome,
                      stretch: {
                        stretchName: tratto.tratto,
                        cleaningData
                      }
                    })),
                    delay(100)
                  );
                })
              );
            } else {
              const payload: AliaDateRequestPayload = {
                id_strada: strada.id_strada,
                trattostrada: '',
                tipo_strada: strada.tipo_strada,
                civico: '',
                comune: municipality
              };

              return this.getStretchCleaningData(payload).pipe(
                map(cleaningData => ({
                  streetName: strada.nome,
                  stretch: {
                    stretchName: 'INTERA STRADA',
                    cleaningData
                  }
                })),
                delay(100)
              );
            }
          })
        )
      ),
      toArray(),
      map(groupStretchesByStreet),
      concatMap((abstractStreetArray: AbstractStreetData[]) =>
        from(abstractStreetArray).pipe(
          concatMap(street =>
            this.photonService.getOsmIDsFromStreetName(street.streetName).pipe(
              map(osmIDs => ({
                ...street,
                osmIDs
              }))
            )
          ),
          toArray()
        )
      )
    );
  }

}
