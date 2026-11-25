import { prisma } from "@/lib/prisma";
import {
  Package,
  Tag,
  ChevronRight,
  Plus,
  Star,
  BarChart3,
  Clock,
  FileText,
  MessageCircle,
  ClipboardList,
  IndianRupee,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ORDER_STATUS_CONFIG, OrderStatusType } from "@/lib/orderHelpers";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [
    productCount,
    collectionCount,
    reviewCount,
    orderCount,
    pendingOrderCount,
    revenueAgg,
    recentOrders,
    recentProducts,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.collection.count(),
    prisma.review.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" } },
      _sum: { totalAmount: true },
    }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.product.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, price: true, images: true, isPublished: true, createdAt: true },
    }),
  ]);

  const totalRevenue = revenueAgg._sum.totalAmount || 0;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Here&apos;s what&apos;s happening in your store today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="flex items-center gap-2 bg-white text-gray-800 border border-gray-300 px-4 py-2.5 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors shadow-xs"
          >
            <ClipboardList size={16} />
            <span>Manage Orders</span>
            {pendingOrderCount > 0 && (
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-semibold">
                {pendingOrderCount}
              </span>
            )}
          </Link>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Orders Metric */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              {pendingOrderCount > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {pendingOrderCount} pending action
                </span>
              ) : (
                <span className="text-[11px] text-gray-400 mt-1 block">All caught up</span>
              )}
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <ClipboardList size={18} />
            </div>
          </div>
          <div className="flex items-end justify-between pt-1">
            <p className="text-3xl font-semibold text-gray-900">{orderCount}</p>
            <Link
              href="/admin/orders"
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-0.5 transition-colors"
            >
              View orders <ChevronRight size={12} />
            </Link>
          </div>
        </div>

        {/* Total Revenue Metric */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Store Revenue</p>
              <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
                Excl. cancelled orders
              </span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <IndianRupee size={18} />
            </div>
          </div>
          <div className="flex items-end justify-between pt-1">
            <p className="text-2xl sm:text-3xl font-semibold text-gray-900">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </p>
            <Link
              href="/admin/orders"
              className="text-xs text-gray-400 hover:text-gray-900 flex items-center gap-0.5 transition-colors"
            >
              Details <ChevronRight size={12} />
            </Link>
          </div>
        </div>

        {/* Total Products Metric */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-600">Total Products</p>
            <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Package size={18} />
            </div>
          </div>
          <div className="flex items-end justify-between pt-1">
            <p className="text-3xl font-semibold text-gray-900">{productCount}</p>
            <Link
              href="/admin/products"
              className="text-xs text-gray-400 hover:text-gray-900 flex items-center gap-0.5 transition-colors"
            >
              Inventory <ChevronRight size={12} />
            </Link>
          </div>
        </div>

        {/* Active Collections Metric */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-600">Active Collections</p>
            <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Tag size={18} />
            </div>
          </div>
          <div className="flex items-end justify-between pt-1">
            <p className="text-3xl font-semibold text-gray-900">{collectionCount}</p>
            <Link
              href="/admin/collections"
              className="text-xs text-gray-400 hover:text-gray-900 flex items-center gap-0.5 transition-colors"
            >
              Manage <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Orders History & Products */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Customer Order History Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-white">
              <div>
                <div className="flex items-center gap-2 text-gray-900 font-semibold text-base">
                  <ClipboardList size={18} className="text-gray-700" />
                  <span>Customer Order History</span>
                  {orderCount > 0 && (
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full ml-1">
                      {orderCount} total
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Real-time customer orders placed through checkout
                </p>
              </div>
              <Link
                href="/admin/orders"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 transition-colors"
              >
                <span>View all orders</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/80 text-gray-500 font-medium border-b border-gray-200 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Order</th>
                    <th className="px-5 py-3 font-semibold">Customer</th>
                    <th className="px-5 py-3 font-semibold">Items</th>
                    <th className="px-5 py-3 font-semibold">Total</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold text-right">Placed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                        <ShoppingBag size={32} className="mx-auto text-gray-300 mb-2" />
                        <p className="font-medium text-gray-700">No orders placed yet</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Customer orders will appear here automatically when checked out.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => {
                      const statusConfig =
                        ORDER_STATUS_CONFIG[order.status as OrderStatusType] || {
                          label: order.status,
                          badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
                          dotClass: "bg-gray-400",
                        };

                      const orderDate = new Date(order.createdAt);
                      const formattedDate = orderDate.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      });
                      const formattedTime = orderDate.toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      });

                      const firstItem = order.items?.[0];
                      const totalItemCount = order.items?.reduce((s, it) => s + it.quantity, 0) || 0;

                      return (
                        <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                          {/* Order Number */}
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <Link
                              href="/admin/orders"
                              className="font-medium text-gray-900 hover:text-blue-600 font-mono text-[13px]"
                            >
                              {order.orderNumber}
                            </Link>
                          </td>

                          {/* Customer */}
                          <td className="px-5 py-3.5">
                            <div className="min-w-0 max-w-[170px]">
                              <p className="font-medium text-gray-900 truncate text-[13px]">
                                {order.customerName}
                              </p>
                              <p className="text-xs text-gray-400 truncate mt-0.5">
                                {order.customerPhone || order.customerEmail}
                              </p>
                            </div>
                          </td>

                          {/* Items */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-11 bg-gray-100 border border-gray-200 rounded-xs overflow-hidden shrink-0 relative">
                                {firstItem?.productImage ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img
                                    src={firstItem.productImage}
                                    alt={firstItem.productName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <ShoppingBag size={12} />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 max-w-[150px]">
                                <p className="text-xs font-medium text-gray-800 truncate">
                                  {firstItem?.productName || "Product"}
                                </p>
                                <p className="text-[11px] text-gray-400">
                                  {totalItemCount} {totalItemCount === 1 ? "piece" : "pieces"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Total */}
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className="font-semibold text-gray-900 text-sm">
                              ₹{order.totalAmount.toLocaleString("en-IN")}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${statusConfig.badgeClass}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
                              <span>{statusConfig.label}</span>
                            </span>
                          </td>

                          {/* Placed At */}
                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            <p className="text-xs text-gray-700 font-medium">{formattedDate}</p>
                            <p className="text-[11px] text-gray-400">{formattedTime}</p>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Footer bar linking to full orders page */}
            {recentOrders.length > 0 && (
              <div className="p-3 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 px-5">
                <span>Showing latest {recentOrders.length} customer orders</span>
                <Link
                  href="/admin/orders"
                  className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                >
                  <span>Open Full Order Management</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            )}
          </div>

          {/* Recently Added Products Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2 text-gray-900 font-medium">
                <Clock size={16} className="text-gray-400" />
                <span>Recently Added Products</span>
              </div>
              <Link href="/admin/products" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View inventory
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/80 text-gray-500 font-medium border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3 font-medium">Product</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Price</th>
                    <th className="px-5 py-3 font-medium text-right">Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentProducts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-gray-500">
                        No products found.
                      </td>
                    </tr>
                  ) : (
                    recentProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 relative overflow-hidden flex-shrink-0">
                            {product.images?.[0] ? (
                              <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                            ) : (
                              <Package
                                size={14}
                                className="text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                              />
                            )}
                          </div>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="font-medium text-gray-900 hover:text-blue-600"
                          >
                            {product.name}
                          </Link>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                              product.isPublished
                                ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
                                : "bg-gray-100 text-gray-600 ring-1 ring-gray-500/20"
                            }`}
                          >
                            {product.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-600">₹{product.price.toLocaleString("en-IN")}</td>
                        <td className="px-5 py-3 text-right text-gray-500">
                          {new Intl.DateTimeFormat("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }).format(new Date(product.createdAt))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Links */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-gray-900 font-medium mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-gray-400" />
              <span>Store Management</span>
            </h2>
            <div className="flex flex-col gap-2">
              {/* Direct link to Orders page */}
              <Link
                href="/admin/orders"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-sm group border border-transparent hover:border-gray-200 transition-all bg-blue-50/40"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-blue-600 text-white flex items-center justify-center">
                    <ClipboardList size={15} />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 block leading-tight">Customer Orders</span>
                    <span className="text-[11px] text-gray-500">Fulfill & update statuses</span>
                  </div>
                </div>
                {pendingOrderCount > 0 ? (
                  <span className="bg-amber-100 text-amber-800 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                    {pendingOrderCount} pending
                  </span>
                ) : (
                  <ChevronRight size={14} className="text-gray-400 group-hover:text-gray-600" />
                )}
              </Link>

              <Link
                href="/admin/collections"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-sm group border border-transparent hover:border-gray-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Tag size={14} />
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-gray-900">Collections</span>
                </div>
                <ChevronRight size={14} className="text-gray-400 group-hover:text-gray-600" />
              </Link>

              <Link
                href="/admin/lookbook"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-sm group border border-transparent hover:border-gray-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Star size={14} />
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-gray-900">Lookbook</span>
                </div>
                <ChevronRight size={14} className="text-gray-400 group-hover:text-gray-600" />
              </Link>

              <Link
                href="/admin/policy-pages"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-sm group border border-transparent hover:border-gray-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center">
                    <FileText size={14} />
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-gray-900">
                    Policy Pages (Shipping & Returns)
                  </span>
                </div>
                <ChevronRight size={14} className="text-gray-400 group-hover:text-gray-600" />
              </Link>

              <Link
                href="/admin/contact-settings"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-sm group border border-transparent hover:border-gray-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <MessageCircle size={14} />
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-gray-900">
                    WhatsApp & Contact Settings
                  </span>
                </div>
                <ChevronRight size={14} className="text-gray-400 group-hover:text-gray-600" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
