"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ChecklistFormData, StatusFinal } from "@/lib/types";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XOctagon,
  Wrench,
} from "lucide-react";

interface Props {
  formData: ChecklistFormData;
  onChange: (updates: Partial<ChecklistFormData>) => void;
}

const CHECKLIST_GERAL_ITEMS = [
  { key: "equipamentoLimpo" as const, label: "Equipamento limpo" },
  { key: "semQuebras" as const, label: "Sem quebras visíveis" },
  { key: "semPecasFaltantes" as const, label: "Sem peças faltantes" },
  { key: "funcionandoCorretamente" as const, label: "Funcionando corretamente" },
  { key: "semSinaisMauUso" as const, label: "Sem sinais de mau uso" },
];

const STATUS_OPTIONS: {
  value: StatusFinal;
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: typeof Shield;
}[] = [
  {
    value: "manutencao_simples",
    label: "Manutenção simples",
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-300",
    icon: Wrench,
  },
  {
    value: "manutencao_critica",
    label: "Manutenção crítica",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-300",
    icon: AlertTriangle,
  },
  {
    value: "liberado",
    label: "Liberado para novo aluguel",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-300",
    icon: CheckCircle,
  },
  {
    value: "avaria_cobranca",
    label: "Avaria com possível cobrança",
    color: "text-red-900",
    bg: "bg-red-100",
    border: "border-red-400",
    icon: XOctagon,
  },
];

export default function StepStatusFinal({ formData, onChange }: Props) {
  const toggleGeral = (key: keyof typeof formData.checklistGeral) => {
    onChange({
      checklistGeral: {
        ...formData.checklistGeral,
        [key]: !formData.checklistGeral[key],
      },
    });
  };

  const setStatus = (status: StatusFinal) => {
    onChange({ statusFinal: status });
  };

  return (
    <div className="space-y-6">
      {/* Checklist Geral */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#1B0F8E]" />
          Checklist Geral
        </h2>
        <div className="space-y-2">
          {CHECKLIST_GERAL_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => toggleGeral(item.key)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl touch-target transition-all border ${
                formData.checklistGeral[item.key]
                  ? "border-green-200 bg-green-50/50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <Checkbox
                checked={formData.checklistGeral[item.key]}
                onCheckedChange={() => toggleGeral(item.key)}
                className="w-6 h-6"
              />
              <Label className="text-sm font-medium cursor-pointer">
                {item.label}
              </Label>
            </button>
          ))}
        </div>
      </div>

      {/* Status Final */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Status Final *
        </h2>
        <div className="space-y-2">
          {STATUS_OPTIONS.map((opt) => {
            const isSelected = formData.statusFinal === opt.value;
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => setStatus(opt.value)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl touch-target transition-all border-2 ${
                  isSelected
                    ? `${opt.border} ${opt.bg} shadow-sm`
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? opt.border : "border-gray-300"
                  }`}
                >
                  {isSelected && (
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        opt.bg.replace("bg-", "bg-").replace("/50", "")
                      }`}
                      style={{
                        backgroundColor:
                          opt.value === "manutencao_simples"
                            ? "#ca8a04"
                            : opt.value === "manutencao_critica"
                            ? "#dc2626"
                            : opt.value === "liberado"
                            ? "#15803d"
                            : "#7f1d1d",
                      }}
                    />
                  )}
                </div>
                <Icon className={`w-5 h-5 ${isSelected ? opt.color : "text-gray-400"}`} />
                <span className={`text-sm font-medium ${isSelected ? opt.color : "text-gray-600"}`}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
