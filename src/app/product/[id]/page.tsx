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
      },
      categories: {
        select: { id: true, name: true, slug: true }
      }
    }
  });

  if (!product) {
    notFound();
  }

  const categoryNames = product.categories?.map((c) => c.name) || [];
  const categoryDisplay = categoryNames.length > 0
    ? categoryNames.join(", ")
    : (product.gender?.length > 0 ? product.gender.join(", ") : "");

  // Map to the expected format for the client
  const serializedProduct = {
    id: product.id,
    name: product.name,
    price: product.price,
    description: product.description || "",
    images: product.images,
    imageFit: product.imageFit || "cover",
    collectionName: product.collection?.name || null,
    categories: product.categories || [],
    category: categoryDisplay,
    hasSilhouette: product.hasSilhouette,
    fits: (product.fits as Array<{
      name: string;
      iconUrl: string;
      image?: string;
      description?: string;
      fitGuideDescription?: string;
      fitGuideImage?: string;
    }>) || [],
    accordions: (product.accordions as {title: string, content: string}[]) || [],
    gender: product.gender,
    sizes: product.sizes,
    fitGuideDescription: product.fitGuideDescription || "",
    fitGuideImage: product.fitGuideImage || "",
    colors: (product.colors as {name: string, hex: string, images: string[]}[]) || [],
    dispatchInfo: product.dispatchInfo || null,
  };

  return <ProductDetailClient product={serializedProduct} />;
}
