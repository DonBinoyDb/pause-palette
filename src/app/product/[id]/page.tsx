import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = await params;

  // Fetch the product by slug
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      collection: {
        select: { name: true }
      }
    }
  });

  if (!product) {
    notFound();
  }

  // Map to the expected format for the client
  const serializedProduct = {
    id: product.id,
    name: product.name,
    price: product.price,
    description: product.description || "",
    images: product.images,
    category: product.collection?.name || "Uncategorized",
    hasSilhouette: product.hasSilhouette,
    fits: product.fits,
    gender: product.gender,
    sizes: product.sizes
  };

  return <ProductDetailClient product={serializedProduct} />;
}
