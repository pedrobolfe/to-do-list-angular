import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tarefa } from '../interfaces/tarefas.model';

@Injectable({
  providedIn: 'root'
})
export class TarefasService {
  private apiUrl = 'http://localhost:3000/tarefas';

  constructor(private http: HttpClient) { }

  get(): Observable<Tarefa[]> {
    return this.http.get<Tarefa[]>(this.apiUrl);
  }

  getById(id: string): Observable<Tarefa>{
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Tarefa>(url);
  }

  post(novaTarefa: Tarefa): Observable<Tarefa> {
    return this.http.post<Tarefa>(this.apiUrl, novaTarefa, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }


  put(id: string, tarefaAtualizada: Tarefa): Observable<Tarefa> {
    return this.http.put<Tarefa>(`${this.apiUrl}/${id}`, tarefaAtualizada, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
