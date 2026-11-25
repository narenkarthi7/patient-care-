const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('accessToken');
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error('Unable to connect to the server. Check your connection and try again.');
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = typeof body === 'object' && body !== null && 'message' in body
      ? (body as { message: string | string[] }).message
      : 'The request could not be completed';
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }
  return body as T;
}
