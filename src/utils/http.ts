/**
 * HTTP utility functions
 */

/**
 * Fetch and parse JSON with type safety
 */
export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const json: unknown = await response.json();
  return json as T;
}
