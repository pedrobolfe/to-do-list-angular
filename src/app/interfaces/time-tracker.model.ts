export interface TimeTracker {
  dataIni: string;         // Data de início da tarefa (pode ser vazio)
  dataFim?: string;         // Data de fim da tarefa (pode ser vazio)
  tempo: number;           // Tempo (em minutos ou segundos) gasto na tarefa
  ultimoPlay: number | null; // Último play (timestamp ou null) null para quando estiver pausada
}
