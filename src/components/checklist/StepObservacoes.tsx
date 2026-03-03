"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ChecklistFormData } from "@/lib/types";
import { MessageSquare } from "lucide-react";

interface Props {
  formData: ChecklistFormData;
  onChange: (updates: Partial<ChecklistFormData>) => void;
}

export default function StepObservacoes({ formData, onChange }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Observações
      </h2>

      <div>
        <Label
          htmlFor="observacoes"
          className="text-sm font-medium flex items-center gap-2 mb-2"
        >
          <MessageSquare className="w-4 h-4 text-[#1B0F8E]" />
          Observações adicionais
        </Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={(e) => onChange({ observacoes: e.target.value })}
          placeholder="Descreva quaisquer observações sobre o equipamento, danos, peças faltantes, etc."
          rows={6}
          className="text-base resize-none"
        />
        <p className="text-xs text-gray-400 mt-2">
          Campo opcional. Use para detalhar problemas encontrados.
        </p>
      </div>
    </div>
  );
}
