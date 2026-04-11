import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import {
  authenticateCustomerAccount,
  getCustomerAccountSummaryByEmail,
  type CustomerAccountSummary,
} from "@/lib/customer-accounts";
import { hasMongoConfig } from "@/lib/integrations";
import { getVendorBySlug, vendors, type Vendor } from "@/lib/marketplace";

export type AuthRole = "admin" | "vendor" | "customer";

type StaffAuthUserConfig = {
  email: string;
  password: string;
  role: AuthRole;
  name: string;
  vendorSlug?: string;
};

type StoredAuthSession = {
  email: string;
  role: AuthRole;
  name: string;
  vendorSlug?: string;
  expiresAt: number;
};

export type AuthSession = {
  email: string;
  role: AuthRole;
  name: string;
  vendorSlug?: string;
  dashboardPath: string;
};

export type AuthSetupState = {
  ready: boolean;
  hasRuntimeSecret: boolean;
  staffAccountsConfigured: boolean;
  customerAccountsEnabled: boolean;
};

const AUTH_COOKIE_NAME = "supertech_session";
const AUTH_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const DEV_FALLBACK_STAFF_USERS: StaffAuthUserConfig[] = [
  {
    email: "admin@supertech.local",
    password: "Admin123!",
    role: "admin",
    name: "SuperTech Admin",
  },
  {
    email: "aurora@supertech.local",
    password: "Vendor123!",
    role: "vendor",
    name: "Aurora Labs",
    vendorSlug: "aurora-labs",
  },
];

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getDefaultDashboardPath(role: AuthRole) {
  switch (role) {
    case "admin":
      return "/dashboard/admin";
    case "vendor":
      return "/dashboard/vendor";
    case "customer":
      return "/account";
    default:
      return "/";
  }
}

function isAuthRole(value: unknown): value is AuthRole {
  return value === "admin" || value === "vendor" || value === "customer";
}

function sanitizeStaffUserConfig(value: unknown): StaffAuthUserConfig | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const email = typeof candidate.email === "string" ? normalizeEmail(candidate.email) : "";
  const password = typeof candidate.password === "string" ? candidate.password.trim() : "";
  const role = candidate.role;
  const name = typeof candidate.name === "string" ? candidate.name.trim() : "";
  const vendorSlug =
    typeof candidate.vendorSlug === "string" ? candidate.vendorSlug.trim() : undefined;

  if (!email || !password || !name || !isAuthRole(role)) {
    return null;
  }

  if (role === "vendor") {
    if (!vendorSlug || !getVendorBySlug(vendorSlug)) {
      return null;
    }
  }

  return {
    email,
    password,
    role,
    name,
    vendorSlug: role === "vendor" ? vendorSlug : undefined,
  };
}

function getRuntimeSecret() {
  if (process.env.AUTH_SECRET) {
    return process.env.AUTH_SECRET;
  }

  if (process.env.NODE_ENV !== "production") {
    return "supertech-local-auth-secret";
  }

  return "";
}

function getConfiguredStaffUsers() {
  const raw = process.env.AUTH_DEMO_USERS_JSON;

  if (!raw) {
    return [] as StaffAuthUserConfig[];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [] as StaffAuthUserConfig[];
    }

    return parsed
      .map((entry) => sanitizeStaffUserConfig(entry))
      .filter((entry): entry is StaffAuthUserConfig => entry !== null);
  } catch {
    return [] as StaffAuthUserConfig[];
  }
}

function getAvailableStaffUsers() {
  const configuredUsers = getConfiguredStaffUsers();

  if (configuredUsers.length > 0) {
    return configuredUsers;
  }

  if (process.env.NODE_ENV !== "production") {
    return DEV_FALLBACK_STAFF_USERS;
  }

  return [] as StaffAuthUserConfig[];
}

function signPayload(encodedPayload: string) {
  return crypto
    .createHmac("sha256", getRuntimeSecret())
    .update(encodedPayload)
    .digest("base64url");
}

