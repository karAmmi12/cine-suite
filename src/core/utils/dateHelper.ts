/**
 * Utilitaires pour extraire et formater des dates à partir de prompts
 */

interface DateContext {
  period?: string;
  year?: number;
  month?: number;
  day?: number;
  era?: string;
  instruction: string;
}

/**
 * Extrait le contexte temporel d'un prompt
 * Exemples:
 * - "en 2024" → { year: 2024 }
 * - "le 15 janvier 2023" → { year: 2023, month: 1, day: 15 }
 * - "dans les années 90" → { period: "années 90", era: "1990s" }
 */
export function extractDateContext(prompt: string): DateContext {
  const lowerPrompt = prompt.toLowerCase();
  
  // Années spécifiques: "en 2024", "année 2024", "2024"
  const yearMatch = lowerPrompt.match(/(?:en |année |l'année )?(\d{4})/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    if (year >= 1990 && year <= 2030) {
      return {
        year,
        instruction: `Toutes les dates doivent être en ${year}. Utilise le format français pour les dates.`
      };
    }
  }
  
  // Dates complètes: "le 15 janvier 2023", "15/01/2023"
  const fullDateMatch = lowerPrompt.match(/(?:le )?(\d{1,2})\s*(?:\/|janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s*(\d{4})?/i);
  if (fullDateMatch) {
    const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    const monthIndex = monthNames.findIndex(m => lowerPrompt.includes(m));
    
    return {
      day: parseInt(fullDateMatch[1]),
      month: monthIndex !== -1 ? monthIndex + 1 : undefined,
      year: fullDateMatch[2] ? parseInt(fullDateMatch[2]) : new Date().getFullYear(),
      instruction: `La date de référence est le ${fullDateMatch[0]}. Les dates doivent être proches de cette période.`
    };
  }
  
  // Périodes: "années 90", "années 2000", "début des années 2010"
  const decadeMatch = lowerPrompt.match(/années?\s*(\d{2,4})/);
  if (decadeMatch) {
    let decade = parseInt(decadeMatch[1]);
    if (decade < 100) decade += 1900; // "90" → 1990
    
    return {
      period: `années ${decade}`,
      year: decade,
      era: `${decade}s`,
      instruction: `Le contexte est les années ${decade}. Adapte les technologies, le langage et les dates à cette époque.`
    };
  }
  
  // Époques: "début 2000", "fin 2010", "mi-2015"
  const eraMatch = lowerPrompt.match(/(début|fin|mi[-\s]?)(\d{4})/);
  if (eraMatch) {
    const year = parseInt(eraMatch[2]);
    const position = eraMatch[1];
    
    let month = 6;
    if (position === 'début') month = 2;
    if (position === 'fin') month = 11;
    
    return {
      year,
      month,
      instruction: `La période est ${position} ${year}. Les dates doivent refléter cette temporalité.`
    };
  }
  
  // Périodes relatives: "il y a 2 ans", "il y a 6 mois"
  const relativeMatch = lowerPrompt.match(/il y a (\d+)\s*(an|mois|semaine|jour)s?/);
  if (relativeMatch) {
    const amount = parseInt(relativeMatch[1]);
    const unit = relativeMatch[2];
    const now = new Date();
    
    if (unit === 'an') now.setFullYear(now.getFullYear() - amount);
    else if (unit === 'mois') now.setMonth(now.getMonth() - amount);
    else if (unit === 'semaine') now.setDate(now.getDate() - (amount * 7));
    else if (unit === 'jour') now.setDate(now.getDate() - amount);
    
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      instruction: `La date de référence est il y a ${amount} ${unit}${amount > 1 ? 's' : ''}, soit environ ${now.toLocaleDateString('fr-FR')}.`
    };
  }
  
  // Par défaut: aujourd'hui
  const today = new Date();
  return {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
    instruction: `Utilise la date actuelle (${today.toLocaleDateString('fr-FR')}) comme référence.`
  };
}

/**
 * Génère une date formatée selon le contexte
 */
export function formatDateForContext(context: DateContext, offsetDays: number = 0): string {
  const year = context.year || new Date().getFullYear();
  const month = context.month || 1;
  const day = context.day || 1;
  
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + offsetDays);
  
  // Format français: "15 janvier 2024"
  const options: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  };
  
  return date.toLocaleDateString('fr-FR', options);
}

/**
 * Génère une date courte selon le contexte
 */
export function formatShortDateForContext(context: DateContext, offsetDays: number = 0): string {
  const year = context.year || new Date().getFullYear();
  const month = context.month || 1;
  const day = context.day || 1;
  
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + offsetDays);
  
  // Format court: "15/01/2024"
  return date.toLocaleDateString('fr-FR');
}

/**
 * Génère un timestamp ISO selon le contexte
 */
export function formatISOForContext(context: DateContext, offsetDays: number = 0): string {
  const year = context.year || new Date().getFullYear();
  const month = context.month || 1;
  const day = context.day || 1;
  
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + offsetDays);
  
  return date.toISOString();
}
