FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg62-turbo-dev \
    libgif-dev \
    librsvg2-dev \
    python3 \
    make \
    g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY patches ./patches
RUN npm install --omit=dev \
  && npm install --omit=dev --no-save canvas@2.11.2

COPY app.js ./

EXPOSE 3007

CMD ["npm", "start"]
