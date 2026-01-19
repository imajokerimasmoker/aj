import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private http = inject(HttpClient);

  getFiles(dir: string): Observable<string[]> {
    return this.http.get<string[]>(`/api/files?dir=${encodeURIComponent(dir)}`);
  }
}
