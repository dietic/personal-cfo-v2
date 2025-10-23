type Level = "info" | "warn" | "error";

function write(level: Level, message: string, meta?: Record<string, unknown>) {
  // In browser, keep silent to avoid noisy consoles
  if (typeof window !== "undefined") return;

  const entry = {
    level,
    message,
    ...meta,
    ts: new Date().toISOString(),
  };

  const line = JSON.stringify(entry);
  if (level === "error") {
    // eslint-disable-next-line no-console
    console.error(line);
  } else if (level === "warn") {
    // eslint-disable-next-line no-console
    console.warn(line);
  } else {
    // eslint-disable-next-line no-console
    console.log(line);
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) =>
    write("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) =>
    write("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) =>
    write("error", message, meta),
};
