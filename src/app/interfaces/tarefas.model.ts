import { TimeTracker } from "./time-tracker.model";

export interface Log {
  data: string;       // Data da alteração
  alteracao: string;  // Descrição da alteração
}

export interface Anexos {
  imgUrl: string; //
  titulo?: string;
}

export enum STATUS_TYPE {
  PENDENTE = 1,
  EM_ANDAMENTO = 2,
  CONCLUIDO = 3,
  REMOVIDA = 4
}

export enum REPETIR {
  DIARIAMENTE = 1,
  SEMANALMENTE = 2,
  MENSALMENTE = 3,
  NUNCA = 4
}

export interface Tarefas {
  [key: string]: Tarefa[]; // acessar as chaves com string
  alta: Tarefa[];
  media: Tarefa[];
  baixa: Tarefa[];
}

export enum PRIORIDADE {
  ALTA = 1,
  MEDIA = 2,
  BAIXA = 3
}

export interface Tarefa {
  id: string;                    // ID da tarefa
  codeSystem: number;
  prioridade: PRIORIDADE; // Prioridade da tarefa (usando valores específicos)
  nomeTarefa: string;             // Nome da tarefa
  status: STATUS_TYPE;                // Status da tarefa (completa ou não)
  dataCreate: string;             // Data de criação da tarefa
  timeTracker?: TimeTracker;      //tempo de andamento da tarefa
  categoria?: string;              // Categoria da tarefa (ex: "Estudos")
  descricao?: string;              // Descrição detalhada da tarefa
  tags?: string[];                 // Tags associadas à tarefa
  notas?: string;                  // Notas adicionais
  dataVencimento?: string;         // Data de vencimento da tarefa
  urgente?: boolean;               // Se a tarefa é urgente ou não
  repetir?: REPETIR; // Frequência de repetição
  logs?: Log[];
  anexos?: Anexos;                 // Logs de alterações da tarefa
}
