# ── MULTI-STAGE BUILD ────────────────────────────────────────────────────
# A React/Vite app isn't actually "run" in production — `npm run build`
# compiles all your .jsx into plain static HTML/CSS/JS files (the "dist"
# folder), and THOSE static files are what gets served. Node/npm/Vite are
# only needed to produce that dist folder — they have no job at runtime.
#
# So we build in TWO stages:
#   Stage 1 ("build"): a full Node environment that compiles the app.
#   Stage 2: a tiny nginx web server that just serves the finished files.
# Only stage 2 ships as your final image — stage 1 (Node, all your
# node_modules, source files) is thrown away after the build finishes.
# This keeps the final image small (tens of MB instead of ~1GB+ with all
# of Node and node_modules sitting in it uselessly).

# ── Stage 1: build the static files ─────────────────────────────────────
# Using "slim" (Debian-based, glibc) instead of "alpine" (musl) specifically
# here: your Tailwind v4 toolchain (lightningcss) needs a native binary, and
# Alpine's musl C library often lacks a pre-built one for these packages,
# forcing a slower WASM fallback that also requires extra packages your
# lockfile (generated on Windows) doesn't know about. Debian's glibc avoids
# that entirely. This ONLY affects this throwaway build stage — the final
# image below still uses tiny nginx:alpine, so final image size is unchanged.
FROM node:22-slim AS build
WORKDIR /app

# Same caching trick as the server: deps first, source second.
COPY package*.json ./
RUN npm ci

COPY . .

# Vite bakes any VITE_-prefixed env var directly into the compiled
# JavaScript bundle AT BUILD TIME (that's what import.meta.env.VITE_API_URL
# resolves to in your code). This is fundamentally different from the
# server, where process.env.MONGO_URI is read fresh every time the app
# starts. Because of that, this value can't be supplied later with
# docker-compose's "environment:" — by the time the container runs, the
# JS is already compiled and frozen. It has to be passed in as a build
# ARG, at image-build time.
#
# Default matches the fallback already in your own code
# (axiosInstance.js / SocketContext.jsx), so it works even if nobody
# overrides it.
ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Stage 2: serve the static files with nginx ──────────────────────────
# nginx is a lightweight, battle-tested web server — much better suited to
# serving static files than running them through Node/Vite's dev server,
# which is not meant for production use.
FROM nginx:1.27-alpine

# Copy ONLY the compiled output from stage 1 (nothing else from that
# stage — no node_modules, no source — makes it into this final image).
COPY --from=build /app/dist /usr/share/nginx/html

# Our custom config (see nginx.conf) replaces nginx's default site so
# client-side routing (React Router) works correctly.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

# nginx normally daemonizes (forks into the background) by default, which
# would make Docker think the container exited immediately. "daemon off"
# keeps it running in the foreground, which is what a container needs.
CMD ["nginx", "-g", "daemon off;"]
