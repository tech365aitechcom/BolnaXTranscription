# =========================
# Build stage
# =========================
FROM node:20-bullseye AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# =========================
# Runtime stage
# =========================
FROM node:20-bullseye
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/package*.json ./
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/next.config.js ./

# 👇 only copy public if it exists (Docker ignores missing via .dockerignore approach)
# (or just remove this line entirely)
# COPY --from=build /app/public ./public

EXPOSE 3000
CMD ["npm", "run", "start"]
