import { Injectable } from '@angular/core';
import { parseString } from 'xml2js';

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
export class KmlParserService {
  constructor() { }

  public getParsedSegments(kml: string): Promise<StreetCleaningSegment[]> {
    return new Promise((resolve, reject) => {
      parseString(kml, { trim: true }, (err, result) => {
        if (err) return reject(err);

        try {
          const placemarks = result?.kml?.Document?.[0]?.Folder?.[0].Placemark ?? [];
          const segments: StreetCleaningSegment[] = [];
          let counter = 0;

          for (const placemark of placemarks) {
            const description = placemark.description?.[0] || '';
            const info = this.extractInfo(description);

            const multiGeometry = placemark.MultiGeometry?.[0]?.LineString ?? [];
            for (const line of multiGeometry) {
              const coordsString = line.coordinates?.[0] || '';
              const geometry = this.parseCoordinates(coordsString);
              if (geometry.length && info) {
                segments.push({
                  ...info,
                  geometry
                });
                console.log(counter++);
              } else {
                console.warn('❌ Placemark scartato geometry:', {info: info, geometry: geometry});
              }
            }
          }

          resolve(segments);

        } catch (e) {
          reject(e);
        }
      });
    });
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

    if (!streetName || !day || !timeStart || !timeEnd) {
      console.warn('❌ Placemark scartato info:', {
        streetName, stretchName, day, timeStart, timeEnd
      });
      return null;
    }


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
    return coords
      .trim()
      .split(/\s+/)
      .map(coord => {
        const [lon, lat] = coord.split(',').map(Number);
        return { lat, lon };
      })
      .filter(c => !isNaN(c.lat) && !isNaN(c.lon));
  }
}

