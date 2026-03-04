"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ChecklistFormData, CategoriaEquipamentos } from "@/lib/types";
import { CheckCircle2, XCircle } from "lucide-react";

interface Props {
  formData: ChecklistFormData;
  onChange: (updates: Partial<ChecklistFormData>) => void;
}

export default function StepItensVerificacao({ formData, onChange }: Props) {
  const [itens, setItens] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/equipamentos")
      .then((res) => res.json())
      .then((data: CategoriaEquipamentos[]) => {
        for (const cat of data) {
          const eq = cat.equipamentos.find((e) => e.nome === formData.equipamento);
          if (eq) {
            setItens(eq.itensVerificacao);
            // Initialize all items as unchecked — user must mark conformes
            const initial: Record<string, boolean> = {};
            eq.itensVerificacao.forEach((item) => {
              initial[item] = formData.itensVerificacao[item] ?? false;
            });
            onChange({ itensVerificacao: initial });
            break;
          }
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.equipamento]);

  const toggleItem = (item: string) => {
    onChange({
      itensVerificacao: {
        ...formData.itensVerificacao,
        [item]: !formData.itensVerificacao[item],
      },
    });
  };

  const conformeCount = Object.values(formData.itensVerificacao).filter(Boolean).length;
  const totalCount = itens.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Itens de Verificação
        </h2>
        <span className="text-sm text-gray-500">
          {conformeCount}/{totalCount} OK
        </span>
      </div>

      <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
        <strong>{formData.equipamento}</strong> — marque os itens que estão{" "}
        <span className="text-green-600 font-medium">conformes</span>. Itens
        desmarcados serão tratados como{" "}
        <span className="text-red-600 font-medium">problema encontrado</span>.
      </p>

      <div className="space-y-2">
        {itens.map((item) => {
          const isChecked = formData.itensVerificacao[item] ?? false;
          return (
            <button
              key={item}
              onClick={() => toggleItem(item)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl touch-target transition-all border ${
                isChecked
                  ? "border-green-200 bg-green-50/50"
                  : "border-red-200 bg-red-50/50"
              }`}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => toggleItem(item)}
                className="w-6 h-6 rounded-md"
              />
              <Label className="flex-1 text-left text-sm font-medium cursor-pointer">
                {item}
              </Label>
              {isChecked ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
