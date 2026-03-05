FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --include=optional
RUN npm install @rollup/rollup-linux-arm64-gnu --no-save || true
RUN npm install @rollup/rollup-linux-x64-gnu --no-save || true
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime
RUN apk add --no-cache gettext
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
