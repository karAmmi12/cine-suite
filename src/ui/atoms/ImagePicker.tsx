import { useRef } from 'react';
import { Image as ImageIcon, Trash, Upload } from 'lucide-react';
import { convertFileToBase64 } from '../../core/utils/fileHandler';

interface ImagePickerProps {
  label: string;
  value?: string; // L'image actuelle (Base64)
  onChange: (base64: string | undefined) => void;
}

export const ImagePicker = ({ label, value, onChange }: ImagePickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await convertFileToBase64(file);
        onChange(base64);
      } catch (err) {
        alert(err);
      }
    }
  };

  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
      
      <div className="flex items-center gap-4">
        {/* Aperçu de l'image */}
        <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden relative group">
          {value ? (
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="text-gray-400" />
          )}
        </div>

        {/* Boutons */}
        <div className="flex flex-col gap-2">
          <input 
            type="file" 
            ref={inputRef} 
            onChange={handleFile} 
            accept="image/*" 
            className="hidden" 
          />
          
          <button 
            onClick={() => inputRef.current?.click()}
            className="text-xs flex items-center gap-1 bg-white border border-gray-300 px-2 py-1 rounded hover:bg-gray-50"
          >
            <Upload size={12} /> Choisir image
          </button>

          {value && (
            <button 
              onClick={() => onChange(undefined)}
              className="text-xs flex items-center gap-1 text-red-500 hover:text-red-700 px-2 py-1"
            >
              <Trash size={12} /> Supprimer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};