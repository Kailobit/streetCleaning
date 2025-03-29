import { Injectable } from '@angular/core';
import { LocalDataRetrieverService } from './localDataRetriever.service';
import { DownloadService } from './download.service';
import { STREET_CLEANING_DATA_FILENAME } from '../utils/stringCostantsUtil';

export interface StreetCleaningSegment {
  streetName: string;
  stretchName: string;
  day: string;
  timeStart: string;
  timeEnd: string;
  weeks: number[];
  parity: 'PARI' | 'DISPARI' | 'ENTRAMBI';
  geometry: { lat: number; lon: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class ParsedPlacemarkService {

  constructor(
    private localDataRetriever: LocalDataRetrieverService,
    private downloadService: DownloadService
  ) {}

  public parseAndDownloadSegments(): void {
    this.localDataRetriever.getRawPlacemarks().subscribe((placemarks: any[]) => {
      const segments: StreetCleaningSegment[] = placemarks
        .map(p => this.parsePlacemark(p))
        .filter((seg): seg is StreetCleaningSegment => seg !== null);

      this.downloadService.downloadJsonFile(segments, STREET_CLEANING_DATA_FILENAME);
    });
  }

  private parsePlacemark(placemark: any): StreetCleaningSegment | null {
    const description = placemark.description?.[0] || '';
    const info = this.extractInfo(description);
    const multiGeometry = placemark.MultiGeometry?.[0]?.LineString ?? [];

    for (const line of multiGeometry) {
      const coordsString = line.coordinates?.[0] || '';
      const geometry = this.parseCoordinates(coordsString);
      if (geometry.length && info) {
        return { ...info, geometry };
      }
    }

    return null;
  }

  private extractInfo(description: string): Omit<StreetCleaningSegment, 'geometry'> | null {
    const extract = (field: string): string => {
      const match = description.match(new RegExp(`<span class=\\"atr-name\\">${field}<\\/span>:<\\/strong> <span class=\\"atr-value\\">(.*?)<\\/span>`));
      return match?.[1]?.trim() || '';
    };

    const streetName = extract('indirizzo');
    const stretchName = extract('tratto_strada');
    const day = this.mapDayCode(extract('giorno_settimana'));
    const timeStart = extract('ora_inizio');
    const timeEnd = extract('ora_fine');
    const parity = extract('pari') === '1' ? 'PARI' : (extract('dispari') === '1' ? 'DISPARI' : 'ENTRAMBI');
    const weeks = ['prima', 'seconda', 'terza', 'quarta', 'quinta']
      .map((label, i) => extract(`${label}_settimana`) === '1' ? i + 1 : null)
      .filter((n): n is number => n !== null);

    if (!streetName || !day || !timeStart || !timeEnd) return null;

    return { streetName, stretchName, day, timeStart, timeEnd, weeks, parity };
  }

  private mapDayCode(code: string): string {
    const days: { [key: string]: string } = {
      'LU': 'Lunedì', 'MA': 'Martedì', 'ME': 'Mercoledì', 'GI': 'Giovedì',
      'VE': 'Venerdì', 'SA': 'Sabato', 'DO': 'Domenica'
    };
    return days[code.toUpperCase()] || 'Non specificato';
  }

  private parseCoordinates(coords: string): { lat: number; lon: number }[] {
    return coords.trim().split(/\s+/).map(pair => {
      const [lon, lat] = pair.split(',').map(Number);
      return { lat, lon };
    }).filter(c => !isNaN(c.lat) && !isNaN(c.lon));
  }
}  
