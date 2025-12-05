
import React, { useState, useRef } from 'react';
import BrutalistButton from './ui/BrutalistButton';
import BrutalistCard from './ui/BrutalistCard';
import { editWorkoutImage } from '../services/geminiService';
import { Camera, Wand2, Upload } from 'lucide-react';

const ImageRoaster: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!image || !prompt) return;
    setLoading(true);
    const result = await editWorkoutImage(image, prompt);
    if (result) {
      setImage(result);
    }
    setLoading(false);
  };

  return (
    <BrutalistCard title="Proof of Sweat" color="white" className="mb-8">
      <div className="flex flex-col gap-4">
        <p className="font-mono text-sm">Upload proof or it didn't happen. Then ask AI to make it epic.</p>
        
        <div className="relative aspect-square w-full bg-gray-200 border-4 border-black flex items-center justify-center overflow-hidden group rounded-xl">
          {image ? (
            <img src={image} alt="Workout proof" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-4">
              <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <span className="text-gray-500 font-bold uppercase">No Image</span>
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*"
            className="hidden"
          />
          
          <div className="absolute bottom-0 right-0 p-2">
            <BrutalistButton 
              label="Upload" 
              variant="secondary" 
              className="py-1 px-3 text-xs" 
              onClick={() => fileInputRef.current?.click()}
            />
          </div>
        </div>

        {image && (
          <div className="flex flex-col gap-2">
            <label className="font-bold uppercase text-xs">AI Edit Prompt</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Add a retro VHS filter..."
                className="flex-1 border-4 border-black p-2 font-mono text-sm focus:outline-none focus:bg-yellow-100 rounded-xl"
              />
              <button 
                onClick={handleEdit}
                disabled={loading}
                className="bg-punch-blue text-white p-2 hover:bg-blue-700 disabled:opacity-50 rounded-xl"
              >
                {loading ? <span className="animate-spin">⏳</span> : <Wand2 />}
              </button>
            </div>
            <div className="flex gap-2 flex-wrap mt-2">
                <span className="text-xs font-bold mr-2">Quick Prompts:</span>
                {['Make it retro', 'Add explosion', 'Make me buff'].map(p => (
                    <button key={p} onClick={() => setPrompt(p)} className="text-xs underline hover:bg-yellow-200 rounded-lg px-1">{p}</button>
                ))}
            </div>
          </div>
        )}
      </div>
    </BrutalistCard>
  );
};

export default ImageRoaster;
