import { FormEvent, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { loginRequest } from "../apiClient";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const auth = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Podaj email i hasło.");
      return;
    }

    try {
      setLoading(true);
      const resp = await loginRequest({ email: email.trim(), password });
      auth.login({ id: resp.id, email: resp.email, role: resp.role, token: resp.token });
      navigate("/languages", { replace: true });

    } catch (e: any) {
      setError(e?.message ?? "Logowanie nie powiodło się.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1>Logowanie</h1>

      <form className="card form" onSubmit={handleSubmit}>
        <label className="field">
          <span>E-mail</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        </label>

        <label className="field">
          <span>Hasło</span>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
        </label>

        <button className="btn primary" disabled={loading} type="submit">
          {loading ? "Logowanie..." : "Zaloguj"}
        </button>

        {error && <p className="error">{error}</p>}

        <p className="muted">
          Nie masz konta? <NavLink to="/register">Zarejestruj się</NavLink>
        </p>
      </form>
    </div>
  );
}

