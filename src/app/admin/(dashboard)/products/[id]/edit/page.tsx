import { prisma } from "@/lib/prisma";
import EditProductForm from "@/components/admin/EditProductForm";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Fetch everything in parallel on the server
  const [product, collections] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { collection: true }
    }),
    prisma.collection.findMany()
  ]);

  if (!product) {
    notFound();
  }

  return <EditProductForm product={product} collections={collections} />;
}
