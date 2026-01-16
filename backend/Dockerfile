# ---------- PROD DEPS ----------
FROM node:22-alpine AS prod-deps

WORKDIR /app
RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

# ---------- BUILD ----------
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

RUN npx prisma generate
RUN yarn build

# ---------- RUN ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

CMD ["node", "dist/src/main.js"]
