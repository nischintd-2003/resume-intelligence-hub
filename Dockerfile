FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# --------------------------------------------------------
FROM base AS builder
WORKDIR /app
RUN npm install -g turbo
COPY . .
ARG APP_NAME
RUN turbo prune ${APP_NAME} --docker


# --------------------------------------------------------
FROM base AS installer
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
COPY --from=builder /app/out/full/ .
COPY turbo.json tsconfig.base.json ./
ARG APP_NAME
RUN pnpm turbo run build --filter=${APP_NAME}

# --------------------------------------------------------
FROM base AS runner
WORKDIR /app
COPY --from=installer /app .

ARG APP_NAME
ENV APP_NAME=${APP_NAME}
ENV NODE_ENV=production


CMD pnpm --filter ${APP_NAME} start