# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm ci || npm install
COPY . .
RUN npm run build

# Runtime stage
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html
RUN apk add --no-cache gettext
COPY --from=build /app/dist/ ./
COPY public/config.template.js /docker-entrypoint.d/config.template.js
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/entrypoint.sh /docker-entrypoint.d/50-config.sh
RUN chmod +x /docker-entrypoint.d/50-config.sh
ENV API_BASE_URL="http://localhost:8080"
EXPOSE 80
