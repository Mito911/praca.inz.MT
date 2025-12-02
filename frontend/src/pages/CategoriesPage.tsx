// src/pages/CategoriesPage.tsx
import { useEffect, useState } from "react";
import {
  getLanguages,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type LanguageDto,
  type CategoryDto,
} from "../apiClient";

type Status = "loading" | "ok" | "error";

function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [languages, setLanguages] = useState<LanguageDto[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);

  // stan formularza
  const [newName, setNewName] = useState("");
  const [selectedLanguageId, setSelectedLanguageId] = useState<number | "">("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState<string>("");


  // ładowanie listy kategorii + języków
  useEffect(() => {
    async function load() {
      try {
        setStatus("loading");
        const [cats, langs] = await Promise.all([
          getCategories(),
          getLanguages(),
        ]);
        setCategories(cats);
        setLanguages(langs);
        setStatus("ok");
      } catch (e: any) {
        setError(e?.message ?? "Nieznany błąd");
        setStatus("error");
      }
    }

    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);

    const trimmed = newName.trim();
    if (!trimmed) {
      setCreateError("Nazwa kategorii nie może być pusta.");
      return;
    }

    if (selectedLanguageId === "") {
      setCreateError("Wybierz język kategorii.");
      return;
    }

    try {
      setIsCreating(true);
      const created = await createCategory(trimmed, Number(selectedLanguageId));

      // dopisujemy nową kategorię do listy
      setCategories((prev) => [...prev, created]);
      setNewName("");
      setSelectedLanguageId("");
    } catch (e: any) {
      setCreateError(
        e?.message ?? "Nie udało się utworzyć kategorii."
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function startEdit(cat: CategoryDto) {
    setEditingId(cat.id);
    setEditingName(cat.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName("");
  }

  async function saveEdit(cat: CategoryDto) {
    if (!editingName.trim()) {
      setError("Nazwa kategorii nie może być pusta.");
      return;
    }

    try {
      setStatus("loading");
      const updated = await updateCategory(cat.id, { name: editingName.trim() });
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? updated : c))
      );
      setEditingId(null);
      setEditingName("");
      setStatus("ok");
    } catch (e: any) {
      setError(e?.message ?? "Nie udało się zaktualizować kategorii.");
      setStatus("error");
    }
  }

  async function handleDeleteCategory(id: number) {
    if (!confirm("Na pewno usunąć tę kategorię?")) {
      return;
    }
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (e: any) {
      setError(e?.message ?? "Nie udało się usunąć kategorii.");
    }
  }


  return (
    <div className="page">
      <h1>Kategorie w systemie</h1>

      {/* FORMULARZ DODAWANIA */}
      <form className="simple-form" onSubmit={handleCreate}>
        <label>
          Nazwa nowej kategorii:
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="np. Animals"
          />
        </label>

        <label>
          Język kategorii:
          <select
            value={selectedLanguageId}
            onChange={(e) => {
              const v = e.target.value;
              setSelectedLanguageId(v === "" ? "" : Number(v));
            }}
          >
            <option value="">-- wybierz język --</option>
            {languages.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.code})
              </option>
            ))}
          </select>
        </label>

        <button type="submit" disabled={isCreating}>
          {isCreating ? "Zapisywanie..." : "Dodaj kategorię"}
        </button>

        {createError && <p className="error">{createError}</p>}
      </form>

      <hr />

      {/* LISTA / STANY ŁADOWANIA */}
      {status === "loading" && <p>Ładowanie listy kategorii...</p>}

      {status === "error" && (
        <p className="error">Błąd podczas ładowania: {error}</p>
      )}

      {status === "ok" && categories.length === 0 && (
        <p>Brak kategorii w bazie.</p>
      )}

      {status === "ok" && categories.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nazwa</th>
              <th>Język</th>
              <th>Utworzono</th>
              <th>Akcje</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((c) => {
              const lang = languages.find((l) => l.id === c.languageId);
              const isEditing = editingId === c.id;

              return (
                <tr key={c.id}>
                  <td>{c.id}</td>

                  {/* NAZWA – w trybie edycji input, inaczej tekst */}
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                      />
                    ) : (
                      c.name
                    )}
                  </td>

                  {/* JĘZYK */}
                  <td>{lang ? `${lang.name} (${lang.code})` : c.languageId}</td>

                  {/* DATA UTWORZENIA */}
                  <td>{new Date(c.createdAt).toLocaleString()}</td>

                  {/* AKCJE */}
                  <td>
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() => saveEdit(c)}
                        >
                          Zapisz
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={cancelEdit}
                        >
                          Anuluj
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => startEdit(c)}
                        >
                          Edytuj
                        </button>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => handleDeleteCategory(c.id)}
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
    </div>
  );
}


export default CategoriesPage;
