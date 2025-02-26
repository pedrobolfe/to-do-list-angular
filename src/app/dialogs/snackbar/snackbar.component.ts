import { Component, OnInit, OnDestroy, ComponentRef, ViewEncapsulation } from '@angular/core';
import { SnackbarService } from '../../servicos/snackbar.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule],
})
export class SnackbarComponent implements OnInit, OnDestroy {
  message: string = '';
  isError: boolean = false;
  private componentRef!: ComponentRef<any>;

  constructor(private _snackbarService: SnackbarService) {}

  ngOnInit(): void {
    // A lógica de recepção da mensagem é feita via o serviço
  }

  ngOnDestroy(): void {
    // Cleanup se necessário
  }

  // Método para fechar a notificação manualmente
  onClose(): void {
    this._snackbarService.getMessagesQueue().shift(); // Remove a mensagem
    this._snackbarService.processQueue(); // Inicia a exibição da próxima mensagem
    this.componentRef.destroy();
  }

  // Método para configurar a referência do componente
  setComponentRef(componentRef: ComponentRef<any>): void {
    this.componentRef = componentRef;
  }
}
