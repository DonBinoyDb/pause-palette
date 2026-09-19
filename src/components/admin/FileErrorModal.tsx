import { X, AlertCircle } from "lucide-react";

interface FileErrorModalProps {
  error: string | null;
  onClose: () => void;
}

export default function FileErrorModal({ error, onClose }: FileErrorModalProps) {
  if (!error) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col animate-in fade-in zoom-in duration-200 overflow-hidden">
        
        <div className="bg-red-50 p-6 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">File Too Large</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {error}
          </p>
        </div>

        <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-center">
          <button 
            onClick={onClose}
            className="w-full py-2.5 bg-gray-900 text-white rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors"
          >
            Got it
          </button>
        </div>
        
      </div>
    </div>
  );
}
