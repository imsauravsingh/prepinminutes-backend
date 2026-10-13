/**
 * PrepInMinutes — Edge-Compatible PDF Text Extractor
 * 
 * Extracts plain text from PDF resumes inside Cloudflare Workers isolates (workerd)
 * without requiring browser DOM APIs (DOMMatrix, Canvas, ImageData) or native C++ addons.
 * 
 * Uses node:zlib (Cloudflare Workers nodejs_compat) for FlateDecode decompression.
 */

import zlib from "node:zlib";

/**
 * Decodes PDF string escapes: \n, \r, \t, \b, \f, \(, \), \\, and \ooo octal.
 */
function decodePdfString(raw: string): string {
  return raw.replace(/\\([0-7]{1,3}|[nrtbf()\\\/])/g, (_, match) => {
    switch (match) {
      case "n": return "\n";
      case "r": return "\r";
      case "t": return "\t";
      case "b": return "\b";
      case "f": return "\f";
      case "(": return "(";
      case ")": return ")";
      case "\\": return "\\";
      case "/": return "/";
      default:
        // Octal escape \ooo
        return String.fromCharCode(parseInt(match, 8));
    }
  });
}

/**
 * Decodes hexadecimal PDF strings <48656C6C6F>
 */
function decodeHexPdfString(hex: string): string {
  const cleanHex = hex.replace(/\s+/g, "");
  let str = "";
  for (let i = 0; i < cleanHex.length; i += 2) {
    const code = parseInt(cleanHex.slice(i, i + 2), 16);
    if (!isNaN(code)) {
      str += String.fromCharCode(code);
    }
  }
  return str;
}

/**
 * Extracts plain text operators from a decompressed PDF content stream:
 * Handles:
 *  - (Text) Tj
 *  - [(Text) -20 (More text)] TJ
 *  - ' and " operators
 *  - <Hex> Tj / TJ
 */
function extractTextFromContentStream(streamText: string): string {
  const textSegments: string[] = [];

  // Match TJ operator: [ (str) -12 (str) <hex> ... ] TJ
  const tjRegex = /\[((?:(?:\([^)]*?\)|<[^>]*?>|[-0-9.\s]+)\s*)+)\]\s*TJ/g;
  let match: RegExpExecArray | null;

  while ((match = tjRegex.exec(streamText)) !== null) {
    const arrayContent = match[1];
    const itemRegex = /\(([^)]*?)\)|<([0-9a-fA-F]+)>/g;
    let itemMatch: RegExpExecArray | null;
    let combined = "";

    while ((itemMatch = itemRegex.exec(arrayContent)) !== null) {
      if (itemMatch[1] !== undefined) {
        combined += decodePdfString(itemMatch[1]);
      } else if (itemMatch[2] !== undefined) {
        combined += decodeHexPdfString(itemMatch[2]);
      }
    }

    if (combined.trim()) {
      textSegments.push(combined);
    }
  }

  // Match Tj operator: (Text) Tj or <Hex> Tj
  const singleTjRegex = /(?:\(([^)]*?)\)|<([0-9a-fA-F]+)>)\s*Tj/g;
  while ((match = singleTjRegex.exec(streamText)) !== null) {
    if (match[1] !== undefined) {
      const decoded = decodePdfString(match[1]);
      if (decoded.trim()) textSegments.push(decoded);
    } else if (match[2] !== undefined) {
      const decoded = decodeHexPdfString(match[2]);
      if (decoded.trim()) textSegments.push(decoded);
    }
  }

  // Match ' and " operators (move to next line and show text)
  const lineTjRegex = /(?:\(([^)]*?)\)|<([0-9a-fA-F]+)>)\s*['"]/g;
  while ((match = lineTjRegex.exec(streamText)) !== null) {
    if (match[1] !== undefined) {
      const decoded = decodePdfString(match[1]);
      if (decoded.trim()) textSegments.push(decoded);
    }
  }

  return textSegments.join(" ");
}

/**
 * Extracts text from an arbitrary PDF buffer directly in the edge isolate.
 */
export async function extractTextFromPdf(pdfBuffer: Buffer | Uint8Array): Promise<string> {
  const buf = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
  const collectedText: string[] = [];

  // Search for stream ... endstream chunks
  const streamHeader = Buffer.from("stream");
  const endStreamHeader = Buffer.from("endstream");

  let pos = 0;
  while (pos < buf.length) {
    const streamStartIdx = buf.indexOf(streamHeader, pos);
    if (streamStartIdx === -1) break;

    // Scan backwards to find the dictionary preceding the stream
    const dictStartIdx = Math.max(0, streamStartIdx - 500);
    const dictText = buf.subarray(dictStartIdx, streamStartIdx).toString("latin1");
    const isFlate = /Filter\s*(?:\/\s*FlateDecode|\[\s*\/FlateDecode\s*\])/i.test(dictText);

    // Skip \r\n after "stream"
    let dataStart = streamStartIdx + 6;
    if (buf[dataStart] === 0x0d && buf[dataStart + 1] === 0x0a) {
      dataStart += 2;
    } else if (buf[dataStart] === 0x0a || buf[dataStart] === 0x0d) {
      dataStart += 1;
    }

    const endStreamIdx = buf.indexOf(endStreamHeader, dataStart);
    if (endStreamIdx === -1) {
      pos = dataStart;
      continue;
    }

    // Trim trailing newline before "endstream"
    let dataEnd = endStreamIdx;
    if (buf[dataEnd - 1] === 0x0a) dataEnd--;
    if (buf[dataEnd - 1] === 0x0d) dataEnd--;

    const streamSlice = buf.subarray(dataStart, dataEnd);

    if (isFlate) {
      try {
        const decompressed = zlib.inflateSync(streamSlice);
        const textContent = decompressed.toString("latin1");
        const extracted = extractTextFromContentStream(textContent);
        if (extracted.trim()) {
          collectedText.push(extracted);
        }
      } catch {
        // Not a standard zlib stream or raw font stream; fallback to raw extraction
      }
    } else {
      // Uncompressed stream
      const textContent = streamSlice.toString("latin1");
      const extracted = extractTextFromContentStream(textContent);
      if (extracted.trim()) {
        collectedText.push(extracted);
      }
    }

    pos = endStreamIdx + 9;
  }

  // Fallback: If stream parsing extracted nothing, perform raw ASCII / UTF-8 string sweep
  if (collectedText.length === 0) {
    const rawPdf = buf.toString("latin1");
    const rawExtracted = extractTextFromContentStream(rawPdf);
    if (rawExtracted.trim()) {
      collectedText.push(rawExtracted);
    }
  }

  return collectedText
    .join(" ")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

