FROM node:24-slim

ENV NODE_ENV=production
WORKDIR /app

COPY package.json ./
COPY index.html ./
COPY assets ./assets
COPY server ./server

EXPOSE 8787

CMD ["npm", "start"]
