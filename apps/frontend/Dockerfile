# ===== Dev Stage =====
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

# ===== Build Stage =====
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ===== Prod Stage =====
FROM nginx:stable-alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
