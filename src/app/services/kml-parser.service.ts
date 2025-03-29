import { Injectable } from '@angular/core';
import { parseString } from 'xml2js';
import { DownloadService } from './download.service';

@Injectable({
  providedIn: 'root'
})
export class KmlParserService {

  constructor(private downloadService: DownloadService) { }

  public async extractRawPlacemarks(kml: string): Promise<void> {
    return new Promise((resolve, reject) => {
      parseString(kml, { trim: true }, (err, result) => {
        if (err) return reject(err);

        try {
          const raw = result?.kml?.Document?.[0]?.Folder?.[0]?.Placemark ?? [];
          const placemarks = Array.isArray(raw) ? raw : [raw];

          // ✅ Scarica come file JSON
          this.downloadService.downloadJsonFile(placemarks, 'rawPlacemarks.json');
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  }
}
