FROM node:20-alpine

WORKDIR /app

RUN apk add --update --no-cache \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    pango-dev \
    giflib-dev \
    python3 \
    py3-setuptools \
    py3-pip \
    font-dejavu

COPY package*.json ./

RUN npm ci 

COPY . .

CMD ["npm", "start"]
