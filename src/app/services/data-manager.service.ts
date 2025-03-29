import { Injectable } from '@angular/core';
import { KmlParserService } from './kml-parser.service';
import { DownloadService } from './download.service';
import { LocalDataRetrieverService } from './localDataRetriever.service';
import { STREET_CLEANING_DATA_FILENAME } from '../utils/stringCostantsUtil';
import { from, switchMap } from 'rxjs';
import { ParsedPlacemarkService } from './parsed-placemarks.service';

@Injectable({
  providedIn: 'root'
})
export class DataManagerService {

  constructor(
    private localDataRetrieverService: LocalDataRetrieverService,
    private kmlParserService: KmlParserService,
    private downloadService: DownloadService,
    private parsedPlacemarkService: ParsedPlacemarkService
  ) {}

  public downloadParsedDataset(): void {
    this.localDataRetrieverService.getDatasetFile().subscribe(async kml => {
      await this.kmlParserService.extractRawPlacemarks(kml);
    });
  }

  public downloadParsedPlacemark(): void {
    this.parsedPlacemarkService.parseAndDownloadSegments();
  }

}
