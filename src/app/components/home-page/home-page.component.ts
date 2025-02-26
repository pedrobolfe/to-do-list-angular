import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TarefasService } from '../../servicos/tarefas.service';
import { PRIORIDADE, STATUS_TYPE, Tarefa, Tarefas } from '../../interfaces/tarefas.model';
import { UnsubscribeAll } from '../../class/unsubscribe-all';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SnackbarService } from '../../servicos/snackbar.service';
import { TimeTracker } from '../../interfaces/time-tracker.model';
import { Utilities } from '../../utilities/utilities';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent extends UnsubscribeAll implements OnInit {
  PRIORIDADE = PRIORIDADE;
  STATUS_TYPE = STATUS_TYPE;

  tarefas: Tarefas = {
    alta: [],
    media: [],
    baixa: []
  };

  form: FormGroup;

  constructor(
    private _tarefaService: TarefasService,
    private router: Router,
    private fb: FormBuilder,
    private _snackbarService: SnackbarService
  ) {
    super();
    this.form = this.fb.group({
      descricao: ['', [Validators.required]],
      prioridade: ['', [Validators.required]]
    });
  }

  async ngOnInit() {
    this.carregarDados();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  carregarDados(): void {
    this._tarefaService.get().subscribe(
      (tarefas: Tarefa[]) => {
        for (const tarefa of tarefas) {
          if (tarefa.status !== STATUS_TYPE.REMOVIDA){
            this.addTarefaInList(tarefa);
            console.log(tarefa);
          }
        }
      },
      (erro) => {
        console.error('Erro ao carregar tarefas:', erro);
      }
    );
  }

  addTarefaInList(tarefa: Tarefa): void{
    if (tarefa.prioridade === PRIORIDADE.ALTA) {
      this.tarefas.alta.push(tarefa);
    } else if (tarefa.prioridade === PRIORIDADE.MEDIA){
      this.tarefas.media.push(tarefa);
    } else if (tarefa.prioridade === PRIORIDADE.BAIXA) {
      this.tarefas.baixa.push(tarefa);
    }
  }

  statusClasses(status: number) {
    return {
      'em-execucao': status === STATUS_TYPE.EM_ANDAMENTO,
      'concluida': status === STATUS_TYPE.CONCLUIDO,
      'pendente': status === STATUS_TYPE.PENDENTE
    };
  }

  valuePrioridade(prioridade: PRIORIDADE) {
    return prioridade === PRIORIDADE.ALTA ? 'Alta' : prioridade === PRIORIDADE.MEDIA ? 'Media' : 'Baixa';
  }

  removeTarefaInList(id: string, prioridade: PRIORIDADE): void {
    const prioridadeMap = {
      [PRIORIDADE.ALTA] : 'alta',
      [PRIORIDADE.MEDIA] : 'media',
      [PRIORIDADE.BAIXA] : 'baixa'
    };
    for (let i = 0; i < this.tarefas[prioridadeMap[prioridade]].length; i++) {
      if (this.tarefas[prioridadeMap[prioridade]][i].id === id) {
        this.tarefas[prioridadeMap[prioridade]].splice(i, 1);
        break;
      }
    }
  }

  onSubmit() {
    if (this.form.valid) {
      let newCode = 0;
      [...this.tarefas.alta, ...this.tarefas.media, ...this.tarefas.baixa]
        .forEach(t => {
          if (t.codeSystem > newCode) {
            newCode = t.codeSystem;
          }
      });

      let tarefa: Tarefa = {
        id: Utilities.generateUniqueId(),
        nomeTarefa: this.form.get('descricao')?.value,
        prioridade: Number(this.form.get('prioridade')?.value),
        codeSystem: newCode +1,
        dataCreate: new Date().toLocaleDateString('pt-BR'),
        status: STATUS_TYPE.PENDENTE
      };

      this.subs.push(
        this._tarefaService.post(tarefa).subscribe({
          next: (response) => {
            console.log('Tarefa criada com sucesso', response);
            this.addTarefaInList(response); // Adiciona a tarefa retornada pelo servidor
            this.form.reset(); // Limpa o formulário
          },
          error: (error) => {
            console.error('Erro ao criar tarefa', error);
            this._snackbarService.show('A Tarefa não foi criada!', true);
          },
          complete: () => {
            this._snackbarService.show('Tarefa criada com sucesso!', false);
          }
        })
      );
    } else {
      console.log('Form inválido');
    }
  }

  formatTime(milliseconds: number): string {
    const seconds = Math.floor((milliseconds / 1000) % 60);
    const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));

    return `${hours}h ${minutes}m ${seconds}s`;
  }

  async concluirTarefa(tarefa: Tarefa): Promise<void> {
    if (!tarefa || !tarefa.timeTracker || tarefa.timeTracker.dataFim || tarefa.timeTracker.tempo > 0) {
      this._snackbarService.show('Essa tarefa ainda não foi iniciada!', true);
      return;
    }

    tarefa.timeTracker.dataFim = new Date().toLocaleDateString('pt-BR');
    tarefa.status = STATUS_TYPE.CONCLUIDO;
    const tempoGastoEmMilissegundos = Date.now() - tarefa.timeTracker.ultimoPlay!;
    tarefa.timeTracker.tempo = tempoGastoEmMilissegundos;

    tarefa.timeTracker.ultimoPlay = null;

    this._tarefaService.put(tarefa.id, tarefa);
    try {
      const response = await this._tarefaService.put(tarefa.id, tarefa).toPromise();
      console.log('Tarefa atualizada com sucesso:', response);
      this._snackbarService.show(`A Tarefa ${tarefa.nomeTarefa} foi concluida. Tempo em execução ${this.formatTime(tarefa.timeTracker.tempo!)}.`, false);
    } catch (error) {
      this._snackbarService.show('Não foi possível concluir a tarefa!', true);
    }
  }


  async comecarTarefa(tarefa: Tarefa): Promise<void> {
    if (tarefa && !tarefa.timeTracker) {
      const timeTracker: TimeTracker = {
        dataIni: new Date().toLocaleDateString('pt-BR'),
        ultimoPlay: Date.now(),
        tempo: 0
      };

      tarefa.status = STATUS_TYPE.EM_ANDAMENTO;
      tarefa.timeTracker = timeTracker;

      const formatoDataHora = new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const horarioLocal = formatoDataHora.format(new Date(timeTracker.ultimoPlay!));

      try {
        const response = await this._tarefaService.put(tarefa.id, tarefa).toPromise();
        console.log('Tarefa atualizada com sucesso:', response);
        this._snackbarService.show(`A Tarefa ${tarefa.nomeTarefa} Foi iniciada às ${horarioLocal} de ${timeTracker.dataIni}.`, false);
      } catch (error) {
        this._snackbarService.show('Não foi possível começar a tarefa!', true);
      }
    } else {
      this._snackbarService.show('A Tarefa já foi iniciada.', true);
    }
  }

  async removerTarefa(tarefa: Tarefa): Promise<void> {
    tarefa.status = STATUS_TYPE.REMOVIDA;
    this.removeTarefaInList(tarefa.id, tarefa.prioridade);
    this._tarefaService.put(tarefa.id, tarefa).subscribe({
      next: (res) => console.log('Tarefa atualizada com sucesso:', res),
      error: (err) => this._snackbarService.show('A Tarefa não foi arquivada!', true),
      complete: () => this._snackbarService.show('Tarefa arquivada com sucesso!', false)
    });
  }

  seeTarefa(id: string) {
    this.router.navigate(['/tarefa', id]);
  }
}
