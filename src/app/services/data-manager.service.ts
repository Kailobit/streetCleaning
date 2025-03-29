import { Injectable } from '@angular/core';
import { ABSTRACT_STREET_DATA_FILENAME, GEOMETRY_STREET_DATA_FILENAME } from '../utils/stringCostantsUtil';
import { AliaService } from './alia.service';
import { DownloadService } from './download.service';
import { GeometryService } from './geometry.service';
import { LocalDataRetrieverService } from './localDataRetriever.service';

@Injectable({
  providedIn: 'root'
})
export class DataManagerService {

  constructor(
    private aliaService: AliaService,
    private downloadService: DownloadService,
    private geometryService: GeometryService,
    private localDataRetrieverService: LocalDataRetrieverService
  ) { }

  public downloadGeometryStreetData(): void {
    this.localDataRetrieverService.getAbstractStreetData().subscribe(abstractStreetData => {
      this.geometryService.getAllGeometries(abstractStreetData).subscribe(geometryStreetData => {
        this.downloadService.downloadJsonFile(geometryStreetData, GEOMETRY_STREET_DATA_FILENAME);
      })
    });
  }

  public downloadAbstractStreetData(municipality: string): void {
    this.aliaService.getAbstractStreetDataMunicipality(municipality).subscribe(abstractStreetData => {
      this.downloadService.downloadJsonFile(abstractStreetData, ABSTRACT_STREET_DATA_FILENAME);
    });
  }
}
