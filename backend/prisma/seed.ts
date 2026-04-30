// prisma/seed.ts - Seed inicial do banco
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário de teste
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'teste@example.com' },
    update: {},
    create: {
      email: 'teste@example.com',
      username: 'testeuser',
      firstName: 'Teste',
      lastName: 'User',
      password: hashedPassword,
      emailVerified: true,
      latitude: -23.5505,
      longitude: -46.6333,
    },
  });

  console.log('✅ Usuário criado:', user.email);

  // Criar alguns estabelecimentos de exemplo
  const establishments = [
    {
      name: 'Café Gourmet São Paulo',
      category: 'Café',
      latitude: -23.5505,
      longitude: -46.6333,
      address: 'Av. Paulista, 1000',
      cityName: 'São Paulo',
      sourceApi: 'manual',
    },
    {
      name: 'Restaurante Italiano',
      category: 'Restaurante',
      latitude: -23.5506,
      longitude: -46.6334,
      address: 'Rua Augusta, 500',
      cityName: 'São Paulo',
      sourceApi: 'manual',
    },
  ];

  for (const est of establishments) {
    await prisma.establishment.create({
      data: {
        ...est,
        owner: { connect: { id: user.id } },
      },
    });
  }

  console.log('✅ Estabelecimentos criados');

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
