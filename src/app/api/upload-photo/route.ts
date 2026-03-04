import { NextRequest, NextResponse } from "next/server";
import { uploadPhotoToDrive } from "@/lib/google-drive";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.checklistId || !data.base64) {
      return NextResponse.json(
        { error: "checklistId e base64 são obrigatórios" },
        { status: 400 }
      );
    }

    const result = await uploadPhotoToDrive(
      data.checklistId,
      data.base64,
      data.fileName || `foto_${Date.now()}.jpg`
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao fazer upload da foto:", error);
    return NextResponse.json(
      { error: "Erro ao fazer upload" },
      { status: 500 }
    );
  }
}
