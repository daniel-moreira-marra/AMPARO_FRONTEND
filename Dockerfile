# Estágio 1: Build (Node.js)
FROM node:20-alpine AS build
WORKDIR /app

# Instalamos as dependências primeiro para aproveitar o cache do Docker
COPY package*.json ./
RUN npm install

# Copiamos o código e geramos a pasta /dist (ou /build)
COPY . .
RUN npm run build

# Estágio 2: Produção (Nginx)
FROM nginx:stable-alpine
# Copiamos os arquivos estáticos gerados no estágio anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Copiamos nossa configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]