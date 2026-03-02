# ── Build ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY tsconfig.json next.config.ts postcss.config.mjs tailwind.config.ts ./
COPY src ./src/

# Variáveis necessárias em build-time
ARG API_URL
ARG API_KEY
ENV API_URL=$API_URL
ENV API_KEY=$API_KEY

RUN npm run build

# ── Production ────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Next.js standalone output não é usado aqui; copiamos o build completo
COPY --from=builder /app/package.json /app/package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/postcss.config.mjs ./
COPY --from=builder /app/tailwind.config.ts ./

EXPOSE 3000

CMD ["npm", "start"]
