import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductGrid from "./ProductGrid";

interface Product {
  id: string;
  name: string;
  price: number;
  slug: string;
  images: string[];
  collection?: { name: string } | null;
}

interface NewInSectionProps {
  products: Product[];
}

export default function NewInSection({ products }: NewInSectionProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="bg-white pt-8 md:pt-12 pb-16 md:pb-24 border-t border-gray-100">
      <div className="w-full px-6 md:px-10 lg:px-20">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-14">
          <div>
            <span className="text-[12px] tracking-[0.25em] text-gray-400 uppercase font-semibold block mb-3">
              NEW IN
            </span>
            <h2 
              className="text-2xl md:text-3xl lg:text-4xl text-gray-900 font-normal leading-tight"
              style={{ fontFamily: "'EB Garamond', Garamond, serif" }}
            >
              Latest arrivals, crafted for slow living.
            </h2>
          </div>
          
          <Link 
            href="/shop/new-in"
            className="hidden md:inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-gray-500 hover:text-gray-900 transition-colors font-semibold group mt-4 md:mt-0"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
          </Link>
        </div>

        {/* Products Grid */}
        <ProductGrid products={products} />

        {/* Mobile View All Button */}
        <div className="mt-10 text-center md:hidden">
          <Link 
            href="/shop/new-in"
            className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-gray-700 hover:text-black font-semibold border border-gray-200 px-6 py-3 rounded-full hover:border-gray-900 transition-colors"
          >
            <span>Explore All New In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
