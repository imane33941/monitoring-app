FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

# Copie tout le monorepo depuis la racine
COPY pnpm-workspace.yaml .
COPY pnpm-lock.yaml .
COPY .npmrc .
COPY package.json .
COPY packages/ packages/
COPY server/ server/
COPY client/ client/

RUN pnpm install --frozen-lockfile
RUN pnpm run build:full

WORKDIR /app/server

EXPOSE 3001

CMD ["node", "dist/main"]
