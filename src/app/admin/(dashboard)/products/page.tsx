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
    <div className="w-full">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-[#E8E6E1] pb-12">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl text-[#2C2B29] tracking-tight mb-4">Inventory</h1>
          <p className="text-[#8B8985] text-xs tracking-[0.2em] uppercase">Manage your collection pieces</p>
        </div>
        
        <Link 
          href="/admin/products/new"
          className="group flex items-center gap-3 bg-[#2C2B29] text-[#FDFCFB] px-8 py-4 hover:bg-black transition-colors"
        >
          <Plus size={14} className="group-hover:rotate-90 transition-transform duration-500" />
          <span className="text-[10px] tracking-[0.15em] uppercase">New Piece</span>
        </Link>
      </div>

      <div className="bg-[#FDFCFB] border border-[#E8E6E1] p-8 md:p-12">
        
        {/* Toolbar */}
        <div className="mb-12 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-[#8B8985]" />
            <input 
              type="text" 
              placeholder="SEARCH BY NAME..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2 bg-transparent text-[10px] tracking-[0.15em] uppercase border-b border-[#E8E6E1] focus:outline-none focus:border-[#2C2B29] transition-colors placeholder:text-[#C4C2BE]"
            />
          </div>
        </div>

        {/* List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[#8B8985] text-[10px] uppercase tracking-[0.15em] border-b border-[#E8E6E1]">
                <th className="font-normal pb-6 pr-4">Piece</th>
                <th className="font-normal pb-6 px-4">Status</th>
                <th className="font-normal pb-6 px-4">Price</th>
                <th className="font-normal pb-6 px-4">Collection</th>
                <th className="font-normal pb-6 pl-4 text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E6E1]/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-[#8B8985] text-xs tracking-[0.2em] uppercase">Loading inventory...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-[#8B8985] text-xs tracking-[0.2em] uppercase">
                    {search ? "No pieces match your search." : "No pieces found."}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="group hover:bg-[#F9F8F6] transition-colors">
                    <td className="py-6 pr-4">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-20 bg-[#F2F0ED] overflow-hidden flex-shrink-0 relative">
                          {product.images && product.images[0] ? (
                            <img src={product.images[0]} alt={product.name} className="object-cover w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-700" />
                          ) : (
                            <Package className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#C4C2BE]" size={20} strokeWidth={1} />
                          )}
                        </div>
                        <div>
                          <p className="font-serif text-lg text-[#2C2B29] group-hover:text-[#8B8985] transition-colors">{product.name}</p>
                          <p className="text-[10px] text-[#C4C2BE] mt-1 tracking-widest">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <span className={`inline-flex items-center text-[10px] uppercase tracking-[0.15em] ${
                        product.isPublished ? "text-[#4A4844]" : "text-[#C4C2BE] italic"
                      }`}>
                        {product.isPublished ? "Active" : "Draft"}
                      </span>
                    </td>
                    <td className="py-6 px-4 text-sm text-[#2C2B29]">
                      ₹{product.price.toLocaleString()}
                    </td>
                    <td className="py-6 px-4">
                      <span className="text-[10px] uppercase tracking-[0.15em] text-[#8B8985]">
                        {product.collection?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="py-6 pl-4 text-right">
                      <Link href={`/admin/products/${product.id}/edit`} className="inline-block text-[#8B8985] hover:text-[#2C2B29] transition-colors">
                        <Edit size={16} strokeWidth={1.5} />
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
