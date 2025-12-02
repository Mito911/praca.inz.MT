// src/apiClient.ts
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081";

// ------------- TYPY ------------- //

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
  term: string;          // <-- NAZWA jak w backendzie
  translation: string;
  createdAt: string;
};
export type CreateEntryPayload = {
  languageId: number;
  categoryId: number | null;
  term: string;
  translation: string;
};

// requesty do POST/PUT
export type CreateCategoryRequest = {
  name: string;
  languageId: number;
};

export type CreateEntryRequest = {
  languageId: number;
  categoryId: number | null;
  phrase: string;
  translation: string;
};

export type UpdateEntryRequest = CreateEntryRequest;

// ------------- POMOCNIK ------------- //

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ------------- HEALTH ------------- //

export async function getHealth(): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/health`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Health failed: ${res.status}`);
  }
  return res.text();
}

// ------------- LANGUAGES ------------- //

export async function getLanguages(): Promise<LanguageDto[]> {
  const res = await fetch(`${API_BASE_URL}/api/languages`);
  return handleResponse<LanguageDto[]>(res);
}

// ------------- CATEGORIES ------------- //

export async function getCategories(): Promise<CategoryDto[]> {
  const res = await fetch(`${API_BASE_URL}/api/categories`);
  return handleResponse<CategoryDto[]>(res);
}

export async function createCategory(
  body: CreateCategoryRequest
): Promise<CategoryDto> {
  const res = await fetch(`${API_BASE_URL}/api/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse<CategoryDto>(res);
}

// ------------- ENTRIES (SŁÓWKA) ------------- //

export async function getEntries(): Promise<EntryDto[]> {
  const res = await fetch(`${API_BASE_URL}/api/entries`);
  return handleResponse<EntryDto[]>(res);
}

export async function createEntry(body: CreateEntryPayload): Promise<EntryDto> {
  const res = await fetch(`${API_BASE_URL}/api/entries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse<EntryDto>(res);
}



export async function deleteEntry(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/entries/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

// --- CATEGORY UPDATE & DELETE ---

export async function updateCategory(
  id: number,
  body: { name: string }
): Promise<CategoryDto> {
  const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return handleResponse<CategoryDto>(res);
}

export async function deleteCategory(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

// --- ENTRY UPDATE (edycja słówka) ---
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse<EntryDto>(res);
}
