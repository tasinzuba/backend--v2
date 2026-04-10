import { PrismaClient } from "@prisma/client";
import { scryptSync, randomBytes } from "crypto";

const prisma = new PrismaClient();

// Better-auth compatible password hash (scrypt)
function hashPassword(password: string): string {
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
}

async function main() {
    console.log("🌱 Seeding MediStore database...\n");

    // ===================== USERS =====================
    console.log("👤 Creating users...");

    const adminUser = await prisma.user.upsert({
        where: { email: "admin@medistore.com" },
        update: { role: "ADMIN" },
        create: {
            name: "Admin User",
            email: "admin@medistore.com",
            emailVerified: true,
            role: "ADMIN",
            status: "ACTIVE",
            phone: "+880 1700000001",
        },
    });

    const sellerUser = await prisma.user.upsert({
        where: { email: "seller@medistore.com" },
        update: { role: "SELLER" },
        create: {
            name: "MediCare Pharmacy",
            email: "seller@medistore.com",
            emailVerified: true,
            role: "SELLER",
            status: "ACTIVE",
            phone: "+880 1700000002",
        },
    });

    const seller2 = await prisma.user.upsert({
        where: { email: "seller2@medistore.com" },
        update: { role: "SELLER" },
        create: {
            name: "HealthPlus Store",
            email: "seller2@medistore.com",
            emailVerified: true,
            role: "SELLER",
            status: "ACTIVE",
            phone: "+880 1700000005",
        },
    });

    const customerUser = await prisma.user.upsert({
        where: { email: "customer@medistore.com" },
        update: {},
        create: {
            name: "Rafiq Ahmed",
            email: "customer@medistore.com",
            emailVerified: true,
            role: "CUSTOMER",
            status: "ACTIVE",
            phone: "+880 1700000003",
        },
    });

    const customer2 = await prisma.user.upsert({
        where: { email: "customer2@medistore.com" },
        update: {},
        create: {
            name: "Fatima Begum",
            email: "customer2@medistore.com",
            emailVerified: true,
            role: "CUSTOMER",
            status: "ACTIVE",
            phone: "+880 1700000004",
        },
    });

    const managerUser = await prisma.user.upsert({
        where: { email: "manager@medistore.com" },
        update: { role: "MANAGER" },
        create: {
            name: "Karim Hossain",
            email: "manager@medistore.com",
            emailVerified: true,
            role: "MANAGER",
            status: "ACTIVE",
            phone: "+880 1700000006",
        },
    });

    const pharmacistUser = await prisma.user.upsert({
        where: { email: "pharmacist@medistore.com" },
        update: { role: "PHARMACIST" },
        create: {
            name: "Dr. Nusrat Jahan",
            email: "pharmacist@medistore.com",
            emailVerified: true,
            role: "PHARMACIST",
            status: "ACTIVE",
            phone: "+880 1700000007",
        },
    });

    // Create accounts with hashed passwords (better-auth compatible)
    const defaultPassword = hashPassword("password123");
    const adminPassword = hashPassword("admin123");

    for (const user of [adminUser, sellerUser, seller2, customerUser, customer2, managerUser, pharmacistUser]) {
        await prisma.account.upsert({
            where: {
                id: `account-${user.id}`,
            },
            update: {
                password: user.email === "admin@medistore.com" ? adminPassword : defaultPassword,
            },
            create: {
                id: `account-${user.id}`,
                userId: user.id,
                accountId: user.id,
                providerId: "credential",
                password: user.email === "admin@medistore.com" ? adminPassword : defaultPassword,
            },
        });
    }

    console.log("  ✅ Admin: admin@medistore.com / admin123");
    console.log("  ✅ Seller: seller@medistore.com / password123");
    console.log("  ✅ Seller 2: seller2@medistore.com / password123");
    console.log("  ✅ Customer: customer@medistore.com / password123");
    console.log("  ✅ Customer 2: customer2@medistore.com / password123");
    console.log("  ✅ Manager: manager@medistore.com / password123");
    console.log("  ✅ Pharmacist: pharmacist@medistore.com / password123");

    // ===================== CATEGORIES =====================
    console.log("\n📂 Creating categories...");

    const catData = [
        { name: "Pain Relief", description: "Painkillers, analgesics, and anti-inflammatory medicines for headaches, body pain, and fever relief.", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80" },
        { name: "Cold & Flu", description: "Cough syrups, decongestants, and cold medicines to fight seasonal infections and allergies.", image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&q=80" },
        { name: "Vitamins & Supplements", description: "Daily vitamins, minerals, and health supplements for immunity and overall wellness.", image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80" },
        { name: "First Aid", description: "Bandages, antiseptics, wound care products, and emergency medical supplies.", image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400&q=80" },
        { name: "Skin Care", description: "Dermatological creams, lotions, sunscreens, and skin treatment products.", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80" },
        { name: "Digestive Health", description: "Antacids, probiotics, and digestive aids for stomach and gut health.", image: "https://images.unsplash.com/photo-1559757175-7cb057fba93c?w=400&q=80" },
    ];

    const categories = [];
    for (const cat of catData) {
        const c = await prisma.category.upsert({
            where: { name: cat.name },
            update: { description: cat.description, image: cat.image },
            create: cat,
        });
        categories.push(c);
    }
    console.log(`  ✅ Created ${categories.length} categories`);

    // ===================== MEDICINES =====================
    console.log("\n💊 Creating medicines...");

    const medicineData = [
        // Pain Relief
        { name: "Napa Extra 500mg", description: "Fast-acting paracetamol tablet for headache, fever, and body pain. Each tablet contains 500mg paracetamol with caffeine for enhanced relief.", price: 35, stock: 150, categoryIdx: 0, seller: sellerUser.id, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80" },
        { name: "Ibuprofen 400mg", description: "Non-steroidal anti-inflammatory drug for pain, swelling, and fever. Suitable for muscle pain, toothache, and menstrual cramps.", price: 45, stock: 200, categoryIdx: 0, seller: sellerUser.id, image: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&q=80" },
        { name: "Aspirin 75mg", description: "Low-dose aspirin for pain relief and cardiovascular health. Helps prevent blood clots and reduce inflammation.", price: 25, stock: 300, categoryIdx: 0, seller: seller2.id, image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&q=80" },
        { name: "Diclofenac Sodium 50mg", description: "Strong anti-inflammatory and pain relief tablet. Effective for arthritis, sprains, and post-operative pain.", price: 55, stock: 120, categoryIdx: 0, seller: seller2.id, image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&q=80" },

        // Cold & Flu
        { name: "Tussin DM Cough Syrup", description: "Dextromethorphan-based cough suppressant with guaifenesin expectorant. Relieves dry and productive cough.", price: 120, stock: 80, categoryIdx: 1, seller: sellerUser.id, image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&q=80" },
        { name: "Cetirizine 10mg", description: "Antihistamine for allergic rhinitis, hay fever, and urticaria. Provides 24-hour relief from sneezing and runny nose.", price: 30, stock: 250, categoryIdx: 1, seller: sellerUser.id, image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&q=80" },
        { name: "Nasal Spray Decongestant", description: "Oxymetazoline nasal spray for instant relief from nasal congestion. Works within minutes for up to 12 hours.", price: 85, stock: 60, categoryIdx: 1, seller: seller2.id, image: "https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=400&q=80" },

        // Vitamins
        { name: "Vitamin C 1000mg", description: "High-potency vitamin C supplement for immune system support. With rose hips and bioflavonoids for better absorption.", price: 250, stock: 100, categoryIdx: 2, seller: sellerUser.id, image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80" },
        { name: "Multivitamin Daily", description: "Complete daily multivitamin with 23 essential vitamins and minerals. Supports energy, immunity, and overall health.", price: 350, stock: 75, categoryIdx: 2, seller: sellerUser.id, image: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&q=80" },
        { name: "Calcium + Vitamin D3", description: "Calcium carbonate 600mg with Vitamin D3 400IU for strong bones and teeth. Essential for women and elderly.", price: 180, stock: 90, categoryIdx: 2, seller: seller2.id, image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&q=80" },
        { name: "Omega-3 Fish Oil", description: "Premium fish oil capsules with EPA and DHA. Supports heart health, brain function, and joint flexibility.", price: 450, stock: 50, categoryIdx: 2, seller: seller2.id, image: "https://images.unsplash.com/photo-1577401239170-897c3b tried?w=400&q=80" },

        // First Aid
        { name: "Antiseptic Solution 100ml", description: "Povidone-iodine antiseptic solution for wound cleaning and disinfection. Kills 99.9% of germs on contact.", price: 65, stock: 180, categoryIdx: 3, seller: sellerUser.id, image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400&q=80" },
        { name: "Sterile Bandage Roll", description: "Medical-grade cotton bandage roll for wound dressing and support. Breathable and hypoallergenic material.", price: 40, stock: 300, categoryIdx: 3, seller: seller2.id, image: "https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=400&q=80" },

        // Skin Care
        { name: "Sunscreen SPF 50+", description: "Broad-spectrum UVA/UVB protection sunscreen lotion. Water-resistant formula suitable for all skin types.", price: 320, stock: 65, categoryIdx: 4, seller: sellerUser.id, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80" },
        { name: "Moisturizing Cream 100g", description: "Intensive hydrating cream with hyaluronic acid and ceramides. Repairs dry and damaged skin barrier.", price: 280, stock: 85, categoryIdx: 4, seller: seller2.id, image: "https://images.unsplash.com/photo-1570194065650-d99fb4a3dfb5?w=400&q=80" },

        // Digestive
        { name: "Antacid Suspension 200ml", description: "Aluminum and magnesium hydroxide suspension for heartburn and acid reflux relief. Fast-acting mint flavor.", price: 95, stock: 110, categoryIdx: 5, seller: sellerUser.id, image: "https://images.unsplash.com/photo-1559757175-7cb057fba93c?w=400&q=80" },
        { name: "Probiotic Capsules", description: "10 billion CFU probiotic blend with 8 strains. Supports digestive health, gut flora, and immune function.", price: 380, stock: 45, categoryIdx: 5, seller: seller2.id, image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80" },
    ];

    const medicines = [];
    for (const med of medicineData) {
        const m = await prisma.medicine.create({
            data: {
                name: med.name,
                description: med.description,
                price: med.price,
                stock: med.stock,
                image: med.image,
                isActive: true,
                categoryId: categories[med.categoryIdx].id,
                sellerId: med.seller,
            },
        });
        medicines.push(m);
    }
    console.log(`  ✅ Created ${medicines.length} medicines`);

    // ===================== ORDERS =====================
    console.log("\n📦 Creating orders...");

    const order1 = await prisma.order.create({
        data: {
            customerId: customerUser.id,
            totalPrice: 510,
            status: "DELIVERED",
            shippingAddress: "House 42, Road 7, Dhanmondi, Dhaka 1205",
            paymentStatus: "PAID",
            items: {
                create: [
                    { medicineId: medicines[0].id, quantity: 3, price: medicines[0].price },
                    { medicineId: medicines[7].id, quantity: 1, price: medicines[7].price },
                    { medicineId: medicines[4].id, quantity: 1, price: medicines[4].price },
                ],
            },
        },
    });

    const order2 = await prisma.order.create({
        data: {
            customerId: customerUser.id,
            totalPrice: 730,
            status: "SHIPPED",
            shippingAddress: "House 42, Road 7, Dhanmondi, Dhaka 1205",
            paymentStatus: "PAID",
            items: {
                create: [
                    { medicineId: medicines[8].id, quantity: 1, price: medicines[8].price },
                    { medicineId: medicines[10].id, quantity: 1, price: medicines[10].price },
                    { medicineId: medicines[13].id, quantity: 1, price: medicines[13].price },
                ],
            },
        },
    });

    const order3 = await prisma.order.create({
        data: {
            customerId: customer2.id,
            totalPrice: 445,
            status: "PROCESSING",
            shippingAddress: "Flat 5B, Green Valley, Gulshan 2, Dhaka 1212",
            paymentStatus: "PAID",
            items: {
                create: [
                    { medicineId: medicines[1].id, quantity: 2, price: medicines[1].price },
                    { medicineId: medicines[8].id, quantity: 1, price: medicines[8].price },
                ],
            },
        },
    });

    const order4 = await prisma.order.create({
        data: {
            customerId: customer2.id,
            totalPrice: 185,
            status: "PENDING",
            shippingAddress: "Flat 5B, Green Valley, Gulshan 2, Dhaka 1212",
            paymentStatus: "UNPAID",
            items: {
                create: [
                    { medicineId: medicines[5].id, quantity: 2, price: medicines[5].price },
                    { medicineId: medicines[4].id, quantity: 1, price: medicines[4].price },
                ],
            },
        },
    });

    const order5 = await prisma.order.create({
        data: {
            customerId: customerUser.id,
            totalPrice: 280,
            status: "DELIVERED",
            shippingAddress: "House 42, Road 7, Dhanmondi, Dhaka 1205",
            paymentStatus: "PAID",
            items: {
                create: [
                    { medicineId: medicines[14].id, quantity: 1, price: medicines[14].price },
                ],
            },
        },
    });

    console.log("  ✅ Created 5 orders (DELIVERED, SHIPPED, PROCESSING, PENDING, DELIVERED)");

    // ===================== REVIEWS =====================
    console.log("\n⭐ Creating reviews...");

    const reviewData = [
        { medicineId: medicines[0].id, customerId: customerUser.id, rating: 5, comment: "Napa Extra works really fast! Headache gone within 20 minutes. Always keep this at home." },
        { medicineId: medicines[7].id, customerId: customerUser.id, rating: 4, comment: "Good quality Vitamin C supplement. I take it daily and my immunity has improved significantly." },
        { medicineId: medicines[4].id, customerId: customerUser.id, rating: 5, comment: "Best cough syrup I have used. Tastes decent and works overnight. Highly recommended for dry cough." },
        { medicineId: medicines[14].id, customerId: customerUser.id, rating: 4, comment: "Great moisturizing cream. My dry skin improved within a week. A bit pricey but worth it." },
        { medicineId: medicines[1].id, customerId: customer2.id, rating: 5, comment: "Ibuprofen is my go-to for muscle pain after gym. Fast relief and no side effects for me." },
        { medicineId: medicines[8].id, customerId: customer2.id, rating: 5, comment: "This multivitamin is excellent! I feel more energetic since I started taking it. Great value." },
        { medicineId: medicines[5].id, customerId: customer2.id, rating: 4, comment: "Cetirizine works well for my seasonal allergies. One tablet lasts the whole day." },
        { medicineId: medicines[11].id, customerId: customerUser.id, rating: 5, comment: "Essential for every home first aid kit. Cleans wounds effectively without stinging too much." },
    ];

    for (const review of reviewData) {
        await prisma.review.upsert({
            where: {
                medicineId_customerId: {
                    medicineId: review.medicineId,
                    customerId: review.customerId,
                },
            },
            update: { rating: review.rating, comment: review.comment },
            create: review,
        });
    }
    console.log(`  ✅ Created ${reviewData.length} reviews`);

    // ===================== SUMMARY =====================
    console.log("\n" + "=".repeat(55));
    console.log("🎉 DATABASE SEEDING COMPLETE!");
    console.log("=".repeat(55));
    console.log("\n📋 LOGIN CREDENTIALS:");
    console.log("┌──────────────┬───────────────────────────────┬──────────────┐");
    console.log("│ Role         │ Email                         │ Password     │");
    console.log("├──────────────┼───────────────────────────────┼──────────────┤");
    console.log("│ ADMIN        │ admin@medistore.com           │ admin123     │");
    console.log("│ SELLER       │ seller@medistore.com          │ password123  │");
    console.log("│ SELLER       │ seller2@medistore.com         │ password123  │");
    console.log("│ CUSTOMER     │ customer@medistore.com        │ password123  │");
    console.log("│ CUSTOMER     │ customer2@medistore.com       │ password123  │");
    console.log("│ MANAGER      │ manager@medistore.com         │ password123  │");
    console.log("│ PHARMACIST   │ pharmacist@medistore.com      │ password123  │");
    console.log("└──────────────┴───────────────────────────────┴──────────────┘");
    console.log("\n📊 Seeded Data:");
    console.log(`   • 7 Users (1 Admin, 2 Sellers, 2 Customers, 1 Manager, 1 Pharmacist)`);
    console.log(`   • ${categories.length} Categories`);
    console.log(`   • ${medicines.length} Medicines`);
    console.log(`   • 5 Orders`);
    console.log(`   • ${reviewData.length} Reviews`);
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
