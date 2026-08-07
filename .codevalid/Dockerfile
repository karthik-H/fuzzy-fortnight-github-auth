FROM node:22-bookworm-slim
WORKDIR /app

# Common tooling layer (§3.2)
RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        wget \
        bash \
        netcat-openbsd \
        jq \
    && rm -rf /var/lib/apt/lists/*

# Dependency install — prefer lockfile, fall back if platform optional deps drift (§3.3)
COPY package*.json ./
RUN if [ -f package-lock.json ]; then \
      npm ci --ignore-scripts || npm install --ignore-scripts; \
    else \
      npm install --ignore-scripts; \
    fi

# Application source (brings in prisma/schema.prisma + all server code)
COPY . .

# Codegen: generate Prisma client AFTER source, BEFORE build (§3.4, §3.9a)
RUN npx prisma generate

# Build Nuxt app
RUN npm run build

ENV PORT=6713
EXPOSE 6713

COPY .codevalid/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", ".output/server/index.mjs"]
