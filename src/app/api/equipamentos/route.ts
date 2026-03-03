import { NextResponse } from "next/server";
import equipamentosData from "@/config/equipamentos.json";

export async function GET() {
  return NextResponse.json(equipamentosData);
}
