import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const where: Record<string, unknown> = {};
  if (startDate || endDate) {
    where.dataConferencia = {};
    if (startDate) (where.dataConferencia as Record<string, unknown>).gte = new Date(startDate);
    if (endDate) (where.dataConferencia as Record<string, unknown>).lte = new Date(endDate);
  }

  const checklists = await prisma.checklist.findMany({
    where,
    include: {
      itensVerificacao: true,
      checklistGeral: true,
    },
    orderBy: { dataConferencia: "desc" },
  });

  const total = checklists.length;
  const emManutencao = checklists.filter(
    (c) => c.statusFinal === "manutencao_simples" || c.statusFinal === "manutencao_critica"
  ).length;
  const liberados = checklists.filter((c) => c.statusFinal === "liberado").length;
  const taxaAprovacao = total > 0 ? Math.round((liberados / total) * 100) : 0;

  const now = new Date();
  const mesAtual = now.getMonth();
  const anoAtual = now.getFullYear();
  const avariasNoMes = checklists.filter((c) => {
    const d = new Date(c.dataConferencia);
    return d.getMonth() === mesAtual && d.getFullYear() === anoAtual && c.statusFinal === "avaria_cobranca";
  }).length;

  // Equipamentos mais devolvidos
  const equipCount: Record<string, number> = {};
  checklists.forEach((c) => {
    equipCount[c.equipamento] = (equipCount[c.equipamento] || 0) + 1;
  });
  const equipamentosMaisDevolvidos = Object.entries(equipCount)
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // Distribuição de status
  const statusCount: Record<string, number> = {};
  checklists.forEach((c) => {
    statusCount[c.statusFinal] = (statusCount[c.statusFinal] || 0) + 1;
  });
  const statusDistribuicao = Object.entries(statusCount).map(([status, total]) => ({
    status,
    total,
  }));

  // Timeline de devoluções
  const dateCount: Record<string, number> = {};
  checklists.forEach((c) => {
    const date = new Date(c.dataConferencia).toISOString().split("T")[0];
    dateCount[date] = (dateCount[date] || 0) + 1;
  });
  const devolucoesTimeline = Object.entries(dateCount)
    .map(([data, total]) => ({ data, total }))
    .sort((a, b) => a.data.localeCompare(b.data));

  // Defeitos mais comuns (itens não conformes)
  const defeitoCount: Record<string, number> = {};
  checklists.forEach((c) => {
    c.itensVerificacao.forEach((item) => {
      if (!item.conforme) {
        defeitoCount[item.nome] = (defeitoCount[item.nome] || 0) + 1;
      }
    });
  });
  const defeitosMaisComuns = Object.entries(defeitoCount)
    .map(([defeito, total]) => ({ defeito, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // Motoristas
  const motoristaCount: Record<string, number> = {};
  checklists.forEach((c) => {
    if (c.motorista) {
      motoristaCount[c.motorista] = (motoristaCount[c.motorista] || 0) + 1;
    }
  });
  const motoristas = Object.entries(motoristaCount)
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total);

  // Ranking de clientes
  const clienteData: Record<string, { total: number; avarias: number }> = {};
  checklists.forEach((c) => {
    if (!clienteData[c.cliente]) {
      clienteData[c.cliente] = { total: 0, avarias: 0 };
    }
    clienteData[c.cliente].total++;
    if (c.statusFinal === "avaria_cobranca") {
      clienteData[c.cliente].avarias++;
    }
  });
  const rankingClientes = Object.entries(clienteData)
    .map(([cliente, data]) => ({
      cliente,
      total: data.total,
      avarias: data.avarias,
      taxaProblemas: data.total > 0 ? Math.round((data.avarias / data.total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return NextResponse.json({
    totalChecklists: total,
    emManutencao,
    taxaAprovacao,
    avariasNoMes,
    equipamentosMaisDevolvidos,
    statusDistribuicao,
    devolucoesTimeline,
    defeitosMaisComuns,
    motoristas,
    rankingClientes,
  });
}
