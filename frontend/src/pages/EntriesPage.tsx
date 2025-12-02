// src/pages/EntriesPage.tsx
import { useEffect, useState, FormEvent } from "react";
import {
  getEntries,
  getLanguages,
  getCategories,
  createEntry,
  deleteEntry,
  updateEntry,
  type EntryDto,
  type LanguageDto,
  type CategoryDto,
} from "../apiClient";

type Status = "idle" | "loading" | "ok" | "error";

type FormState = {
  languageId: number | "";
  categoryId: number | "";
  phrase: string;
  translation: string;
};

function EntriesPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const [entries, setEntries] = useState<EntryDto[]>([]);
  const [languages, setLanguages] = useState<LanguageDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);

  const [editingEntryId, setEditingEntryId] = useState<number | null>(null);
  const [editingPhrase, setEditingPhrase] = useState<string>("");
  const [editingTranslation, setEditingTranslation] = useState<string>("");

  const [form, setForm] = useState<FormState>({
    languageId: "",
    categoryId: "",
    phrase: "",
    translation: "",
  });

  // --------- ŁADOWANIE DANYCH ----------

  useEffect(() => {
    async function load() {
      setStatus("loading");
      setError(null);
      try {
        const [langs, cats, ents] = await Promise.all([
          getLanguages(),
          getCategories(),
          getEntries(),
        ]);
        setLanguages(langs);
        setCategories(cats);
        setEntries(ents);
        setStatus("ok");
      } catch (e: any) {
        setError(e?.message ?? "Nieznany błąd podczas ładowania słówek.");
        setStatus("error");
      }
    }

    load();
  }, []);

  // --------- FORMULARZ DODAWANIA ----------

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "languageId" ? { categoryId: "" } : {}),
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.languageId === "") {
      setError("Wybierz język.");
      return;
    }
    if (!form.phrase.trim() || !form.translation.trim()) {
      setError("Fraza i tłumaczenie nie mogą być puste.");
      return;
    }

    const body = {
      languageId: Number(form.languageId),
      categoryId: form.categoryId === "" ? null : Number(form.categoryId),
      term: form.phrase.trim(),
      translation: form.translation.trim(),
    };

    try {
      setStatus("loading");
      const created = await createEntry(body);

      setEntries((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return [...safePrev, created];
      });

      setForm((prev) => ({
        languageId: prev.languageId,
        categoryId: "",
        phrase: "",
        translation: "",
      }));

      setStatus("ok");
    } catch (e: any) {
      setError(e?.message ?? "Nie udało się dodać słówka.");
      setStatus("error");
    }
  }

  // --------- USUWANIE ----------

  async function handleDelete(id: number) {
    if (!confirm("Na pewno usunąć to słówko?")) return;

    try {
      await deleteEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (e: any) {
      setError(e?.message ?? "Nie udało się usunąć słówka.");
    }
  }

  // --------- EDYCJA ----------

  function startEditEntry(entry: EntryDto) {
    setEditingEntryId(entry.id);
    setEditingPhrase(entry.term);
    setEditingTranslation(entry.translation);
  }

  function cancelEditEntry() {
    setEditingEntryId(null);
    setEditingPhrase("");
    setEditingTranslation("");
  }

  async function saveEditEntry(entry: EntryDto) {
    if (!editingPhrase.trim() || !editingTranslation.trim()) {
      setError("Fraza i tłumaczenie nie mogą być puste.");
      return;
    }

    const body = {
      languageId: entry.languageId,
      categoryId: entry.categoryId ?? null,
      term: editingPhrase.trim(),
      translation: editingTranslation.trim(),
    };

    try {
      setStatus("loading");
      const updated = await updateEntry(entry.id, body);
      setEntries((prev) =>
        prev.map((e) => (e.id === entry.id ? updated : e))
      );
      cancelEditEntry();
      setStatus("ok");
    } catch (e: any) {
      setError(e?.message ?? "Nie udało się zaktualizować słówka.");
      setStatus("error");
    }
  }

  // kategorie tylko dla wybranego języka
  const filteredCategories =
    form.languageId === ""
      ? []
      : categories.filter((c) => c.languageId === Number(form.languageId));

  // --------- RENDER ----------

  return (
    <div className="page">
      <h1>Słówka / wpisy w systemie</h1>

      {/* FORMULARZ DODAWANIA */}
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            Język:
            <select
              value={form.languageId}
              onChange={(e) =>
                updateForm(
                  "languageId",
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
            >
              <option value="">-- wybierz język --</option>
              {languages.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.code})
                </option>
              ))}
            </select>
          </label>

          <label>
            Kategoria (opcjonalnie):
            <select
              value={form.categoryId}
              onChange={(e) =>
                updateForm(
                  "categoryId",
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              disabled={form.languageId === ""}
            >
              <option value="">-- bez kategorii --</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="form-row">
          <label>
            Fraza:
            <input
              type="text"
              value={form.phrase}
              onChange={(e) => updateForm("phrase", e.target.value)}
            />
          </label>

          <label>
            Tłumaczenie:
            <input
              type="text"
              value={form.translation}
              onChange={(e) => updateForm("translation", e.target.value)}
            />
          </label>
        </div>

        <button
          className="btn-primary"
          type="submit"
          disabled={status === "loading"}
        >
          Dodaj słówko
        </button>

        {error && <p className="error">{error}</p>}
      </form>

      {/* LISTA SŁÓWEK */}
      <section className="list-section">
        {status === "loading" && entries.length === 0 && (
          <p>Ładowanie słówek...</p>
        )}

        {status === "ok" && entries.length === 0 && (
          <p>Brak słówek w bazie.</p>
        )}

        {entries.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Język</th>
                <th>Kategoria</th>
                <th>Fraza</th>
                <th>Tłumaczenie</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => {
                const lang = languages.find((l) => l.id === e.languageId);
                const cat =
                  e.categoryId != null
                    ? categories.find((c) => c.id === e.categoryId)
                    : null;
                const isEditing = editingEntryId === e.id;

                return (
                  <tr key={e.id}>
                    <td>{e.id}</td>
                    <td>{lang ? `${lang.name} (${lang.code})` : e.languageId}</td>
                    <td>{cat ? cat.name : "-"}</td>

                    {/* FRAZA */}
                    <td>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingPhrase}
                          onChange={(ev) => setEditingPhrase(ev.target.value)}
                        />
                      ) : (
                        e.term
                      )}
                    </td>

                    {/* TŁUMACZENIE */}
                    <td>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingTranslation}
                          onChange={(ev) =>
                            setEditingTranslation(ev.target.value)
                          }
                        />
                      ) : (
                        e.translation
                      )}
                    </td>

                    {/* AKCJE */}
                    <td>
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={() => saveEditEntry(e)}
                          >
                            Zapisz
                          </button>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={cancelEditEntry}
                          >
                            Anuluj
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => startEditEntry(e)}
                          >
                            Edytuj
                          </button>
                          <button
                            type="button"
                            className="btn-danger"
                            onClick={() => handleDelete(e.id)}
                          >
                            Usuń
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default EntriesPage;

