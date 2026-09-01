"use client";

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string[] | undefined>;
  constructor(message: string, status: number, fieldErrors?: Record<string, string[] | undefined>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function parseResponse(res: Response) {
  const contentType = res.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json") ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message = body?.error ?? `Request failed (${res.status}).`;
    throw new ApiError(message, res.status, body?.fieldErrors);
  }
  return body;
}

export async function apiGet<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  return parseResponse(res) as Promise<T>;
}

export async function apiSend<T = unknown>(
  url: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  data?: unknown
): Promise<T> {
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: data !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });
  return parseResponse(res) as Promise<T>;
}

export async function apiUpload<T = unknown>(url: string, formData: FormData): Promise<T> {
  const res = await fetch(url, { method: "POST", credentials: "include", body: formData });
  return parseResponse(res) as Promise<T>;
}
