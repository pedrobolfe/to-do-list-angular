import { STATUS_TYPE } from './../../interfaces/tarefas.model';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TarefasService } from '../../servicos/tarefas.service';
import { Tarefa } from '../../interfaces/tarefas.model';
import { Router } from '@angular/router';
import { SnackbarService } from '../../servicos/snackbar.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  dateNow = new Date();

  urgentes: Tarefa[] = [];
  tarefasConcluidas: Tarefa[] = [];
  tarefasAndamento: Tarefa[] = [];
  tarefasPendente: Tarefa[] = [];
  tarefasArquivadas: Tarefa[] = [];

  // tarefas perto da data de vencimento
  tarefasVencendo: Tarefa[] = [];

  constructor(
    private _tarefasService: TarefasService,
    private router: Router,
    private _snackbarService: SnackbarService
  ){

  }

  ngOnInit(): void {
    this.getData();
  }

  getData(): void{
    this.urgentes = [];
    this.tarefasAndamento = [];
    this.tarefasArquivadas = [];
    this.tarefasConcluidas = [];
    this.tarefasPendente = [];
    this.tarefasVencendo = [];

    this._tarefasService.get().subscribe(tarefas => {
      tarefas.forEach(tarefa =>{
        if (tarefa.urgente == true && tarefa.status !== STATUS_TYPE.REMOVIDA){
          this.urgentes.push(tarefa);
        }
        if (tarefa.status === STATUS_TYPE.CONCLUIDO){
          this.tarefasConcluidas.push(tarefa);
        }
        if (tarefa.status === STATUS_TYPE.EM_ANDAMENTO){
          this.tarefasAndamento.push(tarefa);
        } else if (tarefa.status === STATUS_TYPE.PENDENTE){
          this.tarefasPendente.push(tarefa);
        } else if (tarefa.status === STATUS_TYPE.REMOVIDA){
          this.tarefasArquivadas.push(tarefa);
        }

        if (tarefa.dataVencimento?.length && tarefa.status !== STATUS_TYPE.CONCLUIDO) {
          const [dia, mes, ano] = tarefa.dataVencimento.split('/').map(Number);
          const dataVencimento = new Date(ano, mes - 1, dia);

          const hoje = new Date();
          const diferencaDias = (dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);

          if (diferencaDias <= 4 && diferencaDias >= 0) {
           this.tarefasVencendo.push(tarefa);
          }
        }
      });
    });
  }


  getTime(tarefa: Tarefa): string {
    let milliseconds: number = 0;
    if (tarefa.timeTracker?.dataFim){
      milliseconds = tarefa.timeTracker?.tempo!;
    } else {
      milliseconds = Date.now() - (tarefa.timeTracker?.ultimoPlay || 0);
    }

    const seconds = Math.floor((milliseconds / 1000) % 60);
    const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));

    return `${hours}h ${minutes}m ${seconds}s`;
  }

  seeTarefa(id: string) {
    this.router.navigate(['/tarefa', id]);
  }

  desarquivar(tarefa: Tarefa){
    tarefa.status = STATUS_TYPE.PENDENTE;
    this._tarefasService.put(tarefa.id, tarefa).subscribe({
      next: (res) => {
        this.getData();
      },
      error: (err) => {
        this._snackbarService.show('A Tarefa não foi desarquivada!', true);
      },
      complete: () => {
        this._snackbarService.show('Tarefa Desarquivada, com sucesso!', false);
      }
    })
  }

  excluir(id: string){
    this._tarefasService.delete(id).subscribe({
      next: () => {
        this._snackbarService.show('Tarefa excluida, com sucesso!', false);
        this.getData();
      },
      error: (err) => {
        this._snackbarService.show('A Tarefa não foi excluida!', true);
      }
    });
  }

  arquivar(tarefa: Tarefa): void {
    tarefa.status = STATUS_TYPE.REMOVIDA;
    this._tarefasService.put(tarefa.id, tarefa).subscribe({
      next: (res) => this.getData(),
      error: (err) => this._snackbarService.show('A Tarefa não foi arquivada!', true),
      complete: () => this._snackbarService.show('Tarefa arquivada com sucesso!', false)
    });
  }


}
