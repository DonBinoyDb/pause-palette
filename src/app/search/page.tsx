"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { Search as SearchIcon, X, ArrowRight, Loader2, Sparkles } from "lucide-react";

interface ProductItem {
  id: string;
  name: string;
  price: number;
  slug: string;
  images: string[];
  description?: string | null;
  sizes?: string[];
  collection?: { name: string; slug?: string } | null;
}

interface CollectionItem {
  id: string;
  name: string;
  slug: string;
  coverImage?: string | null;
  description?: string | null;
}

const POPULAR_SEARCHES = [
  "Linen Shirts",
  "In Wild Bloom",
  "Midnight Moss",
  "Sage and Soil",
  "Men",
  "Women",
  "Embroidered",
  "Printed",
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setProducts([]);
      setCollections([]);
      setSearchedQuery("");
      setLoading(false);
      return;
    }

    setLoading(true);
    const handler = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)
        .then((res) => (res.ok ? res.json() : { products: [], collections: [] }))
        .then((data) => {
          setProducts(data.products || []);
          setCollections(data.collections || []);
          setSearchedQuery(trimmed);
        })
        .catch((err) => {
          console.error("Search error:", err);
          setProducts([]);
          setCollections([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 280);

    return () => clearTimeout(handler);
  }, [query]);

  // Keep query in sync if URL query parameter changes
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null && q !== query) {
      setQuery(q);
    }
  }, [searchParams]);

  const handleSelectTerm = (term: string) => {
    setQuery(term);
    router.replace(`/search?q=${encodeURIComponent(term)}`, { scroll: false });
    inputRef.current?.focus();
  };

  const handleClear = () => {
    setQuery("");
    setProducts([]);
    setCollections([]);
    setSearchedQuery("");
    router.replace("/search", { scroll: false });
    inputRef.current?.focus();
  };

  const hasSearched = searchedQuery.length > 0;

  return (
    <div className="pt-36 md:pt-44 pb-24 px-6 md:px-12 lg:px-24 container mx-auto w-full max-w-[1400px] flex-1 flex flex-col items-center">
      
      {/* Search Input Box */}
      <div className="w-full max-w-3xl mb-12">
        <div className="relative border-b-2 border-gray-300 pb-2 focus-within:border-gray-800 transition-colors group">
          <SearchIcon 
            className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-gray-400 group-focus-within:text-gray-800 transition-colors" 
            strokeWidth={1.5} 
          />
          
          <input 
            ref={inputRef}
            suppressHydrationWarning
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for pieces, colors, or collections..." 
            style={{ fontFamily: "var(--font-body), 'EB Garamond', Garamond, serif" }}
            className="w-full bg-transparent pl-9 md:pl-11 pr-10 py-2.5 md:py-3.5 text-base md:text-xl font-garamond text-gray-900 focus:outline-none placeholder:text-gray-400 placeholder:italic placeholder:font-garamond tracking-wide"
            autoFocus
          />

          {loading ? (
            <div className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 animate-spin">
              <Loader2 className="w-5 h-5" />
            </div>
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Case 1: Searching / Loading indicator */}
      {loading && !hasSearched && (
        <div className="text-center py-24 flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <p className="font-garamond italic text-gray-500 text-sm tracking-wide">
            Searching archive for &ldquo;{query}&rdquo;...
          </p>
        </div>
      )}

      {/* Case 2: Results Found */}
      {hasSearched && (products.length > 0 || collections.length > 0) && (
        <div className="w-full flex flex-col">
          
          {/* Header result info */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-gray-100 pb-4 mb-8 gap-2">
            <div>
              <h1 className="font-garamond text-2xl md:text-3xl text-gray-900 font-normal">
                Results for &ldquo;{searchedQuery}&rdquo;
              </h1>
              <p className="text-xs tracking-wider text-gray-400 uppercase mt-1">
                {products.length} {products.length === 1 ? "piece" : "pieces"} found
              </p>
            </div>

            {/* Quick Clear Filter */}
            <button
              onClick={handleClear}
              className="text-xs text-gray-400 hover:text-gray-800 transition-colors tracking-widest uppercase text-left"
            >
              Clear search
            </button>
          </div>

          {/* Matching Collections Section (if any) */}
          {collections.length > 0 && (
            <div className="mb-12 bg-gray-50/80 border border-gray-100 p-4 md:p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[11px] font-semibold tracking-widest text-gray-500 uppercase">
                  Matching Collections
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {collections.map((col) => (
                  <Link
                    key={col.id}
                    href={`/collections/${col.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-gray-800 rounded-md text-xs font-garamond text-gray-800 hover:text-black transition-all shadow-2xs group"
                  >
                    <span>{col.name}</span>
                    <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="w-full">
              <ProductGrid products={products} showWishlist={true} />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 italic font-garamond">
              No individual pieces with this keyword, but check the collections above.
            </div>
          )}

        </div>
      )}

      {/* Case 3: No Results Found */}
      {hasSearched && products.length === 0 && collections.length === 0 && !loading && (
        <div className="text-center py-16 max-w-md mx-auto">
          <p className="font-garamond text-xl md:text-2xl text-gray-800 mb-2">
            No pieces found for &ldquo;{searchedQuery}&rdquo;
          </p>
          <p className="text-xs md:text-sm text-gray-400 font-garamond italic leading-relaxed mb-8">
            We couldn&rsquo;t find anything matching that term. Try searching for collections like &ldquo;In Wild Bloom&rdquo; or &ldquo;Midnight Moss&rdquo;, fabrics like &ldquo;Linen&rdquo;, or gender categories.
          </p>

          <h3 className="text-[11px] font-medium tracking-widest text-gray-400 uppercase mb-4">
            Try One of These
          </h3>
          <div className="flex flex-wrap justify-center gap-2.5">
            {POPULAR_SEARCHES.map((term) => (
              <button 
                key={term}
                onClick={() => handleSelectTerm(term)}
                className="border border-gray-200 text-gray-600 text-xs font-garamond py-1.5 px-4 hover:border-gray-800 hover:text-gray-900 transition-colors rounded-full cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Case 4: Default / Empty state before searching */}
      {!query && (
        <div className="w-full max-w-xl text-center">
          <h2 className="text-[11px] font-medium tracking-widest text-gray-400 uppercase mb-6">
            POPULAR SEARCHES
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {POPULAR_SEARCHES.map((term) => (
              <button 
                key={term}
                onClick={() => handleSelectTerm(term)}
                className="border border-gray-200 text-gray-600 text-xs font-garamond py-2 px-5 hover:border-gray-800 hover:text-gray-900 transition-all rounded-full cursor-pointer hover:bg-gray-50"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar variant="dark" />
      <Suspense fallback={
        <div className="pt-44 text-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
        </div>
      }>
        <SearchContent />
      </Suspense>
      <Footer />
    </main>
  );
}
