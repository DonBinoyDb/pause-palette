import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white text-gray-800 pt-24 pb-12 border-t border-gray-100 mt-auto">
      <div className="container mx-auto px-12 md:px-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-24">
          
          {/* Column 1: Logo & Description */}
          <div className="md:col-span-5">
            <div className="flex flex-col items-center w-fit mb-4">
              <span className="font-brand text-4xl leading-none">Pause</span>
              <span className="font-brand text-4xl leading-none -mt-1 translate-x-[-4px] translate-y-[-9px]">
                palette<span className="inline-block w-[5px] h-[5px] rounded-full bg-current ml-[2px]"></span>
              </span>
            </div>
            <p className="font-serif italic text-gray-600 mb-4 text-[15px]">
              From Our Sketchbook to your Soul.
            </p>
            <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
              Every Pause Palette piece begins with an original hand-drawn illustration, thoughtfully transformed through print, embroidery, and timeless craftsmanship.
            </p>
          </div>
          
          {/* Column 2: CUSTOMER CARE */}
          <div className="md:col-span-3">
            <h3 className="text-[11px] tracking-[0.15em] text-gray-500 uppercase mb-6">CUSTOMER CARE</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-gray-900 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Shipping & Delivery</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Returns & Exchanges</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">FAQs</a></li>
            </ul>
          </div>
          
          {/* Column 3: STAY IN THE STORY */}
          <div className="md:col-span-4">
            <h3 className="text-[11px] tracking-[0.15em] text-gray-500 uppercase mb-4">STAY IN THE STORY</h3>
            <p className="font-serif italic text-gray-600 mb-6 text-[15px]">
              New pieces, new stories, and notes from<br/>our making journal.
            </p>
            <div className="flex items-center border-b border-gray-300 pb-2">
              <input 
                type="email" 
                suppressHydrationWarning
                placeholder="Enter Email Address" 
                className="bg-transparent outline-none text-sm w-full italic text-gray-400 placeholder-gray-400"
              />
              <button suppressHydrationWarning className="text-[11px] tracking-[0.1em] text-gray-500 uppercase hover:text-gray-900 transition-colors ml-4 shrink-0">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
          <div>© 2026 Pause Palette</div>
          <div className="flex gap-16">
            <Link href="/privacy-policy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
            <Link href="/terms-and-conditions" className="hover:text-gray-900 transition-colors">Terms & Conditions</Link>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-900 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="#" className="hover:text-gray-900 transition-colors" aria-label="Pinterest">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.163 0 7.398 2.967 7.398 6.923 0 4.136-2.607 7.462-6.227 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
