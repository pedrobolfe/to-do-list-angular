import { Component, Input } from '@angular/core';
import { PRIORIDADE, REPETIR, Tarefa } from '../../interfaces/tarefas.model';
import { TarefasService } from '../../servicos/tarefas.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UnsubscribeAll } from '../../class/unsubscribe-all';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SnackbarService } from '../../servicos/snackbar.service';
import { Categoria, CategoriasService } from '../../servicos/categorias.service';
import { Utilities } from '../../utilities/utilities';

@Component({
  selector: 'app-tarefa',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './tarefa.component.html',
  styleUrls: ['./tarefa.component.scss'], // Corrigido o nome da propriedade
})
export class TarefaComponent extends UnsubscribeAll {
  tarefa!: Tarefa;
  PRIORIDADE = PRIORIDADE;
  REPETIR = REPETIR;
  tempo: string = '';
  form: FormGroup;
  categorias: Categoria[] = [];
  categoria: string = '';

  constructor(
    private _tarefaService: TarefasService,
    private _categoriaService: CategoriasService,
    private route: ActivatedRoute,
    private router: Router,
    private _snackbarService: SnackbarService
  ) {
    super();
    this.form = new FormBuilder().group({
      prioridade: ['', [Validators.required]],
      nomeTarefa: ['', [Validators.required]],
      categoria: [''],
      descricao: [''],
      tags: [''],
      notas: [''],
      dataVencimento: [''],
      urgente: [''],
      repetir: [''],
      imgUrl: [''],
      titulo: ['']
    });
  }

  ngOnInit(): void {
    this.getData();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  getData(): void {
    const idTarefa = this.route.snapshot.paramMap.get('id')!;

    this.subs.push(
      this._tarefaService.getById(idTarefa).subscribe((tarefa) => {
        this.tarefa = tarefa;
        const dataVencimentoFormatada = tarefa.dataVencimento
          ? tarefa.dataVencimento.split('/').reverse().join('-')
          : null;

        this.form.patchValue({
          prioridade: tarefa.prioridade,
          nomeTarefa: tarefa.nomeTarefa,
          categoria: tarefa.categoria,
          descricao: tarefa.descricao || '',
          tags: tarefa.tags || '',
          notas: tarefa.notas || '',
          dataVencimento: dataVencimentoFormatada || '',
          urgente: tarefa.urgente || false,
          repetir: tarefa.repetir || 4,
          imgUrl: tarefa.anexos?.imgUrl || '',
          titulo: tarefa.anexos?.titulo || ''
        });

        this.getTime();
      })
    );
    this.getCategorias();
  }

  setValues(){
    let tarefa: Tarefa = this.tarefa;
    const formData = this.form.value;
    const dataVencimentoFormatada = formData.dataVencimento
      ? formData.dataVencimento.split('-').reverse().join('/') // Formato YYYY-MM-DD para dd/mm/yyyy
      : null;

    tarefa.nomeTarefa = formData.nomeTarefa;
    tarefa.prioridade = Number(formData.prioridade);
    tarefa.categoria = formData.categoria;
    tarefa.descricao = formData.descricao;
    tarefa.tags = formData.tags;
    tarefa.notas = formData.notas;
    tarefa.dataVencimento = dataVencimentoFormatada || '';
    tarefa.urgente = formData.urgente;
    tarefa.repetir = formData.repetir;

    tarefa.anexos = {
      imgUrl: formData.imgURL,
      titulo: formData.titulo
    };

    //console.log(tarefa);
    this.tarefa = tarefa;
  }

  getTime(): void {
    let milliseconds: number = 0;
    if (this.tarefa.timeTracker?.dataFim){
      milliseconds = this.tarefa.timeTracker?.tempo!;
    } else {
      milliseconds = Date.now() - (this.tarefa.timeTracker?.ultimoPlay || 0);
    }

    const seconds = Math.floor((milliseconds / 1000) % 60);
    const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));

    this.tempo =  `${hours}h ${minutes}m ${seconds}s`;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.setValues();

    this._tarefaService.put(this.tarefa.id, this.tarefa).subscribe({
      next: (res) => {
        console.log('Tarefa salva com sucesso!', res);
      },
      error: (err) => {
        this._snackbarService.show('A Tarefa não foi atualizada!', true);
      },
      complete: () => {
        //this.router.navigate(['']);
        this._snackbarService.show('Tarefa Atualizada, com sucesso!', false);

      }
    });
  }

  criarCategoria(): void {
    const categoria: Categoria = {
      id: Utilities.generateUniqueId(),
      categoria: this.categoria,
      arquivada: false
    }
    this._categoriaService.post(categoria).subscribe({
        next: (response) => {},
        error: (error) => {
          console.error('Erro ao criar tarefa', error);
          this._snackbarService.show('A Categoria refa não foi criada!', true);
        },
        complete: () => {
          this._snackbarService.show('Categoria criada com sucesso!', false);
        }
      })
  }

  getCategorias(): void {
    this._categoriaService.get().subscribe(categorias => {this.categorias = categorias; console.log(this.categorias);});
  }

  saveImage(file: any){
    // fazer quando tiver banco de dados
  }
}
