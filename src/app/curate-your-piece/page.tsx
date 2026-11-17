import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Configurator from "@/components/curate/Configurator";

export default function CurateYourPiecePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar variant="dark" />
      
      <main className="flex-1 pt-24 md:pt-32 pb-16 md:pb-24">
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center">
          <h1 className="font-garamond text-[14px] text-gray-500 font-medium tracking-[0.1em] uppercase text-center mb-3">
            Curate Your Piece
          </h1>
          <p className="text-[15px] md:text-[16.5px] font-garamond text-gray-600 text-center max-w-2xl mx-auto mb-10 md:mb-14 leading-relaxed">
            Create a Pause Piece tailored that reflects your style and individuality through thoughtful choices of silhouette, custom embroidery, and artisanal detail.
          </p>
          
          <Configurator />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
