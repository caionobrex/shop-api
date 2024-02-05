import { PrismaClient } from '@prisma/client';
import { UserRole } from '../src/shared/enums/userRole.enum';
import { genSaltSync, hashSync } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await prisma.userRole.create({
    data: { name: UserRole.USER }
  })
  await prisma.userRole.create({
    data: { name: UserRole.ADMIN }
  })
  const salt = genSaltSync();
  const hash = hashSync('admin', salt);
  await prisma.user.create({
    data: {
      email: 'admin@admin.com',
      name: 'Admin',
      role: { connect: { id: 2 } },
      salt,
      password: hash,
  }})
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
