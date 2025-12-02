// src/pages/LanguagesPage.tsx
import { useEffect, useState } from "react";
import { getLanguages, type LanguageDto } from "../apiClient";

type Status = "idle" | "loading" | "ok" | "error";

function LanguagesPage() {
  const [languages, setLanguages] = useState<LanguageDto[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setStatus("loading");
      try {
        const data = await getLanguages();
        setLanguages(data);
        setStatus("ok");
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
        setStatus("error");
      }
    }

    load();
  }, []);

  return (
    <div className="page">
      <h1>Języki w systemie</h1>

      {status === "loading" && <p>Ładowanie listy języków...</p>}

      {status === "error" && (
        <p className="error">Błąd podczas ładowania: {error}</p>
      )}

      {status === "ok" && languages.length === 0 && (
        <p>Brak języków w bazie.</p>
      )}

      {status === "ok" && languages.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nazwa</th>
              <th>Kod</th>
            </tr>
          </thead>
          <tbody>
            {languages.map((lang) => (
              <tr key={lang.id}>
                <td>{lang.id}</td>
                <td>{lang.name}</td>
                <td>{lang.code}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default LanguagesPage;
