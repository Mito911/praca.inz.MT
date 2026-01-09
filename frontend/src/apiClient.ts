// src/apiClient.ts
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081";

// --- TOKEN W LOCALSTORAGE ---
const TOKEN_KEY = "authToken";

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// --- TYPY ---
export type UserRole = "USER" | "ADMIN";

export type AuthResponseDto = {
  token: string;
  id: number;
  email: string;
  role: UserRole;
};

export type LanguageDto = {
  id: number;
  name: string;
  code: string;
  createdAt: string;
};

export type CategoryDto = {
  id: number;
  name: string;
  languageId: number;
  createdAt: string;
};

export type EntryDto = {
  id: number;
  languageId: number;
  categoryId: number | null;
  term: string;
  translation: string;
  createdAt: string;
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

// --- AUTH ---
export async function loginRequest(body: {
  email: string;
  password: string;
}): Promise<AuthResponseDto> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await handleResponse<AuthResponseDto>(res);
  setAuthToken(data.token);
  return data;
}

export async function registerRequest(body: {
  email: string;
  password: string;
}): Promise<AuthResponseDto> {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await handleResponse<AuthResponseDto>(res);
  setAuthToken(data.token);
  return data;
}

export function logout() {
  setAuthToken(null);
}

// --- ENDPOINTY BACKENDU ---
export async function getHealth(): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/health`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Health failed: ${res.status}`);
  }
  return res.text();
}

export async function getLanguages(): Promise<LanguageDto[]> {
  const res = await fetch(`${API_BASE_URL}/api/languages`, {
    headers: { ...authHeaders() },
  });
  return handleResponse<LanguageDto[]>(res);
}

export async function getCategories(): Promise<CategoryDto[]> {
  const res = await fetch(`${API_BASE_URL}/api/categories`, {
    headers: { ...authHeaders() },
  });
  return handleResponse<CategoryDto[]>(res);
}

export async function createCategory(
  name: string,
  languageId: number
): Promise<CategoryDto> {
  const res = await fetch(`${API_BASE_URL}/api/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ name, languageId }),
  });
  return handleResponse<CategoryDto>(res);
}

export async function updateCategory(
  id: number,
  body: { name: string }
): Promise<CategoryDto> {
  const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  return handleResponse<CategoryDto>(res);
}

export async function deleteCategory(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}


// /api/entries
export async function getEntries(): Promise<EntryDto[]> {
  const res = await fetch(`${API_BASE_URL}/api/entries`, {
    headers: { ...authHeaders() },
  });
  return handleResponse<EntryDto[]>(res);
}

export async function createEntry(body: {
  languageId: number;
  categoryId: number | null;
  term: string;
  translation: string;
}): Promise<EntryDto> {
  const res = await fetch(`${API_BASE_URL}/api/entries`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  return handleResponse<EntryDto>(res);
}

export async function updateEntry(
  id: number,
  body: {
    languageId: number;
    categoryId: number | null;
    term: string;
    translation: string;
  }
): Promise<EntryDto> {
  const res = await fetch(`${API_BASE_URL}/api/entries/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  return handleResponse<EntryDto>(res);
}

export async function deleteEntry(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/entries/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

// --- ADMIN ---
// Uwaga: backend musi mieć endpointy /api/admin/users...

export type AdminUserDto = {
  id: number;
  email: string;
  role: UserRole;
  createdAt?: string;
};

export async function adminGetUsers(): Promise<AdminUserDto[]> {
  const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
    headers: { ...authHeaders() },
  });
  return handleResponse<AdminUserDto[]>(res);
}

export async function adminCreateUser(body: {
  email: string;
  password: string;
  role: UserRole;
}): Promise<AdminUserDto> {
  const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  return handleResponse<AdminUserDto>(res);
}

export async function adminUpdateRole(
  userId: number,
  role: UserRole
): Promise<AdminUserDto> {
  const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ role }),
  });
  return handleResponse<AdminUserDto>(res);
}

export async function adminResetPassword(
  userId: number,
  newPassword: string
): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/api/admin/users/${userId}/password`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ password: newPassword }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export type TestMode = "DAY" | "WEEK" | "MONTH" | "ALL" | "CATEGORY" | "LAST";
export type TestDirection = "TERM_TO_TRANSLATION" | "TRANSLATION_TO_TERM";

export type TestGenerateRequestDto = {
  mode: TestMode;
  languageId: number;
  categoryId?: number | null;
  count: number;
  direction: TestDirection;
};

export type TestQuestionDto = {
  entryId: number;
  prompt: string;
  expected: string;
};

export type TestGenerateResponseDto = {
  questions: TestQuestionDto[];
  totalAvailable: number;
};

export async function generateTest(body: TestGenerateRequestDto): Promise<TestGenerateResponseDto> {
  const res = await fetch(`${API_BASE_URL}/api/tests/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  return handleResponse<TestGenerateResponseDto>(res);
}


export type TestMode = "ALL" | "CATEGORY" | "DAY" | "WEEK" | "MONTH" | "LAST";
export type TestDirection = "TERM_TO_TRANSLATION" | "TRANSLATION_TO_TERM";

export type TestHistoryDto = {
  id: number;
  languageId: number;
  categoryId: number | null;
  mode: TestMode;
  direction: TestDirection;
  total: number;
  correct: number;
  createdAt: string;
};

export async function saveTestHistory(body: {
  languageId: number;
  categoryId: number | null;
  mode: TestMode;
  direction: TestDirection;
  total: number;
  correct: number;
}): Promise<TestHistoryDto> {
  const res = await fetch(`${API_BASE_URL}/api/tests/history`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  return handleResponse<TestHistoryDto>(res);
}

export async function getTestHistory(userId: number, limit = 20): Promise<TestHistoryDto[]> {
  const res = await fetch(`${API_BASE_URL}/api/tests/history?userId=${userId}&limit=${limit}`, {
    headers: { ...authHeaders() },
  });
  return handleResponse<TestHistoryDto[]>(res);
}


