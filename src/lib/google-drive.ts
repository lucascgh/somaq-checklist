// Google Drive integration via Google Apps Script
// The Apps Script runs under the corporate Google account
// and uses Google Sheets as database + Drive as file storage

const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || "";

// ---- SUBMIT CHECKLIST (metadata + PDF) ----

export async function submitChecklistToDrive(data: {
  dataConferencia: string;
  responsavel: string;
  motorista?: string;
  responsavelLocacao?: string;
  cliente: string;
  patrimonio: string;
  equipamento: string;
  categoria?: string;
  observacoes?: string;
  statusFinal: string;
  itensVerificacao: Record<string, boolean>;
  checklistGeral: Record<string, boolean>;
  pdfBase64?: string;
  pdfFileName?: string;
  fotos?: { base64: string }[];
}): Promise<{
  success: boolean;
  id?: string;
  pdfUrl?: string;
  pdfDriveId?: string;
  fotos?: Array<{ url: string; driveId: string; nome: string; thumbnail: string }>;
  error?: string;
}> {
  if (!APPS_SCRIPT_URL) {
    console.log("Google Apps Script URL not configured");
    return { success: false, error: "Apps Script not configured" };
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "submitChecklist",
        ...data,
      }),
      redirect: "follow",
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Drive submit failed:", error);
    return { success: false, error: String(error) };
  }
}

// ---- UPLOAD INDIVIDUAL PHOTO ----

export async function uploadPhotoToDrive(
  checklistId: string,
  base64: string,
  fileName: string
): Promise<{
  success: boolean;
  foto?: { url: string; driveId: string; nome: string; thumbnail: string };
  error?: string;
}> {
  if (!APPS_SCRIPT_URL) {
    return { success: false, error: "Apps Script not configured" };
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "uploadPhoto",
        checklistId,
        base64,
        fileName,
      }),
      redirect: "follow",
    });

    return await response.json();
  } catch (error) {
    console.error("Photo upload failed:", error);
    return { success: false, error: String(error) };
  }
}

// ---- GET CHECKLISTS ----

export async function getChecklistsFromDrive(params: Record<string, string>): Promise<{
  data: unknown[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
} | null> {
  if (!APPS_SCRIPT_URL) return null;

  try {
    const searchParams = new URLSearchParams(params);
    searchParams.set("action", "getChecklists");

    const response = await fetch(`${APPS_SCRIPT_URL}?${searchParams}`, {
      method: "GET",
      redirect: "follow",
    });

    return await response.json();
  } catch (error) {
    console.error("Failed to get checklists from Drive:", error);
    return null;
  }
}

// ---- GET DASHBOARD ----

export async function getDashboardFromDrive(): Promise<unknown | null> {
  if (!APPS_SCRIPT_URL) return null;

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?action=getDashboard`, {
      method: "GET",
      redirect: "follow",
    });

    return await response.json();
  } catch (error) {
    console.error("Failed to get dashboard from Drive:", error);
    return null;
  }
}

export function isAppsScriptConfigured(): boolean {
  return !!APPS_SCRIPT_URL;
}
