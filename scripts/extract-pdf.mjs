#!/usr/bin/env node
// Standalone PDF text extractor using pdfjs-dist with improved module resolution
// Reads PDF data from stdin; optional --password=<pwd> argument

import { argv, exit, stderr, stdin, stdout } from "node:process";

function parseArgs() {
  const args = {};
  for (const a of argv.slice(2)) {
    const [k, v] = a.split("=");
    if (k.startsWith("--")) args[k.slice(2)] = v ?? true;
  }
  return args;
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of stdin) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function extract(buffer, password) {
  try {
    // Try multiple import paths for better compatibility across environments
    let pdfjsLib;
    try {
      // Primary: legacy ESM build
      pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    } catch (err) {
      try {
        // Fallback: main ESM build
        pdfjsLib = await import("pdfjs-dist/build/pdf.mjs");
      } catch (err2) {
        // Last resort: direct import
        pdfjsLib = await import("pdfjs-dist");
      }
    }

    // Configure document loading with better error handling
    const docConfig = {
      data: new Uint8Array(buffer),
      password: password,
      // Disable features that might cause issues in serverless
      useWorkerFetch: false,
      disableAutoFetch: true,
      disableStream: true,
    };

    const task = pdfjsLib.getDocument(docConfig);
    const pdf = await task.promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const line = content.items
        .map((it) =>
          it && typeof it === "object" && "str" in it ? it.str : ""
        )
        .filter(Boolean)
        .join(" ");
      text += line + "\n";
    }
    return text;
  } catch (error) {
    // Better error classification
    const errorMsg = error?.message || String(error);
    if (
      errorMsg.includes("password") ||
      errorMsg.includes("encrypted") ||
      errorMsg.includes("PasswordException") ||
      errorMsg.includes("InvalidPassword")
    ) {
      throw new Error(
        "PDF is password protected or incorrect password provided"
      );
    }
    throw error;
  }
}

(async () => {
  try {
    const args = parseArgs();
    const buffer = await readStdin();
    const text = await extract(buffer, args.password);
    stdout.write(JSON.stringify({ success: true, text }));
    exit(0);
  } catch (err) {
    stderr.write(String(err && err.stack ? err.stack : err));
    stdout.write(
      JSON.stringify({ success: false, error: String(err?.message || err) })
    );
    exit(1);
  }
})();
