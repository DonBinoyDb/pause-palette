"use client";

import { useState, useEffect } from "react";
import { Package, Plus, Search, Edit } from "lucide-react";
import Link from "next/link";

export default function ProductsManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto w-full font-sans">
      
      {/* Dashboard Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your collection pieces and products.</p>
        </div>
        <Link 
          href="/admin/products/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm shrink-0"
        >
          <Plus size={18} />
          New Product
        </Link>
      </div>

      {/* Product List (Full Width) */}
      <div className="w-full">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/30">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                suppressHydrationWarning
                type="text" 
                placeholder="Search products by name..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="text-sm text-gray-500 font-medium hidden sm:block">
              {filteredProducts.length} Product{filteredProducts.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* List */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-sm text-gray-500">Loading inventory...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-16 text-center text-sm text-gray-500 flex flex-col items-center">
                <Package className="text-gray-300 mb-3" size={40} />
                <p className="text-base font-medium text-gray-900 mb-1">No products found</p>
                <p>Try adjusting your search or create a new product.</p>
                <Link 
                  href="/admin/products/new"
                  className="mt-4 text-blue-600 font-medium hover:underline flex items-center gap-1"
                >
                  <Plus size={16} /> Create one now
                </Link>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-[80px]">Image</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Product Info</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Collection</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                      
                      {/* Product Image Thumbnail */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-12 h-16 bg-gray-100 rounded-md border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {product.images && product.images[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package size={18} className="text-gray-400" />
                          )}
                        </div>
                      </td>
                      
                      {/* Info */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{product.name}</span>
                          <span className="text-xs text-gray-500 mt-1 bg-gray-100 px-2 py-0.5 rounded-full self-start font-mono">/{product.slug}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          product.isPublished 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : "bg-gray-50 text-gray-600 border-gray-200"
                        }`}>
                          {product.isPublished ? "Active" : "Draft"}
                        </span>
                      </td>

                      {/* Collection */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {product.collection?.name || <span className="italic text-gray-400">Uncategorized</span>}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{product.price.toLocaleString()}
                      </td>
                      
                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            href={`/admin/products/${product.id}/edit`} 
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
