import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@mail.com";
  await prisma.project.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "ojt",
    },
  });
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "system admin",
      email: adminEmail,
      password: await hash("sys@dm1n", 10),
      role: "rootadmin",
      project_id: 1,
    },
  });
  console.info("seeding completed!");
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
