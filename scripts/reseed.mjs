import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const products = [
  { name: "Tropical Dawn", price: 2499, category: "Women", image: "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?q=80&w=1974&auto=format&fit=crop" },
  { name: "Midnight Bloom", price: 2899, category: "Women", image: "https://images.unsplash.com/photo-1434389670869-bac89677846c?q=80&w=2070&auto=format&fit=crop" },
  { name: "Golden Hour", price: 3199, category: "Men", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop" },
  { name: "Azure Breeze", price: 2299, category: "Men", image: "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?q=80&w=1974&auto=format&fit=crop" },
  { name: "Desert Rose", price: 2699, category: "Women", image: "https://images.unsplash.com/photo-1434389670869-bac89677846c?q=80&w=2070&auto=format&fit=crop" },
  { name: "Urban Explorer", price: 3499, category: "Men", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop" }
];

async function main() {
  console.log("Wiping existing product and collection data...");
  await prisma.product.deleteMany({});
  await prisma.collection.deleteMany({});

  console.log("Seeding REAL collections...");
  
  const col1 = await prisma.collection.create({
    data: { name: "In Wild Bloom", slug: "in-wild-bloom", description: "Inspired by the world at its most vibrant." }
  });

  const col2 = await prisma.collection.create({
    data: { name: "Midnight Moss", slug: "midnight-moss", description: "Inspired by the quiet beauty of contrast." }
  });

  const col3 = await prisma.collection.create({
    data: { name: "Sage & Soil", slug: "sage-and-soil", description: "Inspired by the quiet richness of the earth's palette." }
  });

  console.log("Seeding products into their respective collections...");

  // Assign 2 products to each collection
  const assignments = [
    { p: products[0], colId: col1.id },
    { p: products[3], colId: col1.id },
    { p: products[1], colId: col2.id },
    { p: products[5], colId: col2.id },
    { p: products[2], colId: col3.id },
    { p: products[4], colId: col3.id },
  ];

  for (const { p, colId } of assignments) {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    await prisma.product.create({
      data: {
        name: p.name,
        slug,
        price: p.price,
        images: [p.image],
        collectionId: colId,
        isPublished: true,
        description: "A beautifully illustrated piece for slow living.",
        silhouetteOption: "Regular"
      }
    });
  }

  console.log("Database re-seeded successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
