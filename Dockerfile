# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY app/package*.json ./
RUN npm ci --only=production

COPY app/ ./

EXPOSE 5000

CMD ["node", "server.js"]
