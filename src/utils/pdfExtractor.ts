import * as pdfjsLib from "pdfjs-dist";

// Set worker source for pdfjs in Vite environment
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url
  ).toString();
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
        // Wenn sich die vertikale Position (Y) signifikant ändert, neue Zeile anfangen
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
