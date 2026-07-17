import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.JWT_SECRET || "default_rahafa_secret_key_12345";
const key = new TextEncoder().encode(secretKey);

export function normalizeWhatsappNumber(input: string): string {
  // Jika input mengandung huruf (misal: "admin"), biarkan saja
  if (/[a-zA-Z]/.test(input)) {
    return input.toLowerCase().trim();
  }

  // Remove all non-digit characters
  let normalized = input.replace(/\D/g, "");

  // If it starts with 0, replace 0 with 62
  if (normalized.startsWith("0")) {
    normalized = "62" + normalized.slice(1);
  }
  
  return normalized;
}

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1 day from now")
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function createSession(userId: string, role: string) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
  const session = await encrypt({ userId, role, expires });

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.set("session", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function verifySession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) return null;

  const payload = await decrypt(session);
  
  if (!payload?.userId) {
    return null;
  }

  return { isAuth: true, userId: payload.userId, role: payload.role };
}
