// Ensure pdfjsLib is loaded from CDN, access it via window
declare const pdfjsLib: any;

export const extractTextFromPdf = async (file: File): Promise<string> => {
  if (typeof pdfjsLib === 'undefined' || !pdfjsLib.getDocument) {
    console.error("pdf.js library (pdfjsLib) is not loaded correctly. Ensure it's included via CDN.");
    throw new Error("PDF processing library not available. Please try refreshing the page.");
  }

  const arrayBuffer = await file.arrayBuffer();
  
  // pdfjsLib.GlobalWorkerOptions.workerSrc should be set in index.html
  // If not, it might try to load from a relative path and fail.
  // It's good practice to ensure it's set before calling getDocument.
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
     console.warn("pdfjsLib.GlobalWorkerOptions.workerSrc is not set. PDF.js might not work correctly. This should be set in index.html.");
     // Attempt to set a fallback if not already set, though ideally it's done once at init.
     // This fallback is more of a safety net and might not always be the best place.
     pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    fullText += pageText + "\n"; // Add newline between pages
  }

  return fullText.trim();
};
