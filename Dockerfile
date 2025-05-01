# Use a imagem base oficial do Node.js
FROM nginx:alpine

# Defina o diretório de trabalho
WORKDIR /app

# Copie os arquivos de configuração
COPY package.json package-lock.json ./

# Instale as dependências
RUN npm install
# Copie o código fonte
COPY src ./src
COPY public ./public
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY tsconfig.app.json ./
COPY .env ./
COPY vite.config.ts ./
COPY README.md ./
COPY index.html ./
COPY eslint.config.js ./

# Compile o projeto
RUN npm run build

# Copie os arquivos compilados para o diretório do Nginx
COPY dist /usr/share/nginx/html

# Exponha a porta 80
EXPOSE 80

