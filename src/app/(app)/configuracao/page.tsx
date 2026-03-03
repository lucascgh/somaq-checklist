"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Table2, Info } from "lucide-react";

export default function ConfiguracaoPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
        Configuração
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Table2 className="w-5 h-5 text-[#1B0F8E]" />
            Equipamentos e Itens de Verificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Os equipamentos e seus itens de verificação podem ser editados
            diretamente na planilha do Google Sheets. Basta adicionar ou
            remover linhas — o app carrega automaticamente.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Como funciona:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>A planilha tem colunas: Equipamento, Categoria, Item de Verificação</li>
                  <li>Cada linha = um item de checklist para aquele equipamento</li>
                  <li>Para adicionar equipamento novo: basta criar novas linhas</li>
                  <li>Para remover: apague as linhas do equipamento</li>
                </ul>
              </div>
            </div>
          </div>

          {process.env.NEXT_PUBLIC_SHEETS_URL ? (
            <a
              href={process.env.NEXT_PUBLIC_SHEETS_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="w-full h-12 bg-[#1B0F8E] hover:bg-[#150B6E] gap-2 touch-target">
                <ExternalLink className="w-5 h-5" />
                Abrir Planilha de Configuração
              </Button>
            </a>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
              <p className="font-medium">Planilha não configurada</p>
              <p className="text-xs mt-1">
                Configure a variável NEXT_PUBLIC_SHEETS_URL no .env.local com o
                link da planilha do Google Sheets. Enquanto isso, o app usa o
                arquivo local equipamentos.json.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
