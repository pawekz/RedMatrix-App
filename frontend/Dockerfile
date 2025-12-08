FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps --registry https://registry.npmjs.org/ --maxsockets 3
COPY . .

# Set production environment variable for build - use ARG to accept build-time variables
#ARG VITE_API_BASE_URL=https://servit-backendv2-b6arhyfsadg4fbhc.southeastasia-01.azurewebsites.net
#ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Debug: Print the environment variable to verify it's set
#RUN echo "Building with VITE_API_BASE_URL: $VITE_API_BASE_URL"

RUN npm run build

# Production stage: serve static files via Nginx
FROM nginx:alpine
# Non-root listen port for Azure App Service
ENV WEBSITES_PORT=8080
# Copy our nginx config and site
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
# Drop any unneeded default files (optional hardening)
RUN rm -f /etc/nginx/conf.d/default.conf.default 2>/dev/null || true
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
