import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StorySection from "@/components/StorySection";
import NewInSection from "@/components/NewInSection";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { DEFAULT_NEW_ARRIVALS_DATA } from "@/lib/newArrivalsDefaults";

export const dynamic = "force-dynamic";

export default async function Home() {
  let heroData = null;
  let newInProducts: any[] = [];
  let newArrivalsSettings = DEFAULT_NEW_ARRIVALS_DATA;

  try {
    const [banner, newInConfig] = await Promise.all([
      prisma.heroBanner?.findUnique
        ? prisma.heroBanner.findUnique({
            where: { id: "singleton" },
          })
        : Promise.resolve(null),
      prisma.newArrivalsSettings?.findUnique
        ? prisma.newArrivalsSettings.findUnique({
            where: { id: "singleton" },
          })
        : Promise.resolve(null),
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

    if (newInConfig) {
      newArrivalsSettings = {
        isEnabled: newInConfig.isEnabled ?? true,
        tagline: newInConfig.tagline || DEFAULT_NEW_ARRIVALS_DATA.tagline,
        title: newInConfig.title ?? "",
        subtitle: newInConfig.subtitle ?? "",
        buttonText: newInConfig.buttonText || DEFAULT_NEW_ARRIVALS_DATA.buttonText,
        buttonLink: newInConfig.buttonLink || DEFAULT_NEW_ARRIVALS_DATA.buttonLink,
        limit: typeof newInConfig.limit === "number" ? newInConfig.limit : DEFAULT_NEW_ARRIVALS_DATA.limit,
        productIds: Array.isArray(newInConfig.productIds) ? newInConfig.productIds : [],
      };
    }

    // Only query products if New Arrivals section is enabled
    if (newArrivalsSettings.isEnabled) {
      const limit = Math.max(newArrivalsSettings.limit || 0, 8);
      const customIds = newArrivalsSettings.productIds || [];

      // Query any published products marked as isNew, sorted newest first
      const newestAddedProducts = await prisma.product.findMany({
        where: { isPublished: true, isNew: true },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          collection: {
            select: { name: true },
          },
        },
      });

      if (customIds.length > 0) {
        const curated = await prisma.product.findMany({
          where: {
            id: { in: customIds },
            isPublished: true,
          },
          include: {
            collection: {
              select: { name: true },
            },
          },
        });
        const curatedOrdered = customIds
          .map((id) => curated.find((p) => p.id === id))
          .filter(Boolean) as any[];

        // Products that are brand new (isNew: true) and not already in customIds come first
        const newNotYetCurated = newestAddedProducts.filter(
          (p) => !customIds.includes(p.id)
        );

        newInProducts = [...newNotYetCurated, ...curatedOrdered];
      } else {
        newInProducts = newestAddedProducts;
      }

      // If still fewer than limit (e.g. not enough products marked isNew), fallback to any published products by recency
      if (!newInProducts || newInProducts.length < limit) {
        const existingIds = (newInProducts || []).map((p) => p.id);
        const fallbackProducts = await prisma.product.findMany({
          where: {
            isPublished: true,
            ...(existingIds.length > 0 ? { id: { notIn: existingIds } } : {}),
          },
          take: limit - (newInProducts ? newInProducts.length : 0),
          orderBy: { createdAt: "desc" },
          include: {
            collection: {
              select: { name: true },
            },
          },
        });
        newInProducts = [...(newInProducts || []), ...fallbackProducts];
      }
    }
  } catch (err) {
    console.error("[HOME_FETCH_DATA_ERROR]", err);
  }

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <Hero initialData={heroData || undefined} />
      <StorySection />
      {newArrivalsSettings.isEnabled && (
        <NewInSection
          products={newInProducts}
          tagline={newArrivalsSettings.tagline}
          title={newArrivalsSettings.title}
          subtitle={newArrivalsSettings.subtitle}
          buttonText={newArrivalsSettings.buttonText}
          buttonLink={newArrivalsSettings.buttonLink}
        />
      )}
      <Footer />
    </main>
  );
}
