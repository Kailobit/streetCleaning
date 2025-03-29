import { Injectable } from '@angular/core';
import { DOWNLOAD_TYPE, ANCHOR } from '../utils/stringCostantsUtil';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  constructor() {}

  public downloadJsonFile(data: any, filenameWithExtension: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: DOWNLOAD_TYPE });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement(ANCHOR);
    a.href = url;
    a.download = filenameWithExtension;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
