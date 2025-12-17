# Base
FROM node:20-alpine AS base
WORKDIR /app

# --- Dev target (local dev) ---
FROM base AS dev
ENV NODE_ENV=development
COPY package.json package-lock.json* ./
# Prefer npm ci when lockfile exists, otherwise npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# --- Build target (static export) ---
FROM base AS build
ENV NODE_ENV=development
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Switch to production mode after installing build tooling
ENV NODE_ENV=production
COPY . .

# Build-time env baked into the static bundle
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Produces /app/out because next.config.ts has output: 'export'
RUN npm run build

# --- Prod target (nginx serves static site) ---
FROM nginx:1.25-alpine AS prod
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 80

