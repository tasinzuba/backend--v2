"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("🌱 Seeding database...");
    // Create Categories (Upsert logic to avoid duplicates)
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { name: "Pain Relief" },
            update: {},
            create: { name: "Pain Relief", description: "Painkillers and analgesics" },
        }),
        prisma.category.upsert({
            where: { name: "Cold & Flu" },
            update: {},
            create: { name: "Cold & Flu", description: "Cough syrups and cold medicines" },
        }),
        prisma.category.upsert({
            where: { name: "Vitamins" },
            update: {},
            create: { name: "Vitamins", description: "Supplements and vitamins" },
        }),
        prisma.category.upsert({
            where: { name: "First Aid" },
            update: {},
            create: { name: "First Aid", description: "Bandages, antiseptics, etc." },
        }),
    ]);
    console.log(`✅ Created ${categories.length} categories`);
    // Note: We cannot create users with password hashes here easily due to Better Auth.
    // Users should register via the API or Frontend to get proper password hashing.
    console.log("\n⚠️ IMPORTANT:");
    console.log("Better Auth handles password hashing internally.");
    console.log("Please REGISTER the Admin and Seller users via the API or Frontend:");
    console.log("1. Admin: admin@medistore.com (Manually update role to ADMIN in DB after register)");
    console.log("2. Seller: seller@medistore.com (Register as SELLER)");
    console.log("\n✨ Database seeding completed!");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map