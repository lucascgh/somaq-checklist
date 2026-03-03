import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const appPassword = process.env.APP_PASSWORD || "somaq2024";

  if (password === appPassword) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
}
