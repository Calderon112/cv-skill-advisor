# CyberCareer — IT Security Job Advisor
#
# The app has no build step: the frontend is plain HTML/CSS/JS served by the Node
# backend. So this is a single stage; only the dependency install is cached.
#
#   docker build -t cybercareer .
#   docker run -p 3000:3000 -v cybercareer-data:/app/data cybercareer

# Debian slim, not Alpine: npm 10 on musl aborts `npm ci` with "Exit handler never
# called!" yet still exits 0, producing an image whose node_modules is empty.
FROM node:20-slim

WORKDIR /app

# Escape hatch for developers behind a TLS-intercepting proxy or antivirus, where
# npm cannot verify the registry certificate (UNABLE_TO_VERIFY_LEAF_SIGNATURE):
#   docker build --build-arg NPM_CONFIG_STRICT_SSL=false -t cybercareer .
# Verification stays on by default. Prefer NODE_EXTRA_CA_CERTS with your corporate
# root CA when you have it.
ARG NPM_CONFIG_STRICT_SSL=true

# Install production dependencies first so this layer is reused whenever only the
# application sources change. Playwright is a devDependency and is skipped here,
# which also avoids pulling its browser binaries into the image.
#
# The resolve check is not redundant: npm 10 can fail to download every tarball and
# still exit 0 ("Exit handler never called!"), which would ship an image whose
# node_modules is an empty skeleton. Fail the build instead.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund \
 && node -e "require.resolve('@langchain/langgraph'); require.resolve('pdf-parse')"

COPY . .

# Writable state lives on a volume: the local user database, the RAG embedding
# cache and the LLM usage counters. Keeping it out of /app means `docker build`
# never bakes a user's data into the image.
ENV STORAGE_FILE=/app/data/storage.json \
    EMBED_CACHE_FILE=/app/data/.embeddings-cache.json \
    USAGE_STATS_FILE=/app/data/.usage-stats.json \
    CAREER_CACHE_FILE=/app/data/.career-paths.json \
    NODE_ENV=production \
    PORT=3000

RUN mkdir -p /app/data && chown -R node:node /app/data
USER node

VOLUME ["/app/data"]
EXPOSE 3000

# /api/status needs neither a key nor a session, so it is a true liveness probe.
# Probed with node itself: the slim image ships no curl or wget.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/api/status',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
