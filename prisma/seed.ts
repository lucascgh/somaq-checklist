import { PrismaClient } from "@prisma/client";
import seedData from "../src/config/seed-data.json";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  for (const record of seedData) {
    const checklist = await prisma.checklist.create({
      data: {
        dataConferencia: new Date(record.dataConferencia),
        responsavel: record.responsavel,
        motorista: record.motorista || null,
        responsavelLocacao: null,
        cliente: record.cliente,
        patrimonio: record.patrimonio,
        equipamento: record.equipamento,
        categoria: record.categoria,
        observacoes: record.observacoes || null,
        statusFinal: record.statusFinal,
        itensVerificacao: {
          create: Object.entries(record.itens).map(([nome, conforme]) => ({
            nome,
            conforme: conforme as boolean,
          })),
        },
        checklistGeral: {
          create: {
            equipamentoLimpo: true,
            semQuebras: record.statusFinal !== "manutencao_critica" && record.statusFinal !== "avaria_cobranca",
            semPecasFaltantes: record.statusFinal !== "avaria_cobranca",
            funcionandoCorretamente: record.statusFinal === "liberado" || record.statusFinal === "manutencao_simples",
            semSinaisMauUso: record.statusFinal !== "avaria_cobranca",
          },
        },
      },
    });

    console.log(`  Created: ${checklist.equipamento} - ${checklist.cliente}`);
  }

  console.log(`\nSeeded ${seedData.length} checklists successfully!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
