"use client";

import WizardForm from "@/components/checklist/WizardForm";

export default function ChecklistPage() {
  return (
    <div>
      <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">
        Novo Checklist de Devolução
      </h1>
      <WizardForm />
    </div>
  );
}
