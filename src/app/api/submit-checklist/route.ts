import { NextRequest, NextResponse } from "next/server";
import { submitChecklistToDrive, isAppsScriptConfigured } from "@/lib/google-drive";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Try Google Drive (Apps Script) first
    if (isAppsScriptConfigured()) {
      const result = await submitChecklistToDrive({
        dataConferencia: data.dataConferencia,
        responsavel: data.responsavel,
        motorista: data.motorista || "",
        responsavelLocacao: data.responsavelLocacao || "",
        cliente: data.cliente,
        patrimonio: data.patrimonio,
        equipamento: data.equipamento,
        categoria: data.categoria || "",
        observacoes: data.observacoes || "",
        statusFinal: data.statusFinal,
        itensVerificacao: data.itensVerificacao || {},
        checklistGeral: data.checklistGeral || {},
        pdfBase64: data.pdfBase64 || "",
        pdfFileName: data.pdfFileName || "",
        fotos: data.fotos || [],
      });

      if (result.success) {
        return NextResponse.json(result);
      }

      console.error("Apps Script error, trying local DB:", result.error);
    }

    // Fallback to local Prisma DB
    const { prisma } = await import("@/lib/database");

    const checklist = await prisma.checklist.create({
      data: {
        dataConferencia: new Date(data.dataConferencia),
        responsavel: data.responsavel,
        motorista: data.motorista || null,
        responsavelLocacao: data.responsavelLocacao || null,
        cliente: data.cliente,
        patrimonio: data.patrimonio,
        equipamento: data.equipamento,
        categoria: data.categoria || null,
        observacoes: data.observacoes || null,
        statusFinal: data.statusFinal,
        itensVerificacao: {
          create: Object.entries(data.itensVerificacao || {}).map(
            ([nome, conforme]) => ({
              nome,
              conforme: conforme as boolean,
            })
          ),
        },
        checklistGeral: data.checklistGeral
          ? {
              create: {
                equipamentoLimpo: data.checklistGeral.equipamentoLimpo,
                semQuebras: data.checklistGeral.semQuebras,
                semPecasFaltantes: data.checklistGeral.semPecasFaltantes,
                funcionandoCorretamente: data.checklistGeral.funcionandoCorretamente,
                semSinaisMauUso: data.checklistGeral.semSinaisMauUso,
              },
            }
          : undefined,
        fotos: {
          create: (data.fotosUrls || []).map((url: string, i: number) => ({
            url,
            nome: `foto_${i + 1}`,
          })),
        },
      },
      include: {
        itensVerificacao: true,
        checklistGeral: true,
        fotos: true,
      },
    });

    return NextResponse.json({ success: true, id: checklist.id, checklist });
  } catch (error) {
    console.error("Erro ao salvar checklist:", error);
    return NextResponse.json(
      { error: "Erro ao salvar checklist" },
      { status: 500 }
    );
  }
}
