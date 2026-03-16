# 🏠 RentAPlace — Capstone Project

Full-stack property rental platform built with **ASP.NET Core 8**, **Angular 17**, and **PostgreSQL**, running entirely in **Docker** — zero local SDK needed.

---

## 🧩 Architecture

| Service        | Tech                     | Port   |
|----------------|--------------------------|--------|
| **Frontend**   | Angular 17 + Nginx       | 4200   |
| **Main API**   | ASP.NET Core 8 + EF Core | 5000   |
| **Messaging API** | ASP.NET Core 8 (separate) | 5001 |
| **Main DB**    | PostgreSQL 16            | 5432   |
| **Msg DB**     | PostgreSQL 16            | 5433   |

---

## ✅ Prerequisites (macOS Apple Silicon)

Install these if not already present:

```bash
# 1. Docker Desktop for Mac (Apple Silicon)
# Download from: https://www.docker.com/products/docker-desktop/
# Make sure Docker Desktop is RUNNING before proceeding

# 2. Verify Docker works
docker --version
docker compose version
```

That's it — no .NET SDK, no Node.js, no Angular CLI needed locally.

---

## 🚀 Running the Project

### Step 1 — Extract the project

```bash
unzip rentaplace.zip
cd rentaplace
```

### Step 2 — Start everything with one command

```bash
docker compose up --build
```

> First run takes **5–8 minutes** to download images and build. Subsequent starts take ~30 seconds.

### Step 3 — Open the app

| URL | Description |
|-----|-------------|
| http://localhost:4200 | **Frontend (main app)** |
| http://localhost:5000/swagger | Main API docs |
| http://localhost:5001/swagger | Messaging API docs |

---

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| **Renter** | user@rentaplace.com | password123 |
| **Owner** | owner@rentaplace.com | password123 |

---

## 📁 Project Structure

```
rentaplace/
├── docker-compose.yml          ← orchestrates all services
├── schema.sql                  ← database schema (as required)
│
├── backend/                    ← ASP.NET Core 8 Main API
│   ├── Controllers/
│   │   ├── AuthController.cs       (register, login)
│   │   ├── PropertiesController.cs (CRUD + search + image upload)
│   │   └── ReservationsController.cs
│   ├── Models/Models.cs            (User, Property, Reservation, etc.)
│   ├── DTOs/DTOs.cs
│   ├── Data/AppDbContext.cs        (EF Core + seed data)
│   ├── Services/Services.cs        (JWT auth, email notifications)
│   ├── Migrations/                 (EF Core migrations)
│   └── Program.cs                  (Swagger, JWT, CORS)
│
├── messaging/                  ← Separate Messaging Web API
│   ├── Controllers/MessagesController.cs
│   ├── Models/Message.cs
│   ├── Data/MessagingDbContext.cs
│   └── Program.cs
│
└── frontend/                   ← Angular 17 (standalone components)
    └── src/app/
        ├── core/
        │   ├── models/         (TypeScript interfaces)
        │   ├── services/       (auth, property, reservation, message)
        │   └── guards/         (auth guard, JWT interceptor)
        ├── features/
        │   ├── home/           (landing + hero search)
        │   ├── auth/           (login, register)
        │   ├── properties/     (list with filters, detail with gallery)
        │   ├── owner/          (dashboard, add/edit property)
        │   ├── user/           (my reservations)
        │   └── messages/       (chat UI)
        └── shared/
            ├── navbar/
            └── property-card/
```

---

## 🎯 Features Implemented

### Renter
- [x] Register / Login / Logout (JWT)
- [x] Top-rated properties on homepage by category
- [x] Search by location, dates, property type, features, guests, price
- [x] Grid and List view toggle
- [x] Property detail with image gallery (lightbox)
- [x] Reserve a property (conflict check, total price calc)
- [x] View my reservations with status
- [x] Message the owner

### Owner
- [x] Register / Login / Logout
- [x] Add multiple properties with images
- [x] Edit / Delete properties
- [x] View all reservations for my properties
- [x] Confirm / Cancel reservation status
- [x] Email notification on new reservation (configurable)
- [x] View and reply to user messages

### Technical
- [x] Entity Framework Core (PostgreSQL / Npgsql)
- [x] ASP.NET Core MVC RESTful API
- [x] **Separate Web API for messaging** (as required)
- [x] JWT authentication
- [x] Swagger UI on both APIs
- [x] Angular Router with lazy-loaded routes
- [x] Image upload to server folder (`/uploads`)
- [x] `schema.sql` file included
- [x] Docker for easy MacBook Silicon deployment

---

## 🛑 Stopping the Project

```bash
# Stop all containers
docker compose down

# Stop AND delete all data (fresh start)
docker compose down -v
```

---

## 🔧 Troubleshooting

### Port already in use
```bash
# Find what's using port 4200
lsof -i :4200
# Kill it or change the port in docker-compose.yml
```

### Database connection errors on first start
The API retries automatically. If it fails, just restart:
```bash
docker compose restart api
```

### Frontend shows blank page
```bash
docker compose logs frontend
# If build failed, rebuild:
docker compose up --build frontend
```

### View logs for any service
```bash
docker compose logs -f api        # main API
docker compose logs -f messaging  # messaging API
docker compose logs -f frontend   # nginx/angular
docker compose logs -f postgres   # database
```

---

## 📧 Enable Email Notifications (Optional)

In `docker-compose.yml`, update the `api` service environment:

```yaml
- Email__Enabled=true
- Email__From=your-gmail@gmail.com
- Email__Password=your-app-password   # Gmail App Password
```

> Use a Gmail App Password (not your main password): https://myaccount.google.com/apppasswords

---

## 🏗️ Sprint Plan Coverage

| Sprint | Objective | Status |
|--------|-----------|--------|
| I | Use case / DB schema / ORM / Controllers | ✅ |
| II | DB context, CRUD (users + properties), Angular layouts | ✅ |
| III | Search/filter, Swagger, reservations, notifications | ✅ |
