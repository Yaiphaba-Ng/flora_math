export async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== "undefined"
      ? `http://${window.location.hostname}:8000/api`
      : "http://localhost:8000/api");
  const res = await fetch(`${baseUrl}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`API Error: ${res.status} - ${errorBody}`);
  }

  return res.json();
}
