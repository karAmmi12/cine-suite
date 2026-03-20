import { useState } from 'react';
import { Monitor, Smartphone, Gamepad2 } from 'lucide-react';
import { useNetworkStore } from '../core/store/networkStore';
import { useNavigate } from 'react-router-dom';

export const RoleSelector = () => {
  const { setAppMode, setRoomId, deviceType } = useNetworkStore();
  const [selectedMode, setSelectedMode] = useState<'controller' | 'screen' | null>(null);
  const [roomInput, setRoomInput] = useState('123'); // Valeur par défaut
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!selectedMode) {
      alert('Veuillez sélectionner un mode');
      return;
    }

    if (!roomInput.trim()) {
      alert('Veuillez entrer un ID de room');
      return;
    }

    // Sauvegarder les paramètres
    setAppMode(selectedMode);
    setRoomId(roomInput.trim());

    // Rediriger selon le mode
    if (selectedMode === 'controller') {
      navigate(`/controller/${roomInput.trim()}`);
    } else {
      navigate(`/screen/${roomInput.trim()}`);
    }
  };

  const handleStandalone = () => {
    setAppMode('standalone');
    setRoomId(null);
    navigate('/projects');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full cine-panel rounded-3xl p-8 animate-soft-reveal">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#d1b374] mb-3">
            CineSuite
          </h1>
          <p className="text-[#a9a49b] text-lg">
            Architecture flexible • Contrôle à distance
          </p>
        </div>

        {/* Device Info */}
        <div className="bg-black/20 rounded-xl p-4 mb-6 text-center border border-[#b4975e]/20">
          <div className="flex items-center justify-center gap-2 text-[#c8c3bb]">
            {deviceType === 'mobile' ? <Smartphone size={20} /> : <Monitor size={20} />}
            <span className="capitalize">{deviceType} détecté</span>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="space-y-4 mb-6">
          <h2 className="text-[#ebe7df] font-semibold text-xl mb-4">Choisissez votre rôle :</h2>
          
          {/* Controller Mode */}
          <button
            onClick={() => setSelectedMode('controller')}
            className={`w-full p-6 rounded-2xl border-2 transition-all ${
              selectedMode === 'controller'
                ? 'bg-[#b4975e]/15 border-[#d1b374] scale-[1.02]'
                : 'bg-white/5 border-white/15 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${selectedMode === 'controller' ? 'bg-[#b4975e] text-[#1f1a12]' : 'bg-white/10'}`}>
                <Gamepad2 size={32} className="text-white" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-[#ebe7df] font-bold text-lg">Mode CONTROLLER</h3>
                <p className="text-[#a9a49b] text-sm mt-1">
                  Contrôlez d'autres appareils avec des boutons d'action
                </p>
              </div>
            </div>
          </button>

          {/* Screen Mode */}
          <button
            onClick={() => setSelectedMode('screen')}
            className={`w-full p-6 rounded-2xl border-2 transition-all ${
              selectedMode === 'screen'
                ? 'bg-[#b4975e]/15 border-[#d1b374] scale-[1.02]'
                : 'bg-white/5 border-white/15 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${selectedMode === 'screen' ? 'bg-[#b4975e] text-[#1f1a12]' : 'bg-white/10'}`}>
                <Monitor size={32} className="text-white" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-[#ebe7df] font-bold text-lg">Mode SCREEN</h3>
                <p className="text-[#a9a49b] text-sm mt-1">
                  Affichez le contenu et réagissez aux commandes reçues
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Room ID Input */}
        {selectedMode && (
          <div className="mb-6 animate-fade-in">
            <label className="block text-[#ebe7df] font-semibold mb-2">
              ID de la Room (SceneID) :
            </label>
            <input
              type="text"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              placeholder="Ex: project-123-scene-456"
              className="w-full px-4 py-3 rounded-xl bg-black/25 border-2 border-[#b4975e]/20 text-[#ebe7df] placeholder-[#8f8a81] focus:outline-none focus:border-[#b4975e]/60 transition-all"
            />
            <p className="text-[#8f8a81] text-xs mt-2">
              Tous les appareils avec le même SceneID seront synchronisés
            </p>
          </div>
        )}

        {/* Continue Button */}
        {selectedMode && (
          <button
            onClick={handleContinue}
            className="w-full py-4 cine-button-primary font-bold rounded-xl shadow-lg transition-all"
          >
            Continuer →
          </button>
        )}

        {/* Standalone Option */}
        <div className="mt-6 pt-6 border-t border-[#b4975e]/20 text-center">
          <button
            onClick={handleStandalone}
            className="text-[#a9a49b] hover:text-[#ebe7df] text-sm transition-colors"
          >
            Mode autonome (sans réseau)
          </button>
        </div>
      </div>
    </div>
  );
};
