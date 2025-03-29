import { Injectable } from '@angular/core';
import { KmlParserService } from './kml-parser.service';
import { DownloadService } from './download.service';
import { LocalDataRetrieverService } from './localDataRetriever.service';
import { STREET_CLEANING_DATA_FILENAME } from '../utils/stringCostantsUtil';
import { from, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataManagerService {

  constructor(
    private localDataRetrieverService: LocalDataRetrieverService,
    private kmlParserService: KmlParserService,
    private downloadService: DownloadService
  ) {}

  public downloadParsedDataset(): void {
    this.localDataRetrieverService.getDatasetFile().pipe(
      switchMap(xml => from(this.kmlParserService.getParsedSegments(xml)))
    ).subscribe(parsed => {
      this.downloadService.downloadJsonFile(parsed, STREET_CLEANING_DATA_FILENAME);
    });
  }
}
