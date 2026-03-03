export interface Equipamento {
  nome: string;
  categoria: string;
  itensVerificacao: string[];
}

export interface CategoriaEquipamentos {
  categoria: string;
  equipamentos: Equipamento[];
}

export interface ChecklistFormData {
  // Step 1 - Dados Gerais
  responsavel: string;
  motorista: string;
  responsavelLocacao: string;
  cliente: string;
  patrimonio: string;
  dataConferencia: string;
  // Step 2 - Equipamento
  equipamento: string;
  categoria: string;
  // Step 3 - Itens de verificação
  itensVerificacao: Record<string, boolean>;
  // Step 4 - Fotos
  fotos: FileWithPreview[];
  // Step 5 - Observações
  observacoes: string;
  // Step 6 - Checklist geral + Status
  checklistGeral: {
    equipamentoLimpo: boolean;
    semQuebras: boolean;
    semPecasFaltantes: boolean;
    funcionandoCorretamente: boolean;
    semSinaisMauUso: boolean;
  };
  statusFinal: StatusFinal;
}

export interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

export type StatusFinal =
  | "manutencao_simples"
  | "manutencao_critica"
  | "liberado"
  | "avaria_cobranca"
  | "";

export const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  manutencao_simples: {
    label: "Manutenção simples",
    color: "text-yellow-700",
    bg: "bg-yellow-100",
  },
  manutencao_critica: {
    label: "Manutenção crítica",
    color: "text-red-600",
    bg: "bg-red-100",
  },
  liberado: {
    label: "Liberado para novo aluguel",
    color: "text-green-700",
    bg: "bg-green-100",
  },
  avaria_cobranca: {
    label: "Avaria com possível cobrança",
    color: "text-red-900",
    bg: "bg-red-200",
  },
};

export interface ChecklistRecord {
  id: string;
  createdAt: string;
  dataConferencia: string;
  responsavel: string;
  motorista: string | null;
  responsavelLocacao: string | null;
  cliente: string;
  patrimonio: string;
  equipamento: string;
  categoria: string | null;
  observacoes: string | null;
  statusFinal: string;
  pdfUrl: string | null;
  itensVerificacao: { nome: string; conforme: boolean }[];
  checklistGeral: {
    equipamentoLimpo: boolean;
    semQuebras: boolean;
    semPecasFaltantes: boolean;
    funcionandoCorretamente: boolean;
    semSinaisMauUso: boolean;
  } | null;
  fotos: { url: string; nome: string | null }[];
}

export interface DashboardData {
  totalChecklists: number;
  emManutencao: number;
  taxaAprovacao: number;
  avariasNoMes: number;
  equipamentosMaisDevolvidos: { nome: string; total: number }[];
  statusDistribuicao: { status: string; total: number }[];
  devolucoesTimeline: { data: string; total: number }[];
  defeitosMaisComuns: { defeito: string; total: number }[];
  motoristas: { nome: string; total: number }[];
  rankingClientes: {
    cliente: string;
    total: number;
    avarias: number;
    taxaProblemas: number;
  }[];
}
