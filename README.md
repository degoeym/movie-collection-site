# Movie Collection

Backend: ASP.NET Core minimal API + PostgreSQL
Frontend: React (Vite + TS) + Bootstrap

Run all services with Docker:

```bash
docker compose up --build
```

Services:
- API: http://localhost:8080 (Swagger at /swagger)
- Frontend: http://localhost:5173

Run backend locally (requires Postgres running via compose):

```bash
docker compose up -d movie-collection-db
dotnet run --project backend/MovieCollection
```

Run frontend locally:

```bash
cd frontend
npm install
VITE_API_BASE_URL=http://localhost:8080 npm run dev
```
