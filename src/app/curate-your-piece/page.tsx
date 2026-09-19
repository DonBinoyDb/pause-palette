import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Configurator from "@/components/curate/Configurator";

export default function CurateYourPiecePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar variant="dark" />
      
      <main className="flex-1 pt-24 md:pt-32 pb-16 md:pb-24">
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center">
          <h1 className="font-serif text-2xl md:text-3xl tracking-wide uppercase text-center mb-4 md:mb-6 text-gray-900">
            CURATE YOUR PIECE
          </h1>
          <p className="text-sm md:text-base font-sans text-gray-600 text-center max-w-2xl mx-auto mb-10 md:mb-16 leading-relaxed">
            Create a Pause Palette piece that reflects your style and individuality through curated choices on Custom fit silhouette, details and detail.
          </p>
          
          <Configurator />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
