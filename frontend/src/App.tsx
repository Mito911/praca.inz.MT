import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import "./App.css";
import QuickAddPage from "./pages/QuickAddPage";

import LanguagesPage from "./pages/LanguagesPage";
import HealthPage from "./pages/HealthPage";
import CategoriesPage from "./pages/CategoriesPage";
import EntriesPage from "./pages/EntriesPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import RequireAuth from "./routing/RequireAuth";
import RequireAdmin from "./routing/RequireAdmin";
import TestsPage from "./pages/TestsPage";



import { useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import AdminRoute from "./auth/AdminRoute";

function AppHeader() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="logo">JezykiApp</div>

      <nav className="app-nav">
        {user && (
          <>
            <NavLink to="/health" className={({ isActive }) => (isActive ? "nav-btn active" : "nav-btn")}>
              Health
            </NavLink>

            <NavLink to="/categories" className={({ isActive }) => (isActive ? "nav-btn active" : "nav-btn")}>
              Kategorie
            </NavLink>

            <NavLink to="/entries" className={({ isActive }) => (isActive ? "nav-btn active" : "nav-btn")}>
              Słówka
            </NavLink>

            <NavLink to="/languages" className={({ isActive }) => (isActive ? "nav-btn active" : "nav-btn")}>
              Języki
            </NavLink>

            <NavLink to="/tests" className={({ isActive }) => (isActive ? "nav-btn active" : "nav-btn")}>
              Testy
            </NavLink>

            {isAdmin && (
              <NavLink to="/admin" className={({ isActive }) => (isActive ? "nav-btn active" : "nav-btn")}>
                Admin
              </NavLink>
            )}
          </>
        )}
      </nav>

      <div className="auth-box">
        {!user ? (
          <>
            <NavLink to="/login" className={({ isActive }) => (isActive ? "nav-btn active" : "nav-btn")}>
              Logowanie
            </NavLink>
            <NavLink to="/register" className={({ isActive }) => (isActive ? "nav-btn active" : "nav-btn")}>
              Rejestracja
            </NavLink>
          </>
        ) : (
          <>
            <span className="auth-user">{user.email}</span>
            <button className="btn" type="button" onClick={logout}>
              Wyloguj
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <div className="app-root">
        <AppHeader />

        <main className="app-main">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/health"
              element={
                <RequireAuth>
                  <HealthPage />
                </RequireAuth>
              }
            />
            <Route
              path="/categories"
              element={
                <RequireAuth>
                  <CategoriesPage />
                </RequireAuth>
              }
            />
            <Route
              path="/entries"
              element={
                <RequireAuth>
                  <EntriesPage />
                </RequireAuth>
              }
            />
            <Route
              path="/languages"
              element={
                <RequireAuth>
                  <LanguagesPage />
                </RequireAuth>
              }
            />

            <Route
            path="/tests"
            element={
            <TestsPage />} />

            <Route path="/quick-add" element={<QuickAddPage />} />

            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminPage />
                </RequireAdmin>
              }
            />

            <Route path="*" element={<Navigate to="/languages" replace />} />
          </Routes>

        </main>
      </div>
    </BrowserRouter>
  );
}
