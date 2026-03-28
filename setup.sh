#!/bin/bash

# Meu Agito - Setup Script
# Este script configura o ambiente completo

set -e

echo "🚀 Iniciando setup do Meu Agito..."

# ============ VERIFICAÇÕES ============
echo ""
echo "📋 Verificando pré-requisitos..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale em https://nodejs.org"
    exit 1
fi
echo "✅ Node.js $(node --version)"

if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker não encontrado. Instale em https://docker.com (opcional)"
else
    echo "✅ Docker encontrado"
fi

# ============ SETUP BACKEND ============
echo ""
echo "📦 Setup Backend..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "Instalando dependências..."
    npm install
else
    echo "✅ Dependências já instaladas"
fi

if [ ! -f ".env" ]; then
    echo "⚠️  .env não encontrado. Copiar .env.example"
    cp .env.example .env 2>/dev/null || echo "Criar .env manualmente"
fi

echo "Gerando Prisma client..."
npm run prisma:generate

echo "Aplicando migrations..."
npm run prisma:migrate || echo "⚠️  Migrations falharam (verifique DATABASE_URL)"

echo "✅ Backend configurado!"

# ============ SETUP FRONTEND ============
echo ""
echo "📱 Setup Frontend..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "Instalando dependências..."
    npm install
else
    echo "✅ Dependências já instaladas"
fi

if [ ! -f ".env" ]; then
    echo "⚠️  .env não encontrado. Criar .env com:"
    echo "EXPO_PUBLIC_API_URL=http://localhost:3001"
    echo "EXPO_PUBLIC_APP_NAME=Meu Agito"
fi

echo "✅ Frontend configurado!"

# ============ FINAL ============
echo ""
echo "🎉 Setup completo!"
echo ""
echo "Para começar:"
echo "1. Backend:"
echo "   cd backend && npm run start:dev"
echo ""
echo "2. Frontend (em outro terminal):"
echo "   cd frontend && npm start"
echo ""
echo "3. Documentação:"
echo "   ../doc vitrini/00_ÍNDICE_COMPLETO.md"
echo ""
echo "📚 Mais informações: README.md"