function buildCookieValue(session: AuthSession) {
  const payload: StoredAuthSession = {
    email: session.email,
    role: session.role,
    name: session.name,
    vendorSlug: session.vendorSlug,
    expiresAt: Math.floor(Date.now() / 1000) + AUTH_SESSION_TTL_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function toAuthSession(
  session: StoredAuthSession | StaffAuthUserConfig | CustomerAccountSummary,
): AuthSession {
  return {
    email: normalizeEmail(session.email),
    role: session.role,
    name: session.name.trim(),
    vendorSlug: session.role === "vendor" ? session.vendorSlug : undefined,
    dashboardPath: getDefaultDashboardPath(session.role),
  };
}

function parseCookieHeader(cookieHeader: string | null, name: string) {
  if (!cookieHeader) {
    return null;
  }

  const entries = cookieHeader.split(";").map((entry) => entry.trim());

  for (const entry of entries) {
    const separatorIndex = entry.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = entry.slice(0, separatorIndex).trim();

    if (key !== name) {
      continue;
    }

    return entry.slice(separatorIndex + 1).trim();
  }

  return null;
}

function parseStoredSession(value: string | null): StoredAuthSession | null {
  if (!value) {
    return null;
  }

  const secret = getRuntimeSecret();

  if (!secret) {
    return null;
  }

  const separatorIndex = value.lastIndexOf(".");

  if (separatorIndex === -1) {
    return null;
  }

  const encodedPayload = value.slice(0, separatorIndex);
  const signature = value.slice(separatorIndex + 1);
  const expectedSignature = signPayload(encodedPayload);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (provided.length !== expected.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(provided, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as StoredAuthSession;

    if (
      !payload ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.expiresAt !== "number" ||
      !isAuthRole(payload.role)
    ) {
      return null;
    }

    if (payload.expiresAt < Math.floor(Date.now() / 1000)) {
      return null;
    }

    if (payload.role === "vendor") {
      if (!payload.vendorSlug || !getVendorBySlug(payload.vendorSlug)) {
        return null;
      }
    }

    return {
      email: normalizeEmail(payload.email),
      role: payload.role,
      name: payload.name.trim(),
      vendorSlug: payload.role === "vendor" ? payload.vendorSlug : undefined,
      expiresAt: payload.expiresAt,
    };
  } catch {
    return null;
  }
}

function normalizeNextPath(nextPath: string | null | undefined, fallback: string) {
  if (!nextPath) {
    return fallback;
  }

  const trimmedNextPath = nextPath.trim();

  if (!trimmedNextPath.startsWith("/") || trimmedNextPath.startsWith("//")) {
    return fallback;
  }

  return trimmedNextPath;
}

export function getAuthSetupState(): AuthSetupState {
  const hasRuntimeSecret = Boolean(getRuntimeSecret());

  return {
    ready: hasRuntimeSecret,
    hasRuntimeSecret,
    staffAccountsConfigured: getAvailableStaffUsers().length > 0,
    customerAccountsEnabled: hasMongoConfig(),
  };
}

export function hasConfiguredAuthUsers() {
  return getAvailableStaffUsers().length > 0 || hasMongoConfig();
}

export function isReservedStaffEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);

  return getAvailableStaffUsers().some((user) => user.email === normalizedEmail);
}

export async function authenticateUser(input: { email: string; password: string }) {
  const runtimeSecret = getRuntimeSecret();

  if (!runtimeSecret) {
    throw new Error("AUTH_SECRET is missing. Add it before using login.");
  }

  const normalizedEmail = normalizeEmail(input.email);
  const password = input.password.trim();

  const customerAccount = await authenticateCustomerAccount({
    email: normalizedEmail,
    password,
  });

  if (customerAccount) {
    return toAuthSession(customerAccount);
  }

  const staffUser = getAvailableStaffUsers().find(
    (entry) => entry.email === normalizedEmail && entry.password === password,
  );

  return staffUser ? toAuthSession(staffUser) : null;
}

export function getPostSignInPath(session: AuthSession, nextPath?: string | null) {
  return normalizeNextPath(nextPath, session.dashboardPath);
}

export function getAccessibleVendors(session: AuthSession): Vendor[] {
  if (session.role === "admin") {
    return vendors;
  }

  if (session.role === "vendor" && session.vendorSlug) {
    const vendor = getVendorBySlug(session.vendorSlug);

    return vendor ? [vendor] : [];
  }

  return [];
}

export async function getAuthSession() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
  const storedSession = parseStoredSession(cookieValue);

  return storedSession ? toAuthSession(storedSession) : null;
}

export function getAuthSessionFromRequest(request: Request) {
  const cookieValue = parseCookieHeader(request.headers.get("cookie"), AUTH_COOKIE_NAME);
  const storedSession = parseStoredSession(cookieValue);

  return storedSession ? toAuthSession(storedSession) : null;
}

export function setAuthSessionCookie(response: NextResponse, session: AuthSession) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: buildCookieValue(session),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_SESSION_TTL_SECONDS,
  });
}

export function clearAuthSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getCurrentCustomerAccount(session: AuthSession) {
  if (session.role !== "customer") {
    return null;
  }

  return getCustomerAccountSummaryByEmail(session.email);
}

export async function requirePageSession({
  roles,
  nextPath,
}: {
  roles?: AuthRole[];
  nextPath: string;
}) {
  const session = await getAuthSession();

  if (!session) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  if (roles && !roles.includes(session.role)) {
    redirect("/forbidden");
  }

  return session;
}

export function authorizeRequest(request: Request, roles?: AuthRole[]) {
  const session = getAuthSessionFromRequest(request);

  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Please log in to continue." },
        { status: 401 },
      ),
    };
  }

  if (roles && !roles.includes(session.role)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "You do not have access to this action." },
        { status: 403 },
      ),
    };
  }

  return {
    ok: true as const,
    session,
  };
}
