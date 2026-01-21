# praca.inz.MT — Aplikacja do nauki języków (React + Spring Boot + PostgreSQL)

Aplikacja webowa wspierająca naukę słówek i zwrotów. System umożliwia zarządzanie słownikiem (CRUD), językami i kategoriami, generowanie testów w różnych trybach oraz zapis i podgląd historii wyników. Dodatkowo aplikacja posiada moduł tłumaczeń (domyślnie EN→PL) ułatwiający szybkie dodawanie wpisów.

---

## Stack technologiczny

**Frontend**
- React + TypeScript (Vite)
- React Router
- Fetch API
- localStorage (JWT)

**Backend**
- Java 21 + Spring Boot
- Spring Security + JWT (stateless)
- Spring Data JPA
- PostgreSQL
- Flyway (migracje)

**Infrastruktura / uruchamianie**
- Docker + Docker Compose
- Nginx (serwowanie frontendu w trybie produkcyjnym)

---

## Status i rozwój projektu

Projekt rozwijany był iteracyjnie: najpierw przygotowano backend (modele, baza danych, migracje Flyway, autoryzacja JWT), następnie zbudowano frontend z podziałem na widoki i routing. W kolejnych krokach dodano moduły CRUD (Languages/Categories/Entries), generator testów oraz zapis historii testów. Ostatni etap obejmuje przygotowanie dokumentacji użytkownika i technicznej w repozytorium.

---

## Główne funkcje

### 1) Autoryzacja i role (JWT)
- Rejestracja i logowanie użytkownika
- Token JWT przechowywany w `localStorage`
- Automatyczne dołączanie nagłówka `Authorization: Bearer <token>` do zapytań
- Role: `USER`, `ADMIN`
- Widok administracyjny dostępny tylko dla roli `ADMIN`

### 2) Moduł słownika (CRUD)
- **Języki** (`/languages`)
- **Kategorie** (`/categories`)
- **Słówka / wpisy** (`/entries`)
  - tworzenie / edycja / usuwanie
  - wyszukiwanie po frazie/tłumaczeniu
  - filtrowanie po języku i kategorii

### 3) Testy
- Generator testów na podstawie słówek:
  - tryby: `DAY`, `WEEK`, `MONTH`, `ALL`, `CATEGORY`, `LAST`
  - kierunek: `TERM_TO_TRANSLATION` lub `TRANSLATION_TO_TERM`
- Sprawdzanie odpowiedzi bez rozróżniania wielkości liter (case-insensitive)
- Podsumowanie wyniku po zakończeniu testu

### 4) Historia testów
- Zapis wyniku testu do bazy danych
- Podgląd ostatnich testów w interfejsie użytkownika

### 5) Moduł tłumaczeń
- Endpoint `/api/translate` oraz przycisk w UI do automatycznego wypełniania pola tłumaczenia
- Domyślny kierunek: **EN → PL**, możliwość przełączenia na **PL → EN**
- Integracja z usługą LibreTranslate (konfiguracja przez `libretranslate.base-url`)

---

## Dokumentacja

- 📘 Instrukcja użytkownika (PDF): `docs/instrukcja-uzytkownika.pdf`

> Plik PDF jest przechowywany w repozytorium, dzięki czemu dokumentacja jest wersjonowana razem z kodem.

---

## Endpointy (skrót)

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Health
- `GET /api/health`

### Languages
- `GET /api/languages`
- (opcjonalnie) CRUD jeśli dodasz w panelu admina

### Categories
- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/{id}`
- `DELETE /api/categories/{id}`

### Entries
- `GET /api/entries`
- `POST /api/entries`
- `PUT /api/entries/{id}`
- `DELETE /api/entries/{id}`

### Tests
- `POST /api/tests/generate`
- `POST /api/tests/history`
- `GET /api/tests/history?userId=...&limit=...`

### Translate
- `POST /api/translate`

---

## Uruchomienie aplikacji

### Wariant A — Docker Compose (najprościej)

W katalogu `backend` (tam gdzie masz `docker-compose.yml`):

```bash
docker compose up -d --build
docker compose ps
