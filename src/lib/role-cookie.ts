export const ROLE_COOKIE_NAME = "preselectedRole";
export const ALLOWED_ROLES = [
  "consultant",
  "vendor",
  "client",
  "admin",
] as const;

const encoder = new TextEncoder();

function getSecret() {
  const secret = process.env.ROLE_COOKIE_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV !== "production") {
    return "dev-role-cookie-secret";
  }

  throw new Error("ROLE_COOKIE_SECRET is required in production");
}

function toBase64Url(bytes: ArrayBuffer) {
  const buffer = new Uint8Array(bytes);
  let binary = "";
  for (const byte of buffer) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function getKey() {
  const secret = getSecret();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signRoleValue(role: string) {
  const key = await getKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(role));
  return `${role}.${toBase64Url(signature)}`;
}

export async function verifyRoleValue(value: string | undefined | null) {
  if (!value) return null;

  const parts = value.split(".");
  if (parts.length !== 2) return null;

  const [role, signature] = parts;
  if (!ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number]))
    return null;

  try {
    const key = await getKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(signature),
      encoder.encode(role),
    );

    return valid ? role : null;
  } catch {
    return null;
  }
}

export function buildRoleCookie(signedValue: string | null) {
  const base = `${ROLE_COOKIE_NAME}=`;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  if (!signedValue) {
    return `${base}; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`;
  }

  return `${base}${signedValue}; Path=/; Max-Age=${60 * 60}; HttpOnly; SameSite=Lax${secure}`;
}
