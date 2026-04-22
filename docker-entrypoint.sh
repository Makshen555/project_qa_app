#!/bin/sh

echo "Esperando a que PostgreSQL inicie..."
sleep 5

echo "Generando Prisma Client..."
npx prisma generate

echo "Aplicando migraciones..."
npx prisma migrate deploy

echo "Ejecutando seed..."
node prisma/seed.js || true

echo "Iniciando aplicación..."
npm run dev