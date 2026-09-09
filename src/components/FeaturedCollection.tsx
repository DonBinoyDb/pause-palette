import Image from "next/image";
import Link from "next/link";

const products = [
  {
    id: 1,
    name: "Linen Blend Blazer",
    price: "$120",
    image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?q=80&w=1974&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Classic White Tee",
    price: "$45",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Pleated Trousers",
    price: "$95",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1994&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Silk Evening Dress",
    price: "$210",
    image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=2071&auto=format&fit=crop",
  },
];

export default function FeaturedCollection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Curated Essentials</h2>
            <p className="text-muted-foreground max-w-xl">
              Elevate your wardrobe with our latest selection of timeless pieces designed for modern living.
            </p>
          </div>
          <Link href="/collections" className="hidden md:inline-block text-sm font-medium border-b border-foreground pb-1 hover:text-accent hover:border-accent transition-colors">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product.id} className="group cursor-pointer">
              <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-4 rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg">{product.name}</h3>
                  <p className="text-muted-foreground">{product.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center md:hidden">
          <Link href="/collections" className="inline-block border border-foreground px-8 py-3 rounded-full text-sm font-medium hover:bg-foreground hover:text-background transition-colors">
            View All Collection
          </Link>
        </div>
      </div>
    </section>
  );
}
