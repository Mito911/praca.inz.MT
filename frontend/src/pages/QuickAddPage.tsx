// frontend/src/pages/QuickAddPage.tsx
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createEntry,
  getCategories,
  getLanguages,
  translateRequest,
  type CategoryDto,
  type LanguageDto,
} from "../apiClient";

type Status = "idle" | "loading" | "ok" | "error";

export default function QuickAddPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const [languages, setLanguages] = useState<LanguageDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);

  // proste stałe kierunki (możesz rozbudować później)
  const [trSource, setTrSource] = useState<"en" | "pl">("en");
  const [trTarget, setTrTarget] = useState<"en" | "pl">("pl");

  const [form, setForm] = useState({
    languageId: "" as number | "",
    categoryId: "" as number | "",
    phrase: "",
    translation: "",
    url: "",
  });

  // pobranie query paramów: text + url
  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  const initialText = (query.get("text") ?? "").trim();
  const sourceUrl = (query.get("url") ?? "").trim();

  useEffect(() => {
    async function load() {
      setStatus("loading");
      setError(null);
      try {
        const [langs, cats] = await Promise.all([getLanguages(), getCategories()]);
        setLanguages(langs);
        setCategories(cats);

        // ustaw domyślny język jeśli masz np. English (code en)
        const enLang = langs.find((l) => l.code?.toLowerCase() === "en");
        setForm((prev) => ({
          ...prev,
          languageId: enLang ? enLang.id : prev.languageId,
          phrase: initialText || prev.phrase,
          url: sourceUrl || prev.url,
        }));

        setStatus("ok");
      } catch (e: any) {
        setError(e?.message ?? "Nie udało się załadować danych.");
        setStatus("error");
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredCategories =
    form.languageId === ""
      ? []
      : categories.filter((c) => c.languageId === Number(form.languageId));

  async function handleTranslate() {
    setError(null);
    if (!form.phrase.trim()) {
      setError("Wpisz frazę, żeby ją przetłumaczyć.");
      return;
    }

    try {
      setStatus("loading");
      const resp = await translateRequest({
        text: form.phrase.trim(),
        source: trSource,
        target: trTarget,
      });

      setForm((prev) => ({
        ...prev,
        translation: resp.translatedText ?? "",
      }));
      setStatus("ok");
    } catch (e: any) {
      setError(e?.message ?? "Nie udało się przetłumaczyć.");
      setStatus("error");
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.languageId === "") {
      setError("Wybierz język.");
      return;
    }
    if (!form.phrase.trim()) {
      setError("Fraza nie może być pusta.");
      return;
    }
    if (!form.translation.trim()) {
      setError("Tłumaczenie nie może być puste (kliknij 'Przetłumacz').");
      return;
    }

    try {
      setStatus("loading");
      await createEntry({
        languageId: Number(form.languageId),
        categoryId: form.categoryId === "" ? null : Number(form.categoryId),
        term: form.phrase.trim(),
        translation: form.translation.trim(),
      });
      setStatus("ok");

      // po zapisie przerzuć na listę słówek
      window.location.href = "/entries";
    } catch (e: any) {
      setError(e?.message ?? "Nie udało się zapisać słówka.");
      setStatus("error");
    }
  }

  return (
    <div className="page">
      <h1>Szybkie dodanie słówka</h1>

      {form.url && (
        <p style={{ opacity: 0.8, fontSize: 14 }}>
          Źródło: <a href={form.url} target="_blank" rel="noreferrer">{form.url}</a>
        </p>
      )}

      <form className="form" onSubmit={handleSave}>
        <div className="form-row">
          <label>
            Język:
            <select
              value={form.languageId}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  languageId: e.target.value === "" ? "" : Number(e.target.value),
                  categoryId: "",
                }))
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
                setForm((prev) => ({
                  ...prev,
                  categoryId: e.target.value === "" ? "" : Number(e.target.value),
                }))
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
              onChange={(e) => setForm((prev) => ({ ...prev, phrase: e.target.value }))}
            />
          </label>

          <label>
            Tłumaczenie:
            <input
              type="text"
              value={form.translation}
              onChange={(e) => setForm((prev) => ({ ...prev, translation: e.target.value }))}
            />
          </label>
        </div>

        <div className="form-row">
          <label>
            Kierunek tłumaczenia:
            <select
              value={`${trSource}-${trTarget}`}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "en-pl") { setTrSource("en"); setTrTarget("pl"); }
                if (val === "pl-en") { setTrSource("pl"); setTrTarget("en"); }
              }}
            >
              <option value="en-pl">EN → PL</option>
              <option value="pl-en">PL → EN</option>
            </select>
          </label>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleTranslate}
            disabled={status === "loading"}
          >
            Przetłumacz do pola
          </button>

          <button className="btn-primary" type="submit" disabled={status === "loading"}>
            Zapisz słówko
          </button>
        </div>

        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
