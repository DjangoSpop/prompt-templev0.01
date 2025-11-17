/**
 * HTTP API Client
 * Single source of truth for API calls with automatic auth headers
 */

import { z } from "zod";
import { ErrorResponse } from "@/schemas/common";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Get authentication headers from localStorage/sessionStorage
 */
export function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};

  const token =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");

  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Custom API error class
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
    public code?: string
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

/**
 * Generic API call with Zod validation
 */
export async function api<T>(
  path: string,
  schema: z.ZodType<T>,
  init: RequestInit = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(init.headers || {}),
    },
    cache: init.cache ?? "no-store",
  });

  if (!res.ok) {
    let detail = "Request failed";
    let code: string | undefined;

    try {
      const errorData = await res.json();
      const parsed = ErrorResponse.safeParse(errorData);
      if (parsed.success) {
        detail = parsed.data.detail || parsed.data.error || parsed.data.message || detail;
        code = parsed.data.code;
      } else {
        detail = errorData.detail || errorData.message || errorData.error || detail;
      }
    } catch {
      detail = await res.text().catch(() => res.statusText);
    }

    throw new ApiError(res.status, detail, code);
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return {} as T;
  }

  const data = await res.json();

  // Validate with Zod schema
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("API response validation error:", error.errors);
      console.error("Received data:", data);
      throw new ApiError(
        500,
        "Invalid response format from server",
        "VALIDATION_ERROR"
      );
    }
    throw error;
  }
}

/**
 * Shorthand for GET requests
 */
export async function apiGet<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit
): Promise<T> {
  return api(path, schema, { ...init, method: "GET" });
}

/**
 * Shorthand for POST requests
 */
export async function apiPost<T>(
  path: string,
  schema: z.ZodType<T>,
  body?: any,
  init?: RequestInit
): Promise<T> {
  return api(path, schema, {
    ...init,
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Shorthand for PATCH requests
 */
export async function apiPatch<T>(
  path: string,
  schema: z.ZodType<T>,
  body?: any,
  init?: RequestInit
): Promise<T> {
  return api(path, schema, {
    ...init,
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Shorthand for DELETE requests
 */
export async function apiDelete<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit
): Promise<T> {
  return api(path, schema, { ...init, method: "DELETE" });
}

/**
 * Build query string from params object
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  const str = searchParams.toString();
  return str ? `?${str}` : "";
}
