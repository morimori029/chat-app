FROM node:20-slim
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl dos2unix && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci
COPY . .
RUN dos2unix start.sh
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["sh", "start.sh"]
