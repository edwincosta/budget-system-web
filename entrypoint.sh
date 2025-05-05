#!/bin/sh

if [ "$DEPLOY_ENV" = "development" ]; then
  echo "Starting server in development mode..."
  # Comando para iniciar o servidor em modo de desenvolvimento
  npm run dev
elif [ "$DEPLOY_ENV" = "production" ]; then
  echo "Starting server in production mode..."
  # Comando para iniciar o servidor em modo de produção
  npm run preview
else
  echo "Unknown DEPLOY_ENV: $DEPLOY_ENV"
  exit 1
fi
