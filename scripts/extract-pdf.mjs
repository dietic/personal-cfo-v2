#!/usr/bin/env node
// Standalone PDF text extractor using pdfjs-dist with worker disabled
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
  // Use legacy ESM build; Node can import this directly in .mjs
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  // Disable worker entirely to avoid worker module resolution
  const task = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    password,
    disableWorker: true,
  });
  const pdf = await task.promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      .map((it) => (it && typeof it === "object" && "str" in it ? it.str : ""))
      .filter(Boolean)
      .join(" ");
    text += line + "\n";
  }
  return text;
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
