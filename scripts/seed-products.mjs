import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const allProducts = [
  { name: "Tropical Dawn", price: 2499, category: "Women", image: "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?q=80&w=1974&auto=format&fit=crop" },
  { name: "Midnight Bloom", price: 2899, category: "Women", image: "https://images.unsplash.com/photo-1434389670869-bac89677846c?q=80&w=2070&auto=format&fit=crop" },
  { name: "Golden Hour", price: 3199, category: "Men", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop" },
  { name: "Azure Breeze", price: 2299, category: "Men", image: "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?q=80&w=1974&auto=format&fit=crop" },
  { name: "Desert Rose", price: 2699, category: "Women", image: "https://images.unsplash.com/photo-1434389670869-bac89677846c?q=80&w=2070&auto=format&fit=crop" },
  { name: "Urban Explorer", price: 3499, category: "Men", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop" }
];

async function main() {
  console.log("Seeding collections...");
  
  const womenCol = await prisma.collection.upsert({
    where: { name: "Women" },
    update: {},
    create: { name: "Women", slug: "women", description: "Womenswear collection" }
  });

  const menCol = await prisma.collection.upsert({
    where: { name: "Men" },
    update: {},
    create: { name: "Men", slug: "men", description: "Menswear collection" }
  });

  console.log("Seeding products...");

  for (const p of allProducts) {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const collectionId = p.category === "Women" ? womenCol.id : menCol.id;

    await prisma.product.upsert({
      where: { slug },
      update: {
        price: p.price,
        images: [p.image],
        collectionId,
        isPublished: true,
      },
      create: {
        name: p.name,
        slug,
        price: p.price,
        images: [p.image],
        collectionId,
        isPublished: true,
        description: "A beautifully illustrated story for slow living.",
        silhouetteOption: "Regular"
      }
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
