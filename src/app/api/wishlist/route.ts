import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";

// Fetch the user's wishlist
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

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          select: { name: true, price: true, images: true }
        }
      }
    });

    const formattedWishlist = wishlistItems.map(item => ({
      productId: item.productId,
      name: item.product.name,
      price: item.product.price,
      image: item.product.images[0] || "",
    }));

    return NextResponse.json(formattedWishlist);
  } catch (error) {
    console.error("[WISHLIST_GET_ERROR_DETAILS]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Add/Remove a wishlist item
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
    const { productId } = body;

    if (!productId) {
      return new NextResponse("Missing product ID", { status: 400 });
    }

    // Check if it exists
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId
        }
      }
    });

    if (existing) {
      // Remove it
      await prisma.wishlistItem.delete({
        where: { id: existing.id }
      });
      return NextResponse.json({ action: "removed", productId });
    } else {
      // Add it
      await prisma.wishlistItem.create({
        data: {
          userId: user.id,
          productId
        }
      });
      return NextResponse.json({ action: "added", productId });
    }
  } catch (error) {
    console.error("[WISHLIST_POST]", error);
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
    const { items } = body; 

    if (!Array.isArray(items)) {
      return new NextResponse("Invalid payload", { status: 400 });
    }

    await prisma.$transaction(
      items.map((item: any) => 
        prisma.wishlistItem.upsert({
          where: {
            userId_productId: {
              userId: user.id,
              productId: item.productId
            }
          },
          update: {}, // Do nothing if it already exists
          create: {
            userId: user.id,
            productId: item.productId,
          }
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[WISHLIST_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
