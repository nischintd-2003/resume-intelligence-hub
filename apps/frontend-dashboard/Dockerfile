FROM node:20-alpine AS pruner
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && npm install -g turbo

WORKDIR /app
COPY . .
RUN turbo prune frontend-dashboard --docker

FROM node:20-alpine AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
COPY turbo.json tsconfig.base.json ./

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN pnpm turbo run build --filter=frontend-dashboard

FROM nginx:alpine AS runner

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/apps/frontend-dashboard/dist /usr/share/nginx/html

COPY apps/frontend-dashboard/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
