FROM node:18-alpine

RUN apk add --no-cache openssl

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

RUN echo "JWT_SECRET=$(openssl rand -base64 32 | tr -d '\n')" > .env

# USER node
EXPOSE 3000
CMD ["npm", "run", "start"]