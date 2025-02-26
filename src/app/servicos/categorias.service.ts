import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private apiUrl = 'http://localhost:3000/categorias';

  constructor(
    private http: HttpClient
  ) { }

  get(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  post(categoria: Categoria): Observable<Categoria> {
    return this.http.post<Categoria>(this.apiUrl, categoria, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
      })
    });
  }

  put(id: string, categoria: Categoria): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.apiUrl}/${id}`, categoria, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

}

export interface Categoria {
  id: string;
  categoria: string;
  arquivada: boolean;
}
