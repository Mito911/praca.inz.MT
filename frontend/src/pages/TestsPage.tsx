import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  generateTest,
  getCategories,
  getLanguages,
  type CategoryDto,
  type LanguageDto,
  type TestDirection,
  type TestMode,
  type TestQuestionDto,
} from "../apiClient";
import { useAuth } from "../auth/AuthContext";

type Status = "idle" | "loading" | "ready" | "done" | "error";

export default function TestsPage() {
  const { user } = useAuth();

  const [langs, setLangs] = useState<LanguageDto[]>([]);
  const [cats, setCats] = useState<CategoryDto[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const [languageId, setLanguageId] = useState<number | "">("");
  const [mode, setMode] = useState<TestMode>("WEEK");
  const [direction, setDirection] = useState<TestDirection>("TERM_TO_TRANSLATION");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [count, setCount] = useState<number>(10);

  const [questions, setQuestions] = useState<TestQuestionDto[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<{ ok: number; total: number } | null>(null);

  useEffect(() => {
    async function load() {
      setError(null);
      try {
        const [l, c] = await Promise.all([getLanguages(), getCategories()]);
        setLangs(l);
        setCats(c);
      } catch (e: any) {
        setError(e?.message ?? "Nie udało się pobrać danych.");
      }
    }
    load();
  }, []);

  const catsForLang = useMemo(() => {
    if (languageId === "") return [];
    return cats.filter(c => c.languageId === Number(languageId));
  }, [cats, languageId]);

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setScore(null);

    if (!user) {
      setError("Zaloguj się, aby rozwiązywać testy.");
      return;
    }
    if (languageId === "") {
      setError("Wybierz język.");
      return;
    }
    if (mode === "CATEGORY" && categoryId === "") {
      setError("W trybie KATEGORIA wybierz kategorię.");
      return;
    }

    try {
      setStatus("loading");
      const resp = await generateTest({
        mode,
        languageId: Number(languageId),
        categoryId: categoryId === "" ? null : Number(categoryId),
        count: Math.max(1, Math.min(50, count)),
        direction,
      });

      setQuestions(resp.questions);
      setAnswers({});
      setStatus("ready");
    } catch (e: any) {
      setStatus("error");
      setError(e?.message ?? "Nie udało się wygenerować testu.");
    }
  }

  function finish() {
    const norm = (s: string) => s.trim().toLowerCase();
    let ok = 0;
    for (const q of questions) {
      const a = answers[q.entryId] ?? "";
      if (norm(a) === norm(q.expected)) ok++;
    }
    setScore({ ok, total: questions.length });
    setStatus("done");
  }

  if (!user) {
    return (
      <div className="page">
        <h1>Testy</h1>
        <p className="error">Musisz się zalogować, aby korzystać z testów.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Testy</h1>

      <form className="form" onSubmit={handleGenerate}>
        <div className="form-row">
          <label>
            Język:
            <select value={languageId} onChange={(e) => setLanguageId(e.target.value === "" ? "" : Number(e.target.value))}>
              <option value="">-- wybierz --</option>
              {langs.map(l => <option key={l.id} value={l.id}>{l.name} ({l.code})</option>)}
            </select>
          </label>

          <label>
            Tryb:
            <select value={mode} onChange={(e) => setMode(e.target.value as TestMode)}>
              <option value="DAY">Z dnia</option>
              <option value="WEEK">Z tygodnia</option>
              <option value="MONTH">Z miesiąca</option>
              <option value="ALL">Wszystkie</option>
              <option value="CATEGORY">Z kategorii</option>
              <option value="LAST">Ostatnio dodane</option>
            </select>
          </label>

          <label>
            Kierunek:
            <select value={direction} onChange={(e) => setDirection(e.target.value as TestDirection)}>
              <option value="TERM_TO_TRANSLATION">Termin → Tłumaczenie</option>
              <option value="TRANSLATION_TO_TERM">Tłumaczenie → Termin</option>
            </select>
          </label>

          <label>
            Liczba pytań:
            <input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </label>
        </div>

        <div className="form-row">
          <label>
            Kategoria:
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value === "" ? "" : Number(e.target.value))}
              disabled={languageId === ""}
            >
              <option value="">-- opcjonalnie --</option>
              {catsForLang.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>

          <button className="btn-primary" type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Generuję..." : "Start testu"}
          </button>
        </div>

        {error && <p className="error">{error}</p>}
      </form>

      {status === "ready" || status === "done" ? (
        <section className="card">
          <h2>Rozwiąż test</h2>

          {score && (
            <p><b>Wynik:</b> {score.ok} / {score.total}</p>
          )}

          <div className="quiz">
            {questions.map((q, idx) => (
              <div key={q.entryId} className="quiz-row">
                <div className="quiz-prompt">
                  <b>{idx + 1}.</b> {q.prompt}
                </div>

                <input
                  className="quiz-input"
                  value={answers[q.entryId] ?? ""}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [q.entryId]: e.target.value }))}
                  disabled={status === "done"}
                  placeholder="Twoja odpowiedź..."
                />

                {status === "done" && (
                  <div className="quiz-answer">
                    Poprawnie: <b>{q.expected}</b>
                  </div>
                )}
              </div>
            ))}
          </div>

          {status !== "done" ? (
            <button className="btn-primary" type="button" onClick={finish} disabled={questions.length === 0}>
              Zakończ i policz wynik
            </button>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
