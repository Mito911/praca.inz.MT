import { FormEvent, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { registerRequest } from "../apiClient";
import { useAuth } from "../auth/AuthContext";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
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
    if (password.length < 6) {
      setError("Hasło powinno mieć min. 6 znaków.");
      return;
    }
    if (password !== password2) {
      setError("Hasła nie są takie same.");
      return;
    }

    try {
      setLoading(true);
      const resp = await registerRequest({ email: email.trim(), password });
      auth.login({ email: resp.email, token: resp.token, role: resp.role });
      navigate("/languages", { replace: true });
    } catch (e: any) {
      setError(e?.message ?? "Rejestracja nie powiodła się.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1>Rejestracja</h1>

      <form className="card form" onSubmit={handleSubmit}>
        <label className="field">
          <span>E-mail</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        </label>

        <label className="field">
          <span>Hasło</span>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
        </label>

        <label className="field">
          <span>Powtórz hasło</span>
          <input value={password2} onChange={(e) => setPassword2(e.target.value)} type="password" />
        </label>

        <button className="btn primary" disabled={loading} type="submit">
          {loading ? "Rejestracja..." : "Utwórz konto"}
        </button>

        {error && <p className="error">{error}</p>}

        <p className="muted">
          Masz już konto? <NavLink to="/login">Zaloguj się</NavLink>
        </p>
      </form>
    </div>
  );
}
