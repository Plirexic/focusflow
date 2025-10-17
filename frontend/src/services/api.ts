const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;

function isAbsoluteUrl(path: string): boolean {
  return /^https?:\/\//i.test(path);
}

async function parseSafe(res: Response): Promise<Json | null> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = isAbsoluteUrl(path) ? path : `${API_BASE_URL}${path}`;

  const headers = new Headers(options.headers || {});
  // Set JSON header automatically when sending a body unless explicitly provided
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {
    credentials: 'include',
    ...options,
    headers,
  });

  const body = await parseSafe(res);

  if (!res.ok) {
    const message = (typeof body === 'object' && body !== null && 'error' in (body as any))
      ? String((body as any).error)
      : (typeof body === 'object' && body !== null && 'message' in (body as any))
        ? String((body as any).message)
        : typeof body === 'string'
          ? body
          : res.statusText || `HTTP ${res.status}`;
    throw new Error(message);
  }

  // If no body or non-JSON text, return null/undefined cast as needed
  return body as T;
}

export { API_BASE_URL };

