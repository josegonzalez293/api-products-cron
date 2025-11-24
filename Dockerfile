FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY dist ./dist
COPY .env ./

ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/main.js"]
