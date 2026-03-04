// Google Drive integration via Google Apps Script
// This approach works without Service Account keys
// The Apps Script runs under the corporate Google account

const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || "";

export async function uploadPDFToDrive(
  pdfBase64: string,
  fileName: string
): Promise<{ fileId: string; fileUrl: string } | null> {
  if (!APPS_SCRIPT_URL) {
    console.log("Google Apps Script URL not configured, skipping Drive upload");
    return null;
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "uploadPDF",
        fileName,
        data: pdfBase64,
      }),
    });

    const result = await response.json();
    if (result.success) {
      return { fileId: result.fileId, fileUrl: result.fileUrl };
    }
    console.error("Drive upload error:", result.error);
    return null;
  } catch (error) {
    console.error("Drive upload failed:", error);
    return null;
  }
}

export async function uploadPhotoToDrive(
  photoBase64: string,
  fileName: string
): Promise<{ fileId: string; fileUrl: string } | null> {
  if (!APPS_SCRIPT_URL) {
    console.log("Google Apps Script URL not configured, skipping photo upload");
    return null;
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "uploadPhoto",
        fileName,
        data: photoBase64,
      }),
    });

    const result = await response.json();
    if (result.success) {
      return { fileId: result.fileId, fileUrl: result.fileUrl };
    }
    console.error("Photo upload error:", result.error);
    return null;
  } catch (error) {
    console.error("Photo upload failed:", error);
    return null;
  }
}
