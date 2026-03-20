import React, { useState } from 'react';
import { X, Play } from 'lucide-react';
import { sceneTemplatesData, type SceneTemplateData } from '../data/sceneTemplatesData';
import { getModuleIcon } from '../core/utils/moduleHelpers';

interface SceneTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: SceneTemplateData) => void;
}

export const SceneTemplates: React.FC<SceneTemplatesProps> = ({ isOpen, onClose, onSelectTemplate }) => {
  const [filter, setFilter] = useState<'all' | 'search' | 'chat' | 'mail' | 'terminal'>('all');

  const filteredTemplates = filter === 'all' 
    ? sceneTemplatesData 
    : sceneTemplatesData.filter(t => t.type === filter);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-linear-to-r from-indigo-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                🎬 Bibliothèque de scènes
              </h2>
              <p className="text-indigo-100 mt-1">
                8 scènes prêtes à tourner pour vos projets
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <X size={24} />
            </button>
          </div>

          {/* Filtres */}
          <div className="flex gap-2 mt-4">
            {[
              { id: 'all', label: 'Toutes', icon: '🎭' },
              { id: 'search', label: 'Recherche', icon: '🔍' },
              { id: 'chat', label: 'Chat', icon: '💬' },
              { id: 'mail', label: 'Email', icon: '📧' },
              { id: 'terminal', label: 'Terminal', icon: '⌨️' }
            ].map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setFilter(id as any)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === id
                    ? 'bg-white text-indigo-600 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    onSelectTemplate(template);
                    onClose();
                  }}
                  className="group p-5 bg-gray-50 hover:bg-white border-2 border-gray-200 hover:border-indigo-500 rounded-xl text-left transition-all hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                      {getModuleIcon(template.type, 24)}
                    </div>
                    <Play size={20} className="text-gray-400 group-hover:text-indigo-600 transition" />
                  </div>
                  
                  <h3 className="font-bold text-gray-800 mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      {template.type.toUpperCase()}
                    </span>
                    <span>•</span>
                    <span>Prêt à tourner</span>
                  </div>
                </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
