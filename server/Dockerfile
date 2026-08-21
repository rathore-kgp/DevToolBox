# ── Base image ────────────────────────────────────────────────────────────
# "alpine" images are small, stripped-down Linux builds. We don't need a full
# OS just to run Node — smaller image = faster pulls/builds and a smaller
# attack surface. node:22-alpine gives us Node 22 (current LTS) on Alpine.
FROM node:22-alpine

# Everything from here on happens inside /app in the image's filesystem.
WORKDIR /app

# ── Install dependencies first, copy code second ────────────────────────
# This ordering is the single most important Docker trick for Node/JS apps.
# Docker caches each instruction (layer) and only re-runs a layer if the
# files it depends on changed. package.json/package-lock.json change rarely;
# your source code changes constantly. By copying just the manifest files
# and installing first, Docker can reuse the cached "npm ci" layer on every
# rebuild where you only edited a .js file — turning a 30s install into 0s.
COPY package*.json ./
RUN npm ci --omit=dev

# Now copy the rest of the source code.
COPY . .

# Sets a default env var baked into the image. Anything supplied at
# `docker run`/compose time (we'll do this via env_file) overrides this —
# so this is just a safe fallback, not the real production switch.
ENV NODE_ENV=production

# Purely documentation for humans/tools reading this file — it does NOT
# actually publish the port. The real port mapping happens in
# docker-compose.yml with "ports:".
EXPOSE 5000

# Alpine's node image ships a low-privilege "node" user out of the box.
# Running as root inside a container is bad practice: if an attacker ever
# breaks out of your app code, root-in-container is a much bigger problem
# than a limited user. This costs nothing to switch on, so we do it.
USER node

# Periodically asks the container "are you actually healthy?" by hitting
# your own /api/health route. `docker ps` and `docker compose ps` will then
# show "healthy"/"unhealthy" instead of just "running" — running isn't the
# same as working (e.g. the process could be up but stuck / DB unreachable).
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

# The command that actually starts the app when the container launches.
CMD ["node", "server.js"]
