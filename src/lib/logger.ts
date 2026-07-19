type LogLevel = "debug" | "info" | "warn" | "error";

const isProduction = process.env.NODE_ENV === "production";
const REDACTED = "[REDACTED]";
const SENSITIVE_KEY_PATTERN = /password|confirmPassword|otp|token|secret|key/i;

function redactValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        SENSITIVE_KEY_PATTERN.test(key) ? REDACTED : redactValue(item),
      ]),
    );
  }

  return value;
}

function log(level: LogLevel, message: string, data?: unknown) {
  if (isProduction) return;

  const prefix = `[${level.toUpperCase()}] ${message}`;
  if (typeof data === "undefined") {
    console[level](prefix);
    return;
  }

  console[level](prefix, redactValue(data));
}

export const logger = {
  debug: (message: string, data?: unknown) => log("debug", message, data),
  info: (message: string, data?: unknown) => log("info", message, data),
  warn: (message: string, data?: unknown) => log("warn", message, data),
  error: (message: string, data?: unknown) => log("error", message, data),
};
