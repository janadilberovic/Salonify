# Salonify

Salonify is a full-stack web application for discovering beauty salons, booking appointments and leaving reviews — with a content-based recommendation engine that suggests salons based on each user's preferences and in-app activity.

Built as a bachelor's thesis project.

## Features

- **Salon discovery** — browse and search salons by name, city and services, with photo galleries and public salon profiles
- **Appointment booking** — real-time availability checking with conflict detection, working-hours support and a full reservation lifecycle (pending → approved / rejected → completed / cancelled)
- **Reviews & ratings** — users can review salons after a completed appointment; average ratings are aggregated per salon
- **Personalized recommendations** — a content-based filtering engine models user preferences as feature vectors, tracks activity (searches, views, bookings, reviews) and ranks salons by cosine similarity, including an explainable "why recommended" reason
- **Salon owner dashboard** — manage services (with images and pricing), working hours, salon profile and incoming appointment requests
- **Admin panel** — dashboard with system-wide statistics, user and salon management with cascade deletion, and review moderation
- **Authentication & authorization** — JWT-based auth with three roles: `User`, `Salon` and `Admin`

## Tech stack

| Layer | Technology |
|---|---|
| Backend | ASP.NET Core 8 (REST API), MongoDB, JWT Bearer auth, Swagger |
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS |
| Tests | xUnit |

## Project structure

```
├── Salonify.Api/                  # ASP.NET Core REST API
│   ├── controllers/               # Auth, Salon, Appointment, Review, Recommendation, User, Admin
│   ├── services/                  # Recommendation engine, JWT, activity tracking, admin seeding
│   ├── repositories/              # MongoDB data access
│   ├── models/                    # Domain models
│   ├── dtos/                      # Request/response DTOs
│   └── helpers/                   # Slug generation, activity weights, stats
├── Salonify.Api.Tests/            # xUnit unit tests
└── SalonifyFrontend/
    └── salonifyfrontend/          # Next.js application
```

## Getting started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) 20+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally (default: `mongodb://localhost:27017`)

### 1. Backend configuration

Secrets are kept out of source control via [.NET user secrets](https://learn.microsoft.com/aspnet/core/security/app-secrets). Configure them once:

```bash
dotnet user-secrets set "MongoDbSettings:ConnectionString" "mongodb://localhost:27017" --project Salonify.Api
dotnet user-secrets set "Jwt:Key" "<your-jwt-signing-key-min-32-chars>" --project Salonify.Api
dotnet user-secrets set "Admin:Password" "<your-admin-password>" --project Salonify.Api
```

On first run the API seeds an admin account using `Admin:Email` from `appsettings.json` and `Admin:Password` from user secrets.

### 2. Run the backend

```bash
dotnet run --project Salonify.Api
```

The API starts at `http://localhost:5199` with Swagger UI at `http://localhost:5199/swagger`.

### 3. Run the frontend

```bash
cd SalonifyFrontend/salonifyfrontend
npm install
npm run dev
```

The app starts at `http://localhost:3000` (the API URL is configured via `NEXT_PUBLIC_API_URL` in `.env`).

### 4. Run the tests

```bash
dotnet test
```

Unit tests cover the recommendation engine core (cosine similarity, feature vectors, normalization, recommendation reasons), JWT token generation, admin statistics aggregation and helper utilities.

## How recommendations work

1. Every salon gets a **feature vector** built from its services (grouped by service type, saturating at 3 services per type).
2. Every user gets a **preference vector** updated by weighted activity — searching, viewing salons/services, booking, completing appointments and leaving reviews each contribute differently.
3. Recommendations rank salons by **cosine similarity** between the two vectors, and each suggestion carries an explanation (which service type matched and which activity triggered it).

## Roles

| Role | Capabilities |
|---|---|
| `User` | Browse salons, book appointments, leave reviews, get recommendations |
| `Salon` | Manage salon profile, services, working hours and appointment requests |
| `Admin` | System statistics, user/salon management, review moderation, maintenance jobs |
