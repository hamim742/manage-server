import { seedAdmin } from "../src/app/db/seedAdmin";
import { prisma } from "../src/app/lib/prisma";

async function main() {
  await seedAdmin();
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
