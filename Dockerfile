# Use a imagem base oficial do Node.js
FROM node:23-slim

ARG DEPLOY_ENV

ENV DEPLOY_ENV=${DEPLOY_ENV}

# Defina o diretório de trabalho
WORKDIR /app

# Copie os arquivos de configuração do projeto
COPY *.json ./

# Instale as dependências
RUN npm install

COPY *.html *.ts *.js ./
COPY src ./src
COPY public ./public

# Copiar o script de entrada para o contêiner
COPY entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

# Defina o comando de entrada
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

