import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { environment } from '../../../environments/environment';
import { LocalDataRetrieverService } from '../../services/localDataRetriever.service';
import { DataManagerService } from '../../services/data-manager.service';
import { StreetCleaningSegment } from '../../services/kml-parser.service';

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
  ) {}

  ngOnInit(): void {
    import('leaflet').then(L => {
      this.map = L.map('map', {
        center: [43.7696, 11.2558],
        zoom: 14
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);

      /* this.downloadDataset(); */
      this.localDataRetrieverService.getStreetCleaningData().subscribe(streetCleaningData => {
        this.drawGeometries(streetCleaningData);
      })

    });
  }

  private drawGeometries(streetCleaningData: StreetCleaningSegment[]): void {
    for (const segment of streetCleaningData) {
      const coordinates: L.LatLngExpression[] = segment.geometry.map(coord => [coord.lat, coord.lon]);
  
      if (coordinates.length === 0) continue;
  
      const color = this.getColoreByDataPulizia(new Date(segment.nextCleaning));
  
      const polyline = L.polyline(coordinates, {
        color,
        weight: 4,
        opacity: 0.8
      }).addTo(this.map);
  
      polyline.bindPopup(`${this.formatPopup(segment.streetName, new Date(segment.nextCleaning))}<br>🧭 Tratto: ${segment.stretchName}`);
    }
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
    if (diff <= 6) return 'orange';
    return 'green';
  }

  private formatPopup(streetName: string, data: Date): string {
    if (data.getTime() === 0) return `📍 ${streetName}<br>Nessuna data disponibile`;

    const giorno = String(data.getDate()).padStart(2, '0');
    const mese = String(data.getMonth() + 1).padStart(2, '0');
    const anno = data.getFullYear();
    const ore = String(data.getHours()).padStart(2, '0');
    const min = String(data.getMinutes()).padStart(2, '0');

    return `📍 ${streetName}<br>Prossima pulizia: ${giorno}/${mese}/${anno} – ${ore}:${min}`;
  }

}
