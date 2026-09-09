"use client";

import { useState, useEffect } from "react";
import { Package, Plus, Search, Edit } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
    <div className="p-8 max-w-6xl mx-auto w-full">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Products List</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Manage your products and pricing.</p>
        </div>
        
        <Link 
          href="/admin/products/new"
          className="flex items-center gap-2 bg-red-400 text-white px-5 py-2.5 rounded-full hover:bg-red-500 transition-colors font-medium text-sm shadow-md shadow-red-200"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-6">
        
        {/* Toolbar */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8F9FD] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition-shadow border border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-wider font-semibold border-b border-gray-100">
                <th className="px-4 py-4">Product Name</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Price</th>
                <th className="px-4 py-4">Collection</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400 font-medium">Loading products...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400 font-medium">
                    {search ? "No products match your search." : "No products found."}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-[#F8F9FD]/50 transition-colors group">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#F8F9FD] rounded-xl overflow-hidden flex-shrink-0 relative">
                          {product.images && product.images[0] ? (
                            <img src={product.images[0]} alt={product.name} className="object-cover w-full h-full mix-blend-multiply" />
                          ) : (
                            <Package className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">/product/{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        product.isPublished ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-600"
                      }`}>
                        {product.isPublished ? "Active" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-700">
                      ₹{product.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                        {product.collection?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link href={`/admin/products/${product.id}/edit`} className="inline-block p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit size={16} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
