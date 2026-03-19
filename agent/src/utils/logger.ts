export type LogLevel = "info" | "warn" | "error";

function formatMeta(meta?: Record<string, unknown>) {
  if (!meta || Object.keys(meta).length === 0) return "";
  try {
    return " " + JSON.stringify(meta);
  } catch {
    return "";
  }
}

export function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const prefix = level === "info" ? "[INFO]" : level === "warn" ? "[WARN]" : "[ERROR]";
  // eslint-disable-next-line no-console
  console.log(`${prefix} ${message}${formatMeta(meta)}`);
}

export const logger = {
  info: (m: string, meta?: Record<string, unknown>) => log("info", m, meta),
  warn: (m: string, meta?: Record<string, unknown>) => log("warn", m, meta),
  error: (m: string, meta?: Record<string, unknown>) => log("error", m, meta),
};

