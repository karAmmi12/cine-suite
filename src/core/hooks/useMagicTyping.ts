import { useState, useEffect } from 'react';

export const useMagicTyping = (targetText: string, active: boolean = true) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Si on appuie sur Entrée, on considère que c'est fini
      if (e.key === 'Enter') {
        setDisplayValue(targetText);
        setIsComplete(true);
        return;
      }

      // Si on appuie sur Backspace (effacer)
      if (e.key === 'Backspace') {
        setDisplayValue((prev) => prev.slice(0, -1));
        setIsComplete(false);
        return;
      }

      // Pour n'importe quelle autre touche (lettres, chiffres, espace...)
      // On ajoute le PROCHAIN caractère du texte cible
      if (e.key.length === 1) { 
        setDisplayValue((prev) => {
          const nextIndex = prev.length;
          // Si on a déjà tout écrit, on ne fait rien
          if (nextIndex >= targetText.length) {
            setIsComplete(true);
            return prev;
          }
          return targetText.slice(0, nextIndex + 1);
        });
      }
    };

    // On écoute tout le document (pas besoin de cliquer dans l'input)
    window.addEventListener('keydown', handleKeyDown);

    // Nettoyage quand le composant est détruit
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [targetText, active]);

  return { displayValue, isComplete };
};