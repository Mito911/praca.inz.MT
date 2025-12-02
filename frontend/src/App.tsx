// src/App.tsx
import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import "./App.css";
import LanguagesPage from "./pages/LanguagesPage";
import HealthPage from "./pages/HealthPage";
import CategoriesPage from "./pages/CategoriesPage";
import EntriesPage from "./pages/EntriesPage";

function App() {
  return (
    <BrowserRouter>
      <div className="app-root">
        <header className="app-header">
          <div className="logo">JezykiApp</div>

          <nav className="app-nav">
            <NavLink
              to="/health"
              className={({ isActive }) =>
                isActive ? "nav-btn active" : "nav-btn"
              }
            >
              Health
            </NavLink>

            <NavLink
              to="/categories"
              className={({ isActive }) =>
                isActive ? "nav-btn active" : "nav-btn"
              }
            >
              Kategorie
            </NavLink>

            <NavLink
              to="/entries"
              className={({ isActive }) =>
                isActive ? "nav-btn active" : "nav-btn"
              }
            >
              Słówka
            </NavLink>

            <NavLink
              to="/languages"
              className={({ isActive }) =>
                isActive ? "nav-btn active" : "nav-btn"
              }
            >
              Języki
            </NavLink>
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/health" element={<HealthPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/entries" element={<EntriesPage />} />
            <Route path="/languages" element={<LanguagesPage />} />
            {/* wszystko inne -> /languages */}
            <Route path="*" element={<Navigate to="/languages" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;



