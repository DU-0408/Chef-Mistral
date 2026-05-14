FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./

RUN npm ci

# Copy project
COPY . .

# Build Next.js app
RUN npm run build

# Copy standalone static assets
RUN cp -r .next/static .next/standalone/.next/static

# Copy public assets if present
RUN cp -r public .next/standalone/public || true

EXPOSE 3000

# Run standalone server
CMD ["node", ".next/standalone/server.js"]