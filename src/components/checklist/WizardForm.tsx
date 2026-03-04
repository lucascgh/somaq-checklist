"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ChecklistFormData } from "@/lib/types";
import { generateChecklistPDF } from "@/lib/pdf-generator";
import StepDadosGerais from "./StepDadosGerais";
import StepEquipamento from "./StepEquipamento";
import StepItensVerificacao from "./StepItensVerificacao";
import StepFotos from "./StepFotos";
import StepObservacoes from "./StepObservacoes";
import StepStatusFinal from "./StepStatusFinal";
import ResumoChecklist from "./ResumoChecklist";

const STEPS = [
  { title: "Dados Gerais", number: 1 },
  { title: "Equipamento", number: 2 },
  { title: "Verificação", number: 3 },
  { title: "Fotos", number: 4 },
  { title: "Observações", number: 5 },
  { title: "Status Final", number: 6 },
  { title: "Resumo", number: 7 },
];

const initialFormData: ChecklistFormData = {
  responsavel: "",
  motorista: "",
  responsavelLocacao: "",
  cliente: "",
  patrimonio: "",
  dataConferencia: new Date().toISOString().split("T")[0],
  equipamento: "",
  categoria: "",
  itensVerificacao: {},
  fotos: [],
  observacoes: "",
  checklistGeral: {
    equipamentoLimpo: false,
    semQuebras: false,
    semPecasFaltantes: false,
    funcionandoCorretamente: false,
    semSinaisMauUso: false,
  },
  statusFinal: "",
};

export default function WizardForm() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<ChecklistFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const updateFormData = (updates: Partial<ChecklistFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const canGoNext = (): boolean => {
    switch (step) {
      case 0:
        return !!(formData.responsavel && formData.cliente && formData.patrimonio && formData.dataConferencia);
      case 1:
        return !!formData.equipamento;
      case 2:
        return Object.keys(formData.itensVerificacao).length > 0;
      case 3:
        return true; // Fotos opcionais
      case 4:
        return true; // Observações opcionais
      case 5:
        return !!formData.statusFinal;
      default:
        return true;
    }
  };

  const fileToBase64Clean = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Strip data URI prefix, keep only base64
        resolve(result.split(",")[1] || result);
      };
      reader.onerror = reject;
    });
  };

  const [submitStatus, setSubmitStatus] = useState("");

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Step 1: Generate PDF as clean base64
      setSubmitStatus("Gerando PDF...");
      const pdf = generateChecklistPDF(formData);
      const pdfDataUri = pdf.output("datauristring");
      const pdfBase64 = pdfDataUri.split(",")[1] || pdfDataUri;
      const pdfFileName = `Checklist_${formData.equipamento.replace(/[^a-zA-Z0-9]/g, "_")}_${formData.patrimonio}_${formData.dataConferencia}.pdf`;

      // Step 2: Submit checklist data + PDF (without photos)
      setSubmitStatus("Salvando no Drive...");
      const res = await fetch("/api/submit-checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responsavel: formData.responsavel,
          motorista: formData.motorista,
          responsavelLocacao: formData.responsavelLocacao,
          cliente: formData.cliente,
          patrimonio: formData.patrimonio,
          dataConferencia: formData.dataConferencia,
          equipamento: formData.equipamento,
          categoria: formData.categoria,
          observacoes: formData.observacoes,
          statusFinal: formData.statusFinal,
          itensVerificacao: formData.itensVerificacao,
          checklistGeral: formData.checklistGeral,
          pdfBase64,
          pdfFileName,
          fotos: [],
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert("Erro ao enviar checklist: " + (errData.error || "Tente novamente."));
        return;
      }

      const result = await res.json();
      const checklistId = result.id;

      // Step 3: Upload photos one by one (if any)
      if (formData.fotos.length > 0 && checklistId) {
        for (let i = 0; i < formData.fotos.length; i++) {
          setSubmitStatus(`Enviando foto ${i + 1}/${formData.fotos.length}...`);
          const base64 = await fileToBase64Clean(formData.fotos[i].file);
          await fetch("/api/upload-photo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              checklistId,
              base64,
              fileName: `Foto_${formData.patrimonio}_${i + 1}.jpg`,
            }),
          });
        }
      }

      // PDF saved to Drive only — no local download
      router.push("/sucesso");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Erro de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
      setSubmitStatus("");
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            Passo {step + 1} de {STEPS.length}
          </span>
          <span className="text-sm font-medium text-[#1B0F8E]">
            {STEPS[step].title}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#1B0F8E] to-[#00E676] rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        {/* Step indicators - mobile scrollable */}
        <div className="flex gap-1 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                i === step
                  ? "bg-[#1B0F8E] text-white"
                  : i < step
                  ? "bg-[#00E676]/20 text-[#1B0F8E]"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <span className="font-bold">{s.number}</span>
              <span className="hidden sm:inline">{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="p-4 lg:p-6 shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 && (
              <StepDadosGerais formData={formData} onChange={updateFormData} />
            )}
            {step === 1 && (
              <StepEquipamento formData={formData} onChange={updateFormData} />
            )}
            {step === 2 && (
              <StepItensVerificacao formData={formData} onChange={updateFormData} />
            )}
            {step === 3 && (
              <StepFotos formData={formData} onChange={updateFormData} />
            )}
            {step === 4 && (
              <StepObservacoes formData={formData} onChange={updateFormData} />
            )}
            {step === 5 && (
              <StepStatusFinal formData={formData} onChange={updateFormData} />
            )}
            {step === 6 && (
              <ResumoChecklist formData={formData} onEdit={(s) => setStep(s)} />
            )}
          </motion.div>
        </AnimatePresence>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex gap-3 mt-4 safe-bottom">
        {step > 0 && (
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            className="flex-1 h-12 text-base touch-target"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Voltar
          </Button>
        )}

        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canGoNext()}
            className="flex-1 h-12 text-base bg-[#1B0F8E] hover:bg-[#150B6E] touch-target"
          >
            Próximo
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 h-12 text-base bg-[#00E676] hover:bg-[#00C853] text-gray-900 font-semibold touch-target"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Send className="w-5 h-5 mr-2" />
            )}
            {submitting ? (submitStatus || "Enviando...") : "Confirmar e Enviar"}
          </Button>
        )}
      </div>
    </div>
  );
}
