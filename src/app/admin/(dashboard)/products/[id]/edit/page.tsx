import { prisma } from "@/lib/prisma";
import EditProductForm from "@/components/admin/EditProductForm";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Fetch everything in parallel on the server
  const [product, collections, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { collection: true, categories: true }
    }),
    prisma.collection.findMany(),
    prisma.category.findMany()
  ]);

  if (!product) {
    notFound();
  }

  return <EditProductForm product={product} collections={collections} categories={categories} />;
}
