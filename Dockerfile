FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY patches ./patches
RUN npm install --omit=dev

COPY app.js ./

EXPOSE 3007

CMD ["npm", "start"]
