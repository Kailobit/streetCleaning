import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PhotonService {

  private readonly MAX_DISTANCE_KM = 20;
  private readonly CENTER_LAT = (environment.boundingBox.south + environment.boundingBox.north) / 2;
  private readonly CENTER_LON = (environment.boundingBox.west + environment.boundingBox.east) / 2;

  constructor(private http: HttpClient) { }

  public getOsmIDsFromStreetName(streetName: string): Observable<number[]> {
    const queryUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(streetName)}&lon=${this.CENTER_LON}&lat=${this.CENTER_LAT}&limit=5`;

    return this.http.get<any>(queryUrl).pipe(
      map(res =>
        res.features
          .filter((f: any) => this.isWithinDistance(f.geometry.coordinates[1], f.geometry.coordinates[0]))
          .map((f: any) => f.properties.osm_id)
      )
    );
  }

  private isWithinDistance(lat: number, lon: number): boolean {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(lat - this.CENTER_LAT);
    const dLon = this.deg2rad(lon - this.CENTER_LON);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.deg2rad(this.CENTER_LAT)) * Math.cos(this.deg2rad(lat)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance <= this.MAX_DISTANCE_KM;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}