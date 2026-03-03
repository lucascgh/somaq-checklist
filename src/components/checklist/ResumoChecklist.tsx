"use client";

import type { ChecklistFormData } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Truck,
  Building2,
  Hash,
  Calendar,
  Wrench,
  Camera,
  MessageSquare,
  Shield,
  Edit2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface Props {
  formData: ChecklistFormData;
  onEdit: (step: number) => void;
}

export default function ResumoChecklist({ formData, onEdit }: Props) {
  const statusInfo = STATUS_LABELS[formData.statusFinal];
  const conformeCount = Object.values(formData.itensVerificacao).filter(Boolean).length;
  const totalItens = Object.keys(formData.itensVerificacao).length;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Resumo do Checklist
      </h2>
      <p className="text-sm text-gray-500">
        Revise todas as informações antes de enviar.
      </p>

      {/* Dados Gerais */}
      <Section title="Dados Gerais" onEdit={() => onEdit(0)}>
        <InfoRow icon={User} label="Responsável" value={formData.responsavel} />
        {formData.motorista && (
          <InfoRow icon={Truck} label="Motorista" value={formData.motorista} />
        )}
        <InfoRow icon={Building2} label="Cliente" value={formData.cliente} />
        <InfoRow icon={Hash} label="Patrimônio" value={formData.patrimonio} />
        <InfoRow
          icon={Calendar}
          label="Data"
          value={new Date(formData.dataConferencia + "T12:00:00").toLocaleDateString("pt-BR")}
        />
      </Section>

      {/* Equipamento */}
      <Section title="Equipamento" onEdit={() => onEdit(1)}>
        <InfoRow icon={Wrench} label="Equipamento" value={formData.equipamento} />
        <p className="text-xs text-gray-400">{formData.categoria}</p>
      </Section>

      {/* Itens de Verificação */}
      <Section title={`Verificação (${conformeCount}/${totalItens} OK)`} onEdit={() => onEdit(2)}>
        <div className="space-y-1">
          {Object.entries(formData.itensVerificacao).map(([item, conforme]) => (
            <div key={item} className="flex items-center gap-2 text-sm">
              {conforme ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              )}
              <span className={conforme ? "text-gray-600" : "text-red-600 font-medium"}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* Fotos */}
      <Section title={`Fotos (${formData.fotos.length})`} onEdit={() => onEdit(3)}>
        {formData.fotos.length > 0 ? (
          <div className="grid grid-cols-4 gap-1">
            {formData.fotos.map((foto) => (
              <div key={foto.id} className="aspect-square rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={foto.preview}
                  alt="Foto"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Camera className="w-4 h-4" />
            Nenhuma foto adicionada
          </div>
        )}
      </Section>

      {/* Observações */}
      {formData.observacoes && (
        <Section title="Observações" onEdit={() => onEdit(4)}>
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <p>{formData.observacoes}</p>
          </div>
        </Section>
      )}

      {/* Status Final */}
      <Section title="Status Final" onEdit={() => onEdit(5)}>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#1B0F8E]" />
          {statusInfo && (
            <Badge className={`${statusInfo.bg} ${statusInfo.color} border-0 text-sm px-3 py-1`}>
              {statusInfo.label}
            </Badge>
          )}
        </div>
        <div className="mt-2 space-y-1">
          {Object.entries({
            "Equipamento limpo": formData.checklistGeral.equipamentoLimpo,
            "Sem quebras visíveis": formData.checklistGeral.semQuebras,
            "Sem peças faltantes": formData.checklistGeral.semPecasFaltantes,
            "Funcionando corretamente": formData.checklistGeral.funcionandoCorretamente,
            "Sem sinais de mau uso": formData.checklistGeral.semSinaisMauUso,
          }).map(([label, checked]) => (
            <div key={label} className="flex items-center gap-2 text-sm">
              {checked ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-red-400" />
              )}
              <span className="text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
  onEdit,
}: {
  title: string;
  children: React.ReactNode;
  onEdit: () => void;
}) {
  return (
    <div className="border rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-xs text-[#1B0F8E] hover:underline touch-target"
        >
          <Edit2 className="w-3 h-3" />
          Editar
        </button>
      </div>
      {children}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm py-0.5">
      <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <span className="text-gray-500">{label}:</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}
