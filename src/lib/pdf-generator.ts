import jsPDF from "jspdf";
import type { ChecklistFormData } from "./types";
import { STATUS_LABELS } from "./types";

export function generateChecklistPDF(data: ChecklistFormData): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header bar
  doc.setFillColor(27, 15, 142); // #1B0F8E
  doc.rect(0, 0, pageWidth, 25, "F");

  // Title in header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("SOMAQ", margin, 11);
  doc.setFontSize(8);
  doc.setTextColor(0, 230, 118); // #00E676
  doc.text("LOCAÇÕES", margin, 17);

  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text("Checklist de Devolução de Equipamentos", pageWidth - margin, 14, {
    align: "right",
  });

  y = 35;

  // Section: Dados Gerais
  y = drawSectionTitle(doc, "Dados Gerais", y, margin, contentWidth);
  y = drawInfoRow(doc, "Responsável", data.responsavel, y, margin);
  if (data.motorista) y = drawInfoRow(doc, "Motorista", data.motorista, y, margin);
  if (data.responsavelLocacao)
    y = drawInfoRow(doc, "Resp. Locação", data.responsavelLocacao, y, margin);
  y = drawInfoRow(doc, "Cliente", data.cliente, y, margin);
  y = drawInfoRow(doc, "Patrimônio", data.patrimonio, y, margin);
  y = drawInfoRow(
    doc,
    "Data",
    new Date(data.dataConferencia + "T12:00:00").toLocaleDateString("pt-BR"),
    y,
    margin
  );
  y += 4;

  // Section: Equipamento
  y = drawSectionTitle(doc, "Equipamento", y, margin, contentWidth);
  y = drawInfoRow(doc, "Equipamento", data.equipamento, y, margin);
  y = drawInfoRow(doc, "Categoria", data.categoria, y, margin);
  y += 4;

  // Section: Itens de Verificação
  y = drawSectionTitle(doc, "Itens de Verificação", y, margin, contentWidth);
  Object.entries(data.itensVerificacao).forEach(([item, conforme]) => {
    if (y > 270) {
      doc.addPage();
      y = margin;
    }
    doc.setFontSize(9);
    if (conforme) {
      doc.setTextColor(21, 128, 61);
      doc.text("✓", margin + 2, y);
    } else {
      doc.setTextColor(220, 38, 38);
      doc.text("✗", margin + 2, y);
    }
    doc.setTextColor(60, 60, 60);
    doc.text(item, margin + 10, y);
    y += 5;
  });
  y += 4;

  // Section: Checklist Geral
  if (y > 250) {
    doc.addPage();
    y = margin;
  }
  y = drawSectionTitle(doc, "Checklist Geral", y, margin, contentWidth);
  const geralItems = [
    { label: "Equipamento limpo", ok: data.checklistGeral.equipamentoLimpo },
    { label: "Sem quebras visíveis", ok: data.checklistGeral.semQuebras },
    { label: "Sem peças faltantes", ok: data.checklistGeral.semPecasFaltantes },
    { label: "Funcionando corretamente", ok: data.checklistGeral.funcionandoCorretamente },
    { label: "Sem sinais de mau uso", ok: data.checklistGeral.semSinaisMauUso },
  ];
  geralItems.forEach(({ label, ok }) => {
    doc.setFontSize(9);
    if (ok) {
      doc.setTextColor(21, 128, 61);
      doc.text("✓", margin + 2, y);
    } else {
      doc.setTextColor(220, 38, 38);
      doc.text("✗", margin + 2, y);
    }
    doc.setTextColor(60, 60, 60);
    doc.text(label, margin + 10, y);
    y += 5;
  });
  y += 4;

  // Section: Status Final
  if (y > 260) {
    doc.addPage();
    y = margin;
  }
  y = drawSectionTitle(doc, "Status Final", y, margin, contentWidth);
  const statusInfo = STATUS_LABELS[data.statusFinal];
  if (statusInfo) {
    const statusColors: Record<string, [number, number, number]> = {
      manutencao_simples: [202, 138, 4],
      manutencao_critica: [220, 38, 38],
      liberado: [21, 128, 61],
      avaria_cobranca: [127, 29, 29],
    };
    const color = statusColors[data.statusFinal] || [100, 100, 100];
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(margin, y - 4, contentWidth, 10, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(statusInfo.label, margin + 4, y + 2);
    doc.setFont("helvetica", "normal");
    y += 12;
  }

  // Section: Observações
  if (data.observacoes) {
    if (y > 250) {
      doc.addPage();
      y = margin;
    }
    y = drawSectionTitle(doc, "Observações", y, margin, contentWidth);
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(data.observacoes, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * 4 + 4;
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `SOMAQ Locações — ${new Date().toLocaleString("pt-BR")}`,
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  return doc;
}

function drawSectionTitle(
  doc: jsPDF,
  title: string,
  y: number,
  margin: number,
  width: number
): number {
  doc.setFillColor(240, 240, 248);
  doc.roundedRect(margin, y - 4, width, 8, 1, 1, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(27, 15, 142);
  doc.text(title, margin + 3, y + 1);
  doc.setFont("helvetica", "normal");
  return y + 8;
}

function drawInfoRow(
  doc: jsPDF,
  label: string,
  value: string,
  y: number,
  margin: number
): number {
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`${label}:`, margin + 2, y);
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "bold");
  doc.text(value, margin + 40, y);
  doc.setFont("helvetica", "normal");
  return y + 5;
}
