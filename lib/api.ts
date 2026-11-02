export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function adminApi<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token =
    typeof window === "undefined"
      ? null
      : window.localStorage.getItem("relay_admin_token");
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : body?.message;
    throw new Error(message ?? "요청 처리에 실패했습니다.");
  }

  return response.json() as Promise<T>;
}
