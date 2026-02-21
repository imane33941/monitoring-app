FROM node:20-alpine

WORKDIR /app

# Installe pnpm
RUN npm install -g pnpm

# Copie tout le monorepo
COPY . .

# Install + build
RUN pnpm install --frozen-lockfile
RUN pnpm run build:full

WORKDIR /app/server

EXPOSE 3001

CMD ["node", "dist/main"]
