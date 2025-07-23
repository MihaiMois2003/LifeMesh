const { PrismaClient } = require("@prisma/client");

async function test() {
  const prisma = new PrismaClient();

  try {
    console.log("Testing connection...");
    await prisma.$connect();
    console.log("✅ Connected successfully!");

    // Count tables
    const userCount = await prisma.user.count();
    console.log(`📊 Users in database: ${userCount}`);
    console.log("✅ Database is working!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
