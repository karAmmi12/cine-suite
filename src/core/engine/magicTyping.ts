import { useState, useEffect, useCallback } from 'react';

export const useMagicTyping = (targetText: string, active: boolean = true) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  // Fonction pour ajouter des caractères
  const addChars = useCallback((count: number = 1) => {
    setDisplayValue((prev) => {
      const nextIndex = prev.length + count;
      if (nextIndex >= targetText.length) {
        setIsComplete(true);
        return targetText;
      }
      return targetText.slice(0, nextIndex);
    });
  }, [targetText]);

  useEffect(() => {
    if (!active) return;

    // 1. Gestion Clavier (Ordinateur)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        setDisplayValue(targetText);
        setIsComplete(true);
        return;
      }
      if (e.key === 'Backspace') {
        setDisplayValue((prev) => prev.slice(0, -1));
        setIsComplete(false);
        return;
      }
      // Ignore les touches de commande (Ctrl, Alt, etc.)
      if (e.key.length === 1) { 
        addChars(1);
      }
    };

    // 2. Gestion Tactile (Mobile)
    // On ajoute 2-3 caractères par tap pour que ça aille plus vite sur mobile
    const handleTouch = (e: TouchEvent) => {
      // On vérifie qu'on ne touche pas un bouton ou un lien
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button')) return;
      
      addChars(3); 
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouch);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouch);
    };
  }, [targetText, active, addChars]);

  return { displayValue, isComplete };
};