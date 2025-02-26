import { Injectable, ApplicationRef, ComponentFactoryResolver, Injector } from '@angular/core';
import { Subject } from 'rxjs';
import { SnackbarComponent } from '../dialogs/snackbar/snackbar.component';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  private messagesQueue: string[] = [];
  private snackBarActive: boolean = false;
  private messagesQueue$ = new Subject<string>(); // Emite a próxima mensagem
  private isError: boolean = false;

  constructor(
    private appRef: ApplicationRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector
  ) {}

  // Adicionar mensagem na fila
  show(message: string, isError: boolean = false) {
    this.isError = isError;
    const msg = JSON.stringify({ message, isError });
    this.messagesQueue.push(msg); // Adiciona à fila

    if (!this.snackBarActive) {
      this.processQueue(); // Se não tiver notificação ativa, começa o processo
    }
  }

  // Processa a fila de mensagens
  public processQueue() {
    if (this.messagesQueue.length === 0 || this.snackBarActive) {
      return;
    }

    this.snackBarActive = true;
    const nextMessage = this.messagesQueue[0];
    this.showNotification(nextMessage);
  }

  // Exibe a notificação
  private showNotification(message: string) {
    const factory = this.componentFactoryResolver.resolveComponentFactory(SnackbarComponent);
    const componentRef = factory.create(this.injector);

    componentRef.instance.message = JSON.parse(message).message;
    componentRef.instance.isError = JSON.parse(message).isError;
    componentRef.instance.setComponentRef(componentRef);

    this.appRef.attachView(componentRef.hostView);

    const domElement = (componentRef.hostView as any).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElement);

    // Timeout para remover a notificação
    setTimeout(() => {
      if (this.appRef.viewCount > 0) {
        this.appRef.detachView(componentRef.hostView);
        componentRef.destroy();
        this.messagesQueue.shift(); // Remove a notificação da fila
        this.snackBarActive = false;
        this.processQueue(); // Chama a próxima mensagem da fila
      }
    }, 5000); // Tempo de exibição
  }

  // Getter para acessar a fila
  public getMessagesQueue(): string[] {
    return this.messagesQueue;
  }
}
