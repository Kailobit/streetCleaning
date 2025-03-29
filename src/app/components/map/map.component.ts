import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { environment } from '../../../environments/environment';
import { LocalDataRetrieverService } from '../../services/localDataRetriever.service';
import { DataManagerService } from '../../services/data-manager.service';

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

      this.dataManagerService.downloadParsedPlacemark();
      
    });
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

  private formatPopup(via: string, data: Date): string {
    if (data.getTime() === 0) return `📍 ${via}<br>Nessuna data disponibile`;

    const giorno = String(data.getDate()).padStart(2, '0');
    const mese = String(data.getMonth() + 1).padStart(2, '0');
    const anno = data.getFullYear();
    const ore = String(data.getHours()).padStart(2, '0');
    const min = String(data.getMinutes()).padStart(2, '0');

    return `📍 ${via}<br>Prossima pulizia: ${giorno}/${mese}/${anno} – ${ore}:${min}`;
  }

  private normalizza(nome: string): string {
    return nome
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '') // rimuove accenti
      .replace(/\./g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase();
  }
}
