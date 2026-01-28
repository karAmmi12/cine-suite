import { useState } from 'react';
import { Image as ImageIcon, Check } from 'lucide-react';

interface LocalImagePickerProps {
  label: string;
  value?: string;
  onChange: (path: string) => void;
  category?: 'header' | 'content';
}

// Images disponibles localement
const LOCAL_IMAGES = {
  header: [
    { path: '/images/headers/tech.jpg', name: 'Technologie' },
    { path: '/images/headers/news.jpg', name: 'Actualités' },
    { path: '/images/headers/business.jpg', name: 'Business' },
  ],
  content: [
    { path: '/images/content/image1.jpg', name: 'Image 1' },
    { path: '/images/content/image2.jpg', name: 'Image 2' },
    { path: '/images/content/image3.jpg', name: 'Image 3' },
  ]
};

export const LocalImagePicker = ({ label, value, onChange, category = 'content' }: LocalImagePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const images = LOCAL_IMAGES[category];

  return (
    <div className="relative">
      <label className="block text-xs font-bold text-gray-600 mb-2">{label}</label>
      
      {/* Preview actuelle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-32 rounded-lg border-2 border-gray-300 hover:border-blue-400 bg-gray-50 flex flex-col items-center justify-center gap-2 transition-colors overflow-hidden"
      >
        {value ? (
          <>
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 px-2">
              Cliquez pour changer
            </div>
          </>
        ) : (
          <>
            <ImageIcon className="text-gray-400" size={24} />
            <span className="text-xs text-gray-500">Cliquez pour choisir</span>
          </>
        )}
      </button>

      {/* Dropdown avec images */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 mt-2 w-full bg-white border-2 border-gray-300 rounded-lg shadow-xl p-3 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              {images.map((img) => (
                <button
                  key={img.path}
                  onClick={() => {
                    onChange(img.path);
                    setIsOpen(false);
                  }}
                  className={`relative group overflow-hidden rounded-lg border-2 transition-all ${
                    value === img.path 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="aspect-video relative">
                    <img 
                      src={img.path} 
                      alt={img.name}
                      className="w-full h-full object-cover"
                    />
                    {value === img.path && (
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                        <div className="bg-blue-500 text-white rounded-full p-1">
                          <Check size={16} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-center py-1 bg-gray-50 group-hover:bg-blue-50 transition-colors">
                    {img.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
