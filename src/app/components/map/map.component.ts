import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { environment } from '../../../environments/environment';
import { LocalDataRetrieverService } from '../../services/localDataRetriever.service';
import { DataManagerService } from '../../services/data-manager.service';
import { Street, StretchCleaningSegment, Geometry } from '../../services/kml-parser.service';

@Component({
  selector: 'app-map',
  standalone: false,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  private map: any;

  constructor(
    private dataManagerService: DataManagerService,
    private localDataRetrieverService: LocalDataRetrieverService
  ) { }

  ngOnInit(): void {
    import('leaflet').then(L => {
      this.map = L.map('map', {
        center: [43.7696, 11.2558],
        zoom: 14
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);

      this.localDataRetrieverService.getStreetCleaningData().subscribe(data => {
        this.drawGeometries(this.filterDuplicateGeometries(data));
      });
    });
  }

  private drawGeometries(streets: Street[]): void {
    for (const street of streets) {
      for (const stretch of street.stretches) {
        const color = this.getColoreByDataPulizia(new Date(stretch.nextCleaning));

        for (const geometryItem of stretch.geometries) {
          const coordinates: L.LatLngExpression[] = geometryItem.geometry.map(coord => [coord.lat, coord.lon]);
          if (!coordinates.length) continue;

          const polyline = L.polyline(coordinates, {
            color,
            weight: 4,
            opacity: 0.8
          }).addTo(this.map);

          const popupContent = `
            📍 ${street.streetName}<br>
            🧭 Tratto: ${stretch.stretchName}<br>
            🗓️ Prossima pulizia: ${this.formatDate(new Date(stretch.nextCleaning))}
          `;

          polyline.bindPopup(popupContent);
        }
      }
    }
  }

  private filterDuplicateGeometries(streets: Street[]): Street[] {
    const geometryMap = new Map<string, { stretch: StretchCleaningSegment; streetName: string }>();

    for (const street of streets) {
      const filteredStretches: StretchCleaningSegment[] = [];

      for (const stretch of street.stretches) {
        const uniqueGeometries: Geometry[] = [];

        for (const geometryItem of stretch.geometries) {
          const geometryKey = geometryItem.geometry.map(coord => `${coord.lat.toFixed(6)},${coord.lon.toFixed(6)}`).join(';');

          const existing = geometryMap.get(geometryKey);
          const currentTime = new Date(stretch.nextCleaning).getTime();

          if (!existing) {
            uniqueGeometries.push(geometryItem);
            geometryMap.set(geometryKey, { stretch, streetName: street.streetName });
          } else {
            const existingTime = new Date(existing.stretch.nextCleaning).getTime();

            if (currentTime < existingTime) {
              geometryMap.set(geometryKey, { stretch, streetName: street.streetName });
            } else if (currentTime === existingTime && existing.streetName !== street.streetName) {
              uniqueGeometries.push(geometryItem);
            }
          }
        }

        if (uniqueGeometries.length > 0) {
          filteredStretches.push({
            ...stretch,
            geometries: uniqueGeometries
          });
        }
      }

      street.stretches = filteredStretches;
    }

    return streets;
  }

  private formatDate(date: Date): string {
    if (date.getTime() === 0) return `Nessuna data disponibile`;

    const giorno = String(date.getDate()).padStart(2, '0');
    const mese = String(date.getMonth() + 1).padStart(2, '0');
    const anno = date.getFullYear();
    const ore = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');

    return `${giorno}/${mese}/${anno} – ${ore}:${min}`;
  }

  private downloadDataset(): void {
    this.dataManagerService.downloadParsedDataset();
  }

  private getColoreByDataPulizia(start: Date): string {
    if (start.getTime() === 0) return 'grey';

    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);

    const giornoNotifica = new Date(start);
    giornoNotifica.setDate(giornoNotifica.getDate() - 1);
    giornoNotifica.setHours(0, 0, 0, 0);

    const diff = Math.floor((giornoNotifica.getTime() - oggi.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 1) return 'red';
    if (diff <= 2) return 'orange';
    return 'green';
  }
}
