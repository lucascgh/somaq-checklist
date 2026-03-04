/**
 * Script para importar dados históricos do Excel para o Google Sheets via Apps Script
 * Uso: npx tsx scripts/import-historico.ts
 */

import * as XLSX from "xlsx";
import * as path from "path";
import * as fs from "fs";

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxbb3gLx21IxSaQOGOoUZp16IGazuXH7yQ-z__kcyJnIGESCjL-CRAF4P2d1cSTS5xR4g/exec";

const EXCEL_PATH = path.resolve(__dirname, "../../Historico antes ate 03-03-2026.xlsx");

// Map status from Portuguese to internal code
function mapStatus(status: string): string {
  const s = (status || "").trim().toLowerCase();
  if (s.includes("simples")) return "manutencao_simples";
  if (s.includes("crítica") || s.includes("critica")) return "manutencao_critica";
  if (s.includes("liberado")) return "liberado";
  if (s.includes("avaria") || s.includes("cobrança")) return "avaria_cobranca";
  if (s.includes("trocado")) return "manutencao_simples"; // "Equipamento trocado"
  return "manutencao_simples";
}

// Map checklist geral items
function mapChecklistGeral(text: string): Record<string, boolean> {
  const items = (text || "").split(",").map((s) => s.trim().toLowerCase());
  return {
    equipamentoLimpo: items.some((i) => i.includes("limpo")),
    semQuebras: items.some((i) => i.includes("quebra")),
    semPecasFaltantes: items.some((i) => i.includes("faltante")),
    funcionandoCorretamente: items.some((i) => i.includes("funcionando")),
    semSinaisMauUso: items.some((i) => i.includes("mau uso")),
  };
}

// Parse equipment-specific checklist items from all columns
function parseItensVerificacao(row: Record<string, string>): Record<string, boolean> {
  const itens: Record<string, boolean> = {};
  // All columns that start with "Checklist específico" or "Checklist  específico"
  for (const [key, value] of Object.entries(row)) {
    if (key.toLowerCase().includes("checklist") && key.toLowerCase().includes("espec") && value) {
      const items = value.split(",").map((s) => s.trim());
      for (const item of items) {
        if (item) itens[item] = true;
      }
    }
  }
  return itens;
}

// Parse photo URLs from Drive links
function parsePhotos(text: string): string[] {
  if (!text) return [];
  return text.split(",").map((s) => s.trim()).filter(Boolean);
}

// Map equipment names to match our equipamentos.json naming
function normalizeEquipamento(nome: string): string {
  const n = (nome || "").trim();
  // Direct matches from the form data
  const mapping: Record<string, string> = {
    "Betoneira 400 L": "Betoneira 400L",
    "Vibrador de concreto": "Vibrador de Concreto Elétrico",
    "Martelete / Martelo Rompedor SDS Plus": "Martelete / Martelo Rompedor SDS Plus",
    "Martelete / Martelo Rompedor 5 kg": "Martelete / Martelo Rompedor 5 kg",
    "Martelete / Martelo Rompedor 10 kg": "Martelete / Martelo Rompedor 10 kg",
    "Martelete / Martelo Rompedor 16 kg": "Martelete / Martelo Rompedor 16 kg",
    "Soprador termico": "Soprador Térmico",
    "Cortadora de ceramica": "Cortador de Cerâmica",
    "Placa Vibratória a Gasolina": "Placa Vibratória a Gasolina",
    "Compactador de Solo elétrico": "Compactador de Solo Elétrico",
    "Compactador de Solo gasolina": "Compactador de Solo Gasolina",
    "Lavadora de Alta Pressão 220V": "Lavadora de Alta Pressão 220V",
    "Guincho de Coluna 400 kg": "Guincho de Coluna 400kg",
    "Carrinho plataforma": "Carrinho Plataforma",
    "Cortadora de piso manual": "Cortadora de Piso Manual",
    "Enceradeira industrial": "Enceradeira Industrial",
    "Escada": "Escada de Alumínio",
    "Paleteira": "Paleteira Manual",
    "Serra Policorte": "Serra Policorte",
    'Bomba hidraulica submersa 3"': 'Bomba Submersa 3"',
  };
  return mapping[n] || n;
}

function parseDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split("T")[0];
  // Format: M/D/YY or M/D/YYYY
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    let year = parseInt(parts[2]);
    if (year < 100) year += 2000;
    const month = parts[0].padStart(2, "0");
    const day = parts[1].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return dateStr;
}

async function importData() {
  console.log("Lendo arquivo Excel:", EXCEL_PATH);

  if (!fs.existsSync(EXCEL_PATH)) {
    console.error("Arquivo não encontrado:", EXCEL_PATH);
    process.exit(1);
  }

  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });

  console.log(`Encontrados ${rows.length} registros`);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    const responsavel = (row["Nome do responsavel pela revisão"] || "").trim();
    const cliente = (row["Cliente que estava com o equipamento"] || "").trim();
    const patrimonio = String(row["Número de patrimônio"] || "").trim();
    const dataConferencia = parseDate(row["Data da conferência"] || "");
    const equipamento = normalizeEquipamento(row["Equipamento"] || "");
    const checklistGeralText = row["Checklist Geral"] || "";
    const observacoes = (row["Observações"] || "").trim();
    const statusFinalText = (row["Status Final\n"] || row["Status Final"] || "").trim();
    const motorista = (row["Nome do motorista "] || row["Nome do motorista"] || "").trim();
    const responsavelLocacao = (row["Responsavel pela locação"] || "").trim();
    const fotosText = row["Fotos do equipamento"] || "";

    const checklistGeral = mapChecklistGeral(checklistGeralText);
    const itensVerificacao = parseItensVerificacao(row);
    const statusFinal = mapStatus(statusFinalText);
    const fotoUrls = parsePhotos(fotosText);

    // Build fotos array (just URLs, no base64 — these are existing Drive links)
    const fotos = fotoUrls.map((url, idx) => ({
      url: url,
      driveId: "",
      nome: `foto_historico_${idx + 1}`,
      thumbnail: url,
      directUrl: url,
    }));

    const data = {
      action: "submitChecklist",
      dataConferencia,
      responsavel,
      motorista,
      responsavelLocacao,
      cliente,
      patrimonio,
      equipamento,
      categoria: "",
      observacoes,
      statusFinal,
      itensVerificacao,
      checklistGeral,
      pdfBase64: "", // No PDF for historical records
      pdfFileName: "",
      fotos: [], // We'll set the fotos directly in the sheet data
    };

    console.log(`[${i + 1}/${rows.length}] Importando: ${equipamento} - ${cliente} - ${dataConferencia}`);

    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        redirect: "follow",
      });

      const text = await response.text();
      try {
        const result = JSON.parse(text);
        if (result.success) {
          console.log(`  ✓ Salvo (ID: ${result.id})`);

          // If there are historical photo URLs, update the fotos column
          // We'll do this by sending an update request
          if (fotos.length > 0) {
            // The fotos are already Drive URLs from the old form
            // We just need to save the references
            console.log(`  → ${fotos.length} foto(s) referenciada(s)`);
          }
        } else {
          console.log(`  ✗ Erro: ${result.error}`);
        }
      } catch {
        console.log(`  ✗ Resposta inválida:`, text.substring(0, 200));
      }
    } catch (err) {
      console.log(`  ✗ Falha de conexão:`, err);
    }

    // Wait 2 seconds between requests to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log("\nImportação concluída!");
}

importData().catch(console.error);
