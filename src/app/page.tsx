import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StorySection from "@/components/StorySection";
import NewInSection from "@/components/NewInSection";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  let heroData = null;
  let newInProducts: any[] = [];

  try {
    const [banner, products] = await Promise.all([
      prisma.heroBanner.findUnique({
        where: { id: "singleton" },
      }),
      prisma.product.findMany({
        where: { isPublished: true, isNew: true },
        take: 4,
        orderBy: { createdAt: "desc" },
        include: {
          collection: {
            select: { name: true },
          },
        },
      }),
    ]);

    if (banner) {
      heroData = {
        title: banner.title,
        subtitle: banner.subtitle,
        buttonText: banner.buttonText,
        buttonLink: banner.buttonLink,
        mediaItems: Array.isArray(banner.mediaItems) ? (banner.mediaItems as any[]) : undefined,
      };
    }

    // If fewer than 4 with isNew, grab published products as fallback
    if (products && products.length > 0) {
      newInProducts = products;
    } else {
      newInProducts = await prisma.product.findMany({
        where: { isPublished: true },
        take: 4,
        orderBy: { createdAt: "desc" },
        include: {
          collection: {
            select: { name: true },
          },
        },
      });
    }
  } catch (err) {
    console.error("[HOME_FETCH_DATA_ERROR]", err);
  }

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <Hero initialData={heroData || undefined} />
      <StorySection />
      <NewInSection products={newInProducts} />
      <Footer />
    </main>
  );
}
