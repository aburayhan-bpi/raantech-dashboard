// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function decodeJWT<T = Record<string, any>>(token: string): T | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");

    const decoded = decodeURIComponent(
      atob(payload)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    );

    return JSON.parse(decoded);
  } catch {
    return null;
  }
}
