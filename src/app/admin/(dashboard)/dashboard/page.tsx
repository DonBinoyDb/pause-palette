import { prisma } from "@/lib/prisma";
import { Package, Tag, Users, ChevronRight, Plus, Star, BarChart3, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function DashboardPage() {
  const [productCount, collectionCount, reviewCount] = await Promise.all([
    prisma.product.count(),
    prisma.collection.count(),
    prisma.review.count(),
  ]);

  const recentProducts = await prisma.product.findMany({
    take: 4,
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, price: true, images: true, isPublished: true, createdAt: true }
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full min-h-screen bg-gray-50/50">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Here's what's happening in your store today.</p>
        </div>
        <div className="flex items-center gap-3">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Products", value: productCount, icon: Package, link: "/admin/products" },
          { label: "Active Collections", value: collectionCount, icon: Tag, link: "/admin/collections" },
          { label: "Worn Stories", value: reviewCount, icon: Star, link: "/admin/reviews" },
        ].map((metric, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600">{metric.label}</p>
              <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600">
                <metric.icon size={16} />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-semibold text-gray-900">{metric.value}</p>
              <Link href={metric.link} className="text-xs text-gray-400 hover:text-gray-900 flex items-center gap-0.5 transition-colors">
                View <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Data Table */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2 text-gray-900 font-medium">
                <Clock size={16} className="text-gray-400" />
                Recently Added Products
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
                      <td colSpan={4} className="px-5 py-8 text-center text-gray-500">No products found.</td>
                    </tr>
                  ) : (
                    recentProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 relative overflow-hidden flex-shrink-0">
                            {product.images?.[0] ? (
                              <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                            ) : (
                              <Package size={14} className="text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            )}
                          </div>
                          <Link href={`/admin/products/${product.id}/edit`} className="font-medium text-gray-900 hover:text-blue-600">
                            {product.name}
                          </Link>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${product.isPublished ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20' : 'bg-gray-100 text-gray-600 ring-1 ring-gray-500/20'}`}>
                            {product.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-600">₹{product.price.toLocaleString()}</td>
                        <td className="px-5 py-3 text-right text-gray-500">
                          {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(product.createdAt))}
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
              Store Management
            </h2>
            <div className="flex flex-col gap-2">
              <Link href="/admin/collections" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-sm group border border-transparent hover:border-gray-200 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Tag size={14} />
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-gray-900">Collections</span>
                </div>
                <ChevronRight size={14} className="text-gray-400 group-hover:text-gray-600" />
              </Link>

              <Link href="/admin/lookbook" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-sm group border border-transparent hover:border-gray-200 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Image src="/images/lookbook-icon.svg" alt="" width={14} height={14} className="opacity-0 hidden" />
                    <Star size={14} />
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-gray-900">Lookbook</span>
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
