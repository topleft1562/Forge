interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

export const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, imageUrl }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-[90vw] max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-[#1E1E1E] text-white flex items-center justify-center hover:bg-[#01a8dd] transition-colors"
        >
          ×
        </button>
        <img
          src={imageUrl}
          alt="Full size"
          className="rounded-xl max-w-full max-h-[90vh] object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}; 