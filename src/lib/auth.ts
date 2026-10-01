import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

if (JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters long");
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

export type AuthPayload = {
  userId: string;
  organizationId: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
};

export async function createToken(
  payload: AuthPayload
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifyToken(
  token: string
): Promise<AuthPayload> {
  const { payload } = await jwtVerify(
    token,
    secretKey
  );

  const validRoles = [
    "ADMIN",
    "MANAGER",
    "EMPLOYEE",
  ] as const;

  if (
    typeof payload.userId !== "string" ||
    typeof payload.organizationId !== "string" ||
    typeof payload.role !== "string" ||
    !validRoles.includes(
      payload.role as (typeof validRoles)[number]
    )
  ) {
    throw new Error("Invalid token claims");
  }

  return {
    userId: payload.userId,
    organizationId: payload.organizationId,
    role: payload.role as AuthPayload["role"],
  };
}