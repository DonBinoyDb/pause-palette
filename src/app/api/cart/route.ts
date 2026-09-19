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
          select: { name: true, price: true, images: true }
        }
      }
    });

    // Transform to match ShopContext's CartItem interface
    const formattedCart = cartItems.map(item => ({
      id: `${item.productId}-${item.size}-${item.silhouette}`,
      productId: item.productId,
      name: item.product.name,
      price: item.product.price,
      image: item.product.images[0] || "",
      size: item.size,
      silhouette: item.silhouette,
      quantity: item.quantity,
    }));

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
    const { productId, size, silhouette, quantity } = body;

    if (!productId || !size || !silhouette || quantity === undefined) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Upsert the cart item
    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId_size_silhouette: {
          userId: user.id,
          productId,
          size,
          silhouette
        }
      },
      update: {
        quantity: quantity
      },
      create: {
        userId: user.id,
        productId,
        size,
        silhouette,
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

    // For each item, upsert it. We could do this in a transaction.
    await prisma.$transaction(
      items.map((item: any) => 
        prisma.cartItem.upsert({
          where: {
            userId_productId_size_silhouette: {
              userId: user.id,
              productId: item.productId,
              size: item.size,
              silhouette: item.silhouette
            }
          },
          update: {
            quantity: item.quantity // Keep local quantity or add? We'll just overwrite.
          },
          create: {
            userId: user.id,
            productId: item.productId,
            size: item.size,
            silhouette: item.silhouette,
            quantity: item.quantity
          }
        })
      )
    );

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

    if (!productId || !size || !silhouette) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    await prisma.cartItem.delete({
      where: {
        userId_productId_size_silhouette: {
          userId: user.id,
          productId,
          size,
          silhouette
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CART_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
