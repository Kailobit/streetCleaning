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
  nextCleaning: Date;
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
          const geometryMap = new Map<string, StreetCleaningSegment>();
          const now = new Date();
  
          for (const placemark of placemarks) {
            const description = placemark.description?.[0] || '';
            const info = this.extractInfo(description);
  
            const multiGeometry = placemark.MultiGeometry?.[0];
            if (!multiGeometry) continue;
  
            const lineStrings = this.extractLineStrings(multiGeometry);
  
            for (const line of lineStrings) {
              const coordsString = line.coordinates?.[0] || '';
              const geometry = this.parseCoordinates(coordsString);
              if (!geometry.length) continue;
  
              const geometryKey = geometry
                .map(coord => `${coord.lat.toFixed(6)},${coord.lon.toFixed(6)}`)
                .join(';');
  
              const newSegment: StreetCleaningSegment = {
                ...info,
                geometry
              };
  
              const existingSegment = geometryMap.get(geometryKey);
  
              if (!existingSegment) {
                geometryMap.set(geometryKey, newSegment);
              } else {
                const existingDate = new Date(existingSegment.nextCleaning);
                const newDate = new Date(newSegment.nextCleaning);
  
                const existingDiff = Math.abs(existingDate.getTime() - now.getTime());
                const newDiff = Math.abs(newDate.getTime() - now.getTime());
  
                if (newDiff < existingDiff) {
                  geometryMap.set(geometryKey, newSegment);
                }
              }
            }
          }
  
          resolve(Array.from(geometryMap.values()));
        } catch (e) {
          reject(e);
        }
      });
    });
  }
  
  

  private extractLineStrings(multiGeometry: any): any[] {
    // Caso normale
    if (Array.isArray(multiGeometry.LineString)) {
      return multiGeometry.LineString;
    }

    // Caso con MultiGeometry annidata
    if (
      Array.isArray(multiGeometry.MultiGeometry) &&
      Array.isArray(multiGeometry.MultiGeometry[0]?.LineString)
    ) {
      return multiGeometry.MultiGeometry[0].LineString;
    }

    return [];
  }

  private extractInfo(description: string): Omit<StreetCleaningSegment, 'geometry'> {
    const extract = (field: string): string => {
      const match = description.match(
        new RegExp(`<span class=\\"atr-name\\">${field}<\\/span>:<\\/strong> <span class=\\"atr-value\\">(.*?)<\\/span>`, 'i')
      );
      return match?.[1]?.trim() || '';
    };
  
    const streetName = extract('indirizzo') || 'Sconosciuta';
    const stretchName = extract('tratto_strada') || '';
    const day = this.mapDayCode(extract('giorno_settimana')) || 'Non specificato';
    const timeStart = extract('ora_inizio') || '00:00';
    const timeEnd = extract('ora_fine') || '06:00';
    const parity = extract('pari') === '1' ? 'PARI' : extract('dispari') === '1' ? 'DISPARI' : 'ENTRAMBI';
  
    const weeks = ['prima', 'seconda', 'terza', 'quarta', 'quinta']
      .map((label, i) => extract(`${label}_settimana`) === '1' ? i + 1 : null)
      .filter((n): n is number => n !== null);
  
    const nextCleaning = this.calculateNextCleaning(day, timeStart, weeks, parity);
  
    return { streetName, stretchName, day, timeStart, timeEnd, weeks, parity, nextCleaning };
  }

  private calculateNextCleaning(
    targetDay: string,
    timeStart: string,
    validWeeks: number[],
    parity: 'PARI' | 'DISPARI' | 'ENTRAMBI'
  ): Date {
    const dayMap = {
      'Lunedì': 1,
      'Martedì': 2,
      'Mercoledì': 3,
      'Giovedì': 4,
      'Venerdì': 5,
      'Sabato': 6,
      'Domenica': 0,
    };
  
    const [hh, mm] = timeStart.split(':').map(Number);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    for (let offset = 0; offset < 60; offset++) { // massimo 2 mesi
      const date = new Date(today);
      date.setDate(date.getDate() + offset);
  
      const weekday = date.getDay();
      const weekOfMonth = Math.floor((date.getDate() - 1) / 7) + 1;
      const isValidDay = weekday === dayMap[targetDay as keyof typeof dayMap];
      const isValidWeek = validWeeks.includes(weekOfMonth);
      const isValidParity =
        parity === 'ENTRAMBI' ||
        (parity === 'PARI' && date.getDate() % 2 === 0) ||
        (parity === 'DISPARI' && date.getDate() % 2 === 1);
  
      if (isValidDay && isValidWeek && isValidParity) {
        date.setHours(hh, mm, 0, 0);
        return date;
      }
    }
  
    return new Date(0); // valore fallback se non trovato
  }
  
  

  private mapDayCode(code: string): string {
    const days: { [key: string]: string } = {
      'LU': 'Lunedì',
      'MA': 'Martedì',
      'ME': 'Mercoledì',
      'GI': 'Giovedì',
      'VE': 'Venerdì',
      'SA': 'Sabato',
      'DO': 'Domenica'
    };
    return days[code?.toUpperCase?.()] || 'Non specificato';
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
