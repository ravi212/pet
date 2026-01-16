# ---------- BUILD STAGE ----------
FROM node:22-alpine AS builder

WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build --configuration production

# ---------- RUN STAGE ----------
FROM nginx:alpine

COPY --from=builder /app/dist/pet-web/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]
