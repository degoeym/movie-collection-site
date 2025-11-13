# Movie Collection Frontend

React + Vite + TypeScript app styled with Bootstrap.

Config: API base URL is read from `window.__APP_CONFIG__.API_BASE_URL`. In dev, set VITE_API_BASE_URL or it defaults to http://localhost:8080.

Local dev:

```bash
npm install
npm run dev
```

Build & preview:

```bash
npm run build
npm run preview
```

Testing (Vitest + Testing Library):

```bash
npm test
```

- Unit, component, and integration tests live under `frontend/tests`, mirroring the `src` structure.
- Run with `npm test -- --coverage` to generate coverage reports in `frontend/coverage`.

Docker build:

```bash
docker build -t movie-collection-frontend:dev ./frontend
docker run --rm -p 5173:80 -e API_BASE_URL=http://localhost:8080 movie-collection-frontend:dev
```
