FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine
COPY --from=build /app/dist /app/dist
CMD ["sh", "-c", "cp -r /app/dist/* /output/ && echo 'Client built to /output'"]
