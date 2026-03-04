import { NextRequest, NextResponse } from "next/server";
import { getChecklistsFromDrive, isAppsScriptConfigured } from "@/lib/google-drive";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Try Google Drive (Apps Script) first
  if (isAppsScriptConfigured()) {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const result = await getChecklistsFromDrive(params);
    if (result) {
      return NextResponse.json(result);
    }
  }

  // Fallback to local Prisma DB
  const { prisma } = await import("@/lib/database");

  const search = searchParams.get("search") || "";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const equipment = searchParams.get("equipment");
  const client = searchParams.get("client");
  const status = searchParams.get("status");
  const patrimony = searchParams.get("patrimony");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const sortBy = searchParams.get("sortBy") || "dataConferencia";
  const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { equipamento: { contains: search } },
      { cliente: { contains: search } },
      { patrimonio: { contains: search } },
      { motorista: { contains: search } },
      { observacoes: { contains: search } },
    ];
  }

  if (startDate || endDate) {
    where.dataConferencia = {};
    if (startDate) (where.dataConferencia as Record<string, unknown>).gte = new Date(startDate);
    if (endDate) (where.dataConferencia as Record<string, unknown>).lte = new Date(endDate);
  }

  if (equipment) where.equipamento = { contains: equipment };
  if (client) where.cliente = { contains: client };
  if (status) where.statusFinal = status;
  if (patrimony) where.patrimonio = { contains: patrimony };

  const [total, checklists] = await Promise.all([
    prisma.checklist.count({ where }),
    prisma.checklist.findMany({
      where,
      include: {
        itensVerificacao: true,
        checklistGeral: true,
        fotos: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    data: checklists,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
