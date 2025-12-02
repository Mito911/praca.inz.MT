// src/pages/HealthPage.tsx
import { useEffect, useState } from "react";
import { getHealth } from "../apiClient";

type Status = "idle" | "loading" | "ok" | "error";

function HealthPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    async function load() {
      setStatus("loading");
      try {
        const text = await getHealth();
        setMessage(text);
        setStatus("ok");
      } catch (e: any) {
        setMessage(e?.message ?? "Nieznany błąd");
        setStatus("error");
      }
    }

    load();
  }, []);

  return (
    <div className="page">
      <h1>Health</h1>

      {status === "loading" && <p>Sprawdzanie stanu backendu...</p>}

      {status === "ok" && (
        <p className="health-ok">
          Backend działa poprawnie: <strong>{message}</strong>
        </p>
      )}

      {status === "error" && (
        <p className="health-error">
          Nie udało się sprawdzić stanu backendu: <strong>{message}</strong>
        </p>
      )}
    </div>
  );
}

export default HealthPage;
