import * as pdfjsLib from "pdfjs-dist";

// Set worker source for pdfjs reliably in browser environment
if (typeof window !== "undefined") {
  try {
    const version = (pdfjsLib as any).version || "4.10.38";
    // Reliable cdnjs / unpkg fallback for pdf.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
  } catch (err) {
    console.warn("PDF.js worker initialization notice:", err);
  }
}

/**
 * Extracts plain text from a PDF file locally in the browser memory using PDF.js.
 * Strictly local, no server upload, zero telemetry.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
  });

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const fullTextLines: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();

    let lastY: number | null = null;
    let lineStr = "";

    for (const item of textContent.items) {
      if ("str" in item) {
        const textItem = item as { str: string; transform: number[] };
        const currentY = textItem.transform ? textItem.transform[5] : null;
        if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 5) {
          if (lineStr.trim()) {
            fullTextLines.push(lineStr.trim());
          }
          lineStr = textItem.str;
        } else {
          lineStr += (lineStr ? " " : "") + textItem.str;
        }
        lastY = currentY;
      }
    }
    if (lineStr.trim()) {
      fullTextLines.push(lineStr.trim());
    }
  }

  return fullTextLines.join("\n");
}

/**
 * Renders the first page of a PDF file to a base64 image data URL (thumbnail).
 */
export async function renderPdfFirstPageThumbnail(file: File): Promise<string | null> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });
    const pdfDoc = await loadingTask.promise;
    if (pdfDoc.numPages === 0) return null;

    const page = await pdfDoc.getPage(1);
    const viewport = page.getViewport({ scale: 1.0 });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return null;

    // Scale to a neat thumbnail width (approx 600px max)
    const scale = Math.min(1.5, 600 / viewport.width);
    const scaledViewport = page.getViewport({ scale });

    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    await (page.render as any)({
      canvasContext: context,
      viewport: scaledViewport,
      canvas: canvas,
    }).promise;

    return canvas.toDataURL("image/jpeg", 0.85);
  } catch (err) {
    console.warn("Could not generate PDF thumbnail:", err);
    return null;
  }
}
