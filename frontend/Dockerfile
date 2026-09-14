# Etapa 1: Construcción (Build) de la SPA con Vite
FROM node:20-alpine AS build

WORKDIR /app

# Argumento para URL de la API (por defecto utiliza /api a través del proxy Nginx)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Copiar paquetes e instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar código y compilar la aplicación
COPY . .
RUN npm run build

# Etapa 2: Servidor Nginx para producción
FROM nginx:alpine

# Copiar los archivos compilados de la etapa de build
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto HTTP 80
EXPOSE 80

# Iniciar servidor Nginx
CMD ["nginx", "-g", "daemon off;"]
