// Must be VITE_API_URL - Vite only exposes VITE_-prefixed variables, so the
// older NEXT_PUBLIC_API_URL from the Next.js days is ignored. Baked in at
// build time, so changing it on the host requires a redeploy.
// The trailing slash is stripped so `${API_BASE_URL}/api/...` can't produce a
// double slash, which some hosts 404 on.
const API_BASE_URL = ((import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:5000').replace(
  /\/+$/,
  ''
);

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  body?: unknown;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    credentials: 'include',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message = (data && (data.message as string)) || `Request failed (${res.status})`;
    throw new ApiError(res.status, message);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

/** For multipart/form-data requests (admin product image upload) — bypasses the JSON body handling above. */
export async function apiUpload<T>(path: string, method: 'POST' | 'PATCH', formData: FormData): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'include',
    body: formData,
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message = (data && (data.message as string)) || `Request failed (${res.status})`;
    throw new ApiError(res.status, message);
  }

  return data as T;
}
