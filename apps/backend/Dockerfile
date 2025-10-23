# ===== Dev Stage =====
FROM node:20-alpine
WORKDIR /app

# We're having a problem of hoisting here, when isolated, backend contaienr can't detect hoisted packages, therefore leading to an import error
# Here, we're building from the root, check docker-compose.yml for context
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/

RUN npm install --workspace backend --include-workspace-root

COPY backend ./backend
COPY shared ./shared

WORKDIR /app/backend
CMD ["npm", "run", "start:dev"]


# ===== Prod Stage =====
FROM node:20-alpine AS prod
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
EXPOSE 4000
CMD ["npm", "run", "start:prod"]
