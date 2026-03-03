"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ChecklistFormData } from "@/lib/types";
import { User, Truck, UserCheck, Building2, Hash, Calendar } from "lucide-react";

interface Props {
  formData: ChecklistFormData;
  onChange: (updates: Partial<ChecklistFormData>) => void;
}

export default function StepDadosGerais({ formData, onChange }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Dados Gerais
      </h2>

      <div className="space-y-3">
        <div>
          <Label htmlFor="responsavel" className="text-sm font-medium flex items-center gap-2 mb-1.5">
            <User className="w-4 h-4 text-[#1B0F8E]" />
            Responsável pela revisão *
          </Label>
          <Input
            id="responsavel"
            value={formData.responsavel}
            onChange={(e) => onChange({ responsavel: e.target.value })}
            placeholder="Ex: Shirley"
            className="h-12 text-base touch-target"
          />
        </div>

        <div>
          <Label htmlFor="motorista" className="text-sm font-medium flex items-center gap-2 mb-1.5">
            <Truck className="w-4 h-4 text-[#1B0F8E]" />
            Motorista
          </Label>
          <Input
            id="motorista"
            value={formData.motorista}
            onChange={(e) => onChange({ motorista: e.target.value })}
            placeholder="Ex: Petrick"
            className="h-12 text-base touch-target"
          />
        </div>

        <div>
          <Label htmlFor="responsavelLocacao" className="text-sm font-medium flex items-center gap-2 mb-1.5">
            <UserCheck className="w-4 h-4 text-[#1B0F8E]" />
            Responsável pela locação
          </Label>
          <Input
            id="responsavelLocacao"
            value={formData.responsavelLocacao}
            onChange={(e) => onChange({ responsavelLocacao: e.target.value })}
            placeholder="Opcional"
            className="h-12 text-base touch-target"
          />
        </div>

        <div>
          <Label htmlFor="cliente" className="text-sm font-medium flex items-center gap-2 mb-1.5">
            <Building2 className="w-4 h-4 text-[#1B0F8E]" />
            Cliente *
          </Label>
          <Input
            id="cliente"
            value={formData.cliente}
            onChange={(e) => onChange({ cliente: e.target.value })}
            placeholder="Ex: Laplace Engenharia"
            className="h-12 text-base touch-target"
          />
        </div>

        <div>
          <Label htmlFor="patrimonio" className="text-sm font-medium flex items-center gap-2 mb-1.5">
            <Hash className="w-4 h-4 text-[#1B0F8E]" />
            Número de patrimônio *
          </Label>
          <Input
            id="patrimonio"
            value={formData.patrimonio}
            onChange={(e) => onChange({ patrimonio: e.target.value })}
            placeholder="Ex: 001234"
            className="h-12 text-base touch-target"
          />
        </div>

        <div>
          <Label htmlFor="dataConferencia" className="text-sm font-medium flex items-center gap-2 mb-1.5">
            <Calendar className="w-4 h-4 text-[#1B0F8E]" />
            Data da conferência *
          </Label>
          <Input
            id="dataConferencia"
            type="date"
            value={formData.dataConferencia}
            onChange={(e) => onChange({ dataConferencia: e.target.value })}
            className="h-12 text-base touch-target"
          />
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-4">* Campos obrigatórios</p>
    </div>
  );
}
