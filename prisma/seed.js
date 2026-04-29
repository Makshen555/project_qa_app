import prisma from "../src/config/db.js";
import bcrypt from "bcrypt";

async function main() {
  const superadminRole = await prisma.role.upsert({
    where: { name: "SUPERADMIN" },
    update: {},
    create: { name: "SUPERADMIN" }
  });

  await prisma.role.upsert({
    where: { name: "AUDITOR" },
    update: {},
    create: { name: "AUDITOR" }
  });

  await prisma.role.upsert({
    where: { name: "REGISTRADOR" },
    update: {},
    create: { name: "REGISTRADOR" }
  });

  const adminEmail = "admin@test.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("Admin123*", 12);

    await prisma.user.create({
      data: {
        username: "admin",
        email: adminEmail,
        password: hashedPassword,
        roleId: superadminRole.id
      }
    });

    console.log("Usuario admin creado");
  } else {
    console.log("Usuario admin ya existe");
  }

  console.log("Seed completado");
}

main()
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });