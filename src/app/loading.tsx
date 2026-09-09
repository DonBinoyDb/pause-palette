export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Sleek Spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-2 border-gray-100 rounded-full"></div>
          <div className="absolute inset-0 border-2 border-transparent border-t-gray-800 rounded-full animate-spin"></div>
        </div>
        
        {/* Loading Text */}
        <p className="font-serif text-sm tracking-[0.2em] text-gray-800 uppercase animate-pulse">
          Loading
        </p>
      </div>
    </div>
  );
}
