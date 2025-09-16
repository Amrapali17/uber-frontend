export async function apiRequest(path, method = "GET", body = null, token) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : null,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Something went wrong");
  }

  return res.json();
}
