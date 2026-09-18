import { Prisma, PrismaClient } from "@prisma/client";
import { SEEDED_DESIGNS } from "../src/lib/projects/seed-designs";

const prisma = new PrismaClient();

async function main() {
  for (const item of SEEDED_DESIGNS) {
    const existing = await prisma.project.findFirst({
      where: { name: item.design.title },
    });
    const payload = {
      name: item.design.title,
      description: item.design.summary,
      input: item.template.input as Prisma.InputJsonValue,
      design: item.design as Prisma.InputJsonValue,
    };
    if (existing) {
      await prisma.project.update({
        where: { id: existing.id },
        data: payload,
      });
    } else {
      await prisma.project.create({ data: payload });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
