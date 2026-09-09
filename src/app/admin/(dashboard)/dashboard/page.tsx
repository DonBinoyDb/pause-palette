import { prisma } from "@/lib/prisma";
import { Package, Tag, Users } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const [productCount, collectionCount, userCount] = await Promise.all([
    prisma.product.count(),
    prisma.collection.count(),
    prisma.user.count(),
  ]);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500">
              <Package size={20} />
            </div>
            <p className="text-sm font-medium text-gray-500">Total Products</p>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-bold text-gray-900">{productCount}</p>
            {/* Fake sparkline/chart for visual flair matching the image */}
            <div className="w-16 h-8 bg-red-50 rounded-lg"></div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-500">
              <Tag size={20} />
            </div>
            <p className="text-sm font-medium text-gray-500">Collections</p>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-bold text-gray-900">{collectionCount}</p>
            <div className="w-16 h-8 bg-green-50 rounded-lg"></div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
              <Users size={20} />
            </div>
            <p className="text-sm font-medium text-gray-500">Admin Users</p>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-bold text-gray-900">{userCount}</p>
            <div className="w-16 h-8 bg-blue-50 rounded-lg"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
          <h2 className="text-lg font-bold mb-6 text-gray-900">Quick Actions</h2>
          <div className="flex flex-col gap-4">
            <Link 
              href="/admin/products/new" 
              className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                <Package size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Add a New Product</h3>
                <p className="text-sm text-gray-500 mt-0.5">Expand your store inventory</p>
              </div>
            </Link>
            
            <Link 
              href="/admin/collections" 
              className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <Tag size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Manage Collections</h3>
                <p className="text-sm text-gray-500 mt-0.5">Organize items into categories</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
