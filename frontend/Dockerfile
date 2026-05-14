FROM node:20-alpine

WORKDIR /app

# Build-time backend URL
ARG BACKEND_URL

# Make available to Next.js build
ENV BACKEND_URL=$BACKEND_URL

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN cp -r .next/static .next/standalone/.next/static
RUN cp -r public .next/standalone/public || true

EXPOSE 3000

CMD ["node", ".next/standalone/server.js"]