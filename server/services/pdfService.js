const pdfParse = require("pdf-parse");

// Extracts raw text from a PDF buffer. Throws a clear error for scanned/image-only PDFs.
const extractTextFromPdf = async (buffer) => {
  const data = await pdfParse(buffer);
  const text = (data.text || "").trim();

  if (text.length < 50) {
    throw new Error(
      "Could not extract readable text from this PDF. It may be a scanned image without a text layer."
    );
  }

  return text;
};

module.exports = { extractTextFromPdf };
