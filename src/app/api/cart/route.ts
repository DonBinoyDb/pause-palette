import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";

// Fetch the user's cart
export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          select: { name: true, price: true, images: true, colors: true }
        }
      }
    });

    // Transform to match ShopContext's CartItem interface
    const formattedCart = cartItems.map(item => {
      let silhouette = item.silhouette;
      let color: string | undefined = undefined;

      if (item.silhouette && item.silhouette.includes(":::")) {
        const parts = item.silhouette.split(":::");
        silhouette = parts[0];
        color = parts[1];
      }

      // Pick image: if color matches one in product.colors, use that color's image
      let itemImage = item.product.images[0] || "";
      if (color && Array.isArray(item.product.colors)) {
        const matchingColor = (item.product.colors as any[]).find(
          c => c.name && c.name.toLowerCase() === color?.toLowerCase()
        );
        if (matchingColor?.images?.[0]) {
          itemImage = matchingColor.images[0];
        }
      }

      const colorKey = color ? `-${color}` : "";
      return {
        id: `${item.productId}-${item.size}-${silhouette}${colorKey}`,
        productId: item.productId,
        name: item.product.name,
        price: item.product.price,
        image: itemImage,
        size: item.size,
        silhouette: silhouette,
        color: color,
        quantity: item.quantity,
      };
    });

    return NextResponse.json(formattedCart);
  } catch (error) {
    console.error("[CART_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Add/Update a single cart item
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    const body = await request.json();
    const { productId, size, silhouette, color, quantity } = body;

    if (!productId || !size || !silhouette || quantity === undefined) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    if (productId.startsWith("curated-")) {
      // Curated items are handled client-side / in localStorage
      return NextResponse.json({ success: true, isCurated: true });
    }

    const dbSilhouette = color ? `${silhouette}:::${color}` : silhouette;

    // Upsert the cart item
    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId_size_silhouette: {
          userId: user.id,
          productId,
          size,
          silhouette: dbSilhouette
        }
      },
      update: {
        quantity: quantity
      },
      create: {
        userId: user.id,
        productId,
        size,
        silhouette: dbSilhouette,
        quantity
      }
    });

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error("[CART_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Sync bulk items (from local storage)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    const body = await request.json();
    const { items } = body; // Array of local cart items

    if (!Array.isArray(items)) {
      return new NextResponse("Invalid payload", { status: 400 });
    }

    const dbItems = items.filter((item: any) => !item.productId?.startsWith("curated-"));

    if (dbItems.length > 0) {
      await prisma.$transaction(
        dbItems.map((item: any) => {
          const dbSilhouette = item.color ? `${item.silhouette}:::${item.color}` : item.silhouette;
          return prisma.cartItem.upsert({
            where: {
              userId_productId_size_silhouette: {
                userId: user.id,
                productId: item.productId,
                size: item.size,
                silhouette: dbSilhouette
              }
            },
            update: {
              quantity: item.quantity
            },
            create: {
              userId: user.id,
              productId: item.productId,
              size: item.size,
              silhouette: dbSilhouette,
              quantity: item.quantity
            }
          });
        })
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CART_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Delete an item
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const size = searchParams.get("size");
    const silhouette = searchParams.get("silhouette");
    const color = searchParams.get("color");

    if (!productId || !size || !silhouette) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    if (productId.startsWith("curated-")) {
      return NextResponse.json({ success: true });
    }

    const dbSilhouette = color ? `${silhouette}:::${color}` : silhouette;

    await prisma.cartItem.deleteMany({
      where: {
        userId: user.id,
        productId,
        size,
        silhouette: dbSilhouette
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CART_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
