import { useEffect, useState, type FormEvent } from "react";
import {
  adminCreateUser,
  adminGetUsers,
  adminResetPassword,
  adminUpdateRole,
  type AdminUserDto,
  type UserRole,
} from "../apiClient";

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // create user
  const [newEmail, setNewEmail] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("USER");

  // reset password (per user)
  const [resetPass, setResetPass] = useState<Record<number, string>>({});

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const data = await adminGetUsers();
      setUsers(data);
    } catch (e: any) {
      setError(e?.message ?? "Nie udało się pobrać użytkowników.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!newEmail.trim() || !newPass.trim()) {
      setError("Podaj email i hasło.");
      return;
    }

    try {
      await adminCreateUser({
        email: newEmail.trim(),
        password: newPass,
        role: newRole,
      });
      setNewEmail("");
      setNewPass("");
      setNewRole("USER");
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Nie udało się utworzyć użytkownika.");
    }
  }

  async function handleRoleChange(userId: number, role: UserRole) {
    setError(null);
    try {
      await adminUpdateRole(userId, role);
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Nie udało się zmienić roli.");
    }
  }

  async function handleResetPassword(userId: number) {
    setError(null);
    const pass = resetPass[userId] ?? "";
    if (!pass.trim()) {
      setError("Podaj nowe hasło.");
      return;
    }

    try {
      await adminResetPassword(userId, pass);
      setResetPass((prev) => {
        const copy = { ...prev };
        delete copy[userId];
        return copy;
      });
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Nie udało się zresetować hasła.");
    }
  }

  return (
    <div className="page">
      <h1>Panel administratora</h1>

      {error && <p className="error">{error}</p>}

      <div className="grid-2">
        <div className="card">
          <h2>Dodaj użytkownika</h2>

          <form className="simple-form" onSubmit={handleCreate}>
            <label>
              Email
              <input
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                type="email"
              />
            </label>

            <label>
              Hasło
              <input
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                type="password"
              />
            </label>

            <label>
              Rola
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </label>

            <button className="btn-primary" type="submit">
              Utwórz
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Użytkownicy</h2>

          {loading && <p>Ładowanie...</p>}

          {!loading && users.length === 0 && <p>Brak użytkowników.</p>}

          {!loading && users.length > 0 && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Rola</th>
                  <th>Zmiana roli</th>
                  <th>Reset hasła</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>

                    <td>
                      <select
                        value={u.role}
                        onChange={(e) =>
                          handleRoleChange(u.id, e.target.value as UserRole)
                        }
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>

                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          type="password"
                          placeholder="nowe hasło"
                          value={resetPass[u.id] ?? ""}
                          onChange={(e) =>
                            setResetPass((prev) => ({
                              ...prev,
                              [u.id]: e.target.value,
                            }))
                          }
                        />
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => handleResetPassword(u.id)}
                        >
                          Zapisz
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

