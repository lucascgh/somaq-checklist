import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

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

    return NextResponse.json({ success: true, checklist });
  } catch (error) {
    console.error("Erro ao salvar checklist:", error);
    return NextResponse.json(
      { error: "Erro ao salvar checklist" },
      { status: 500 }
    );
  }
}
