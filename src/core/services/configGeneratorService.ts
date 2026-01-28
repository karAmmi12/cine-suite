/**
 * Service de génération automatique de configurations via IA
 * Utilise l'API Groq pour créer des configurations réalistes et cohérentes
 */

import type { SearchModuleConfig, ChatModuleConfig, MailModuleConfig } from '../types/schema';
import { extractDateContext } from '../utils/dateHelper';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

interface GeneratorOptions {
  apiKey: string;
  context?: string; // Contexte narratif (ex: "Thriller technologique, personnage hacké")
  tone?: 'professional' | 'casual' | 'dramatic' | 'comedic';
  locale?: 'fr' | 'en';
}

/**
 * Génère une configuration complète pour le module Search
 */
export async function generateSearchConfig(
  prompt: string,
  options: GeneratorOptions
): Promise<SearchModuleConfig> {
  const dateContext = extractDateContext(prompt);
  
  const systemPrompt = `Tu es un expert en création de scènes réalistes pour le cinéma. 
Génère une configuration JSON VALIDE pour un moteur de recherche fictif mais crédible.

Le JSON doit contenir:
- brandName, theme, triggerText (ce que l'acteur tape)
- results (minimum 8 résultats)

Chaque résultat doit avoir:
- id, type, title, url, snippet, date, favicon
- pageContent: contenu textuel riche et détaillé (200-500 mots)
- pageConfig (OBLIGATOIRE): {
    layout: "article"|"blog"|"news"|"forum"|"wiki",
    headerImage: URL d'une image de bannière (optionnel),
    contentImages: [{url, caption, position: "top"|"inline"|"side"|"bottom", width: "small"|"medium"|"large"|"full"}],
    style: {primaryColor, font: "serif"|"sans-serif"|"mono", textSize: "small"|"medium"|"large", spacing: "compact"|"normal"|"relaxed"},
    sidebar: {type: "author"|"related"|"ads"|"toc"|"none", content: "description si author"},
    metadata: {category, tags[], views, comments, lastModified}
  }

IMPORTANT - Contexte temporel: ${dateContext.instruction}
${options.context ? `Contexte narratif: ${options.context}` : ''}

EXEMPLE SIMPLIFIÉ:
{
  "brandName": "SearchPro",
  "theme": "modern",
  "triggerText": "recherche test",
  "results": [{
    "id": "1",
    "type": "organic",
    "title": "Article de test",
    "url": "https://example.com/article",
    "snippet": "Description courte...",
    "date": "15 janvier 2024",
    "pageContent": "Contenu complet de l'article avec plusieurs paragraphes détaillés...",
    "pageConfig": {
      "layout": "article",
      "headerImage": "https://picsum.photos/1200/400",
      "contentImages": [
        {"url": "https://picsum.photos/800/600", "caption": "Illustration principale", "position": "top", "width": "large"}
      ],
      "style": {"primaryColor": "#2563eb", "font": "serif", "textSize": "medium", "spacing": "relaxed"},
      "sidebar": {"type": "author", "content": "Expert dans le domaine depuis 10 ans"},
      "metadata": {"category": "Technologie", "tags": ["web", "dev"], "views": "12.5K", "comments": 45}
    }
  }]
}

Réponds UNIQUEMENT avec du JSON valide complet, sans markdown ni explication.`;

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${options.apiKey}`
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 4000
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Erreur API (${response.status}): Vérifiez votre clé API`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error("L'IA n'a pas retourné de réponse. Réessayez.");
  }
  
  // Parser le JSON (enlever les backticks markdown si présents)
  let jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    // Tentative de nettoyage si markdown
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  }
  
  if (!jsonMatch) {
    throw new Error("❌ L'IA n'a pas retourné de données exploitables. Reformulez votre demande.");
  }
  
  let config;
  try {
    config = JSON.parse(jsonMatch[0]);
  } catch (e) {
    throw new Error("❌ Format de réponse invalide. Simplifiez votre description.");
  }
  
  // Validation et normalisation
  return {
    type: 'search',
    triggerText: config.triggerText || '',
    brandName: config.brandName || 'SearchEngine',
    theme: config.theme || 'modern',
    results: (config.results || []).map((r: any, i: number) => ({
      id: r.id || `result-${i}`,
      type: r.type || 'organic',
      title: r.title || '',
      url: r.url || '',
      snippet: r.snippet || '',
      date: r.date,
      favicon: r.favicon,
      imageUrl: r.imageUrl,
      author: r.author,
      readTime: r.readTime,
      pageContent: r.pageContent || `<h1>${r.title}</h1><p>${r.snippet}</p>`,
      pageConfig: r.pageConfig ? {
        layout: r.pageConfig.layout || 'article',
        headerImage: r.pageConfig.headerImage,
        contentImages: r.pageConfig.contentImages || [],
        style: r.pageConfig.style || {},
        sidebar: r.pageConfig.sidebar,
        metadata: r.pageConfig.metadata
      } : undefined
    }))
  };
}

/**
 * Génère une configuration complète pour le module Chat
 */
export async function generateChatConfig(
  prompt: string,
  options: GeneratorOptions
): Promise<ChatModuleConfig> {
  const dateContext = extractDateContext(prompt);
  
  const systemPrompt = `Tu es un expert en création de conversations réalistes pour le cinéma.
Génère une configuration JSON VALIDE pour une conversation de messagerie.
Le JSON doit contenir: contactName, contactPhone, contactStatus, theme, triggerText (le message que l'acteur va taper), messagesHistory (minimum 5 messages précédents).
Chaque message doit avoir: id, isMe (boolean), text, time (format "HH:MM"), status.

IMPORTANT - Contexte temporel: ${dateContext.instruction}
${options.context ? `Contexte narratif: ${options.context}` : ''}

Rends la conversation naturelle avec des fautes de frappe occasionnelles, des emojis, et un ton ${options.tone || 'casual'}.
Adapte le langage et les références culturelles à l'époque demandée.
Réponds UNIQUEMENT avec du JSON valide, sans markdown ni explication.`;

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${options.apiKey}`
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.9,
      max_tokens: 3000
    })
  });

  if (!response.ok) {
    throw new Error(`Erreur API Groq: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '{}';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Impossible de parser la réponse IA');
  
  const config = JSON.parse(jsonMatch[0]);
  
  return {
    type: 'chat',
    triggerText: config.triggerText || config.messageToType || '',
    messageToType: config.triggerText || config.messageToType || '',
    contactName: config.contactName || 'Contact',
    contactPhone: config.contactPhone,
    contactAvatar: config.contactAvatar,
    contactStatus: config.contactStatus || 'En ligne',
    theme: config.theme || 'whatsapp',
    messagesHistory: (config.messagesHistory || []).map((m: any, i: number) => ({
      id: m.id || `msg-${i}`,
      isMe: m.isMe || false,
      text: m.text || '',
      time: m.time || '12:00',
      status: m.status || 'read',
      mediaUrl: m.mediaUrl,
      mediaType: m.mediaType,
      reactions: m.reactions
    }))
  };
}

/**
 * Génère une configuration complète pour le module Mail
 */
export async function generateMailConfig(
  prompt: string,
  options: GeneratorOptions
): Promise<MailModuleConfig> {
  const dateContext = extractDateContext(prompt);
  
  const systemPrompt = `Tu es un expert en création d'emails réalistes pour le cinéma.
Génère une configuration JSON VALIDE pour une boîte mail.
Le JSON doit contenir: userEmail, userName, provider, triggerText (objet du mail à écrire), emails (minimum 6 emails dans la boîte).
Chaque email doit avoir: id, senderName, senderEmail, subject, preview, body (HTML), date, read, starred, important, labels, folder.

IMPORTANT - Contexte temporel: ${dateContext.instruction}
${options.context ? `Contexte narratif: ${options.context}` : ''}

Rends les emails crédibles avec des signatures, formatage HTML, et détails professionnels.
Adapte le style des emails, les technologies mentionnées et le langage à l'époque demandée.
Réponds UNIQUEMENT avec du JSON valide, sans markdown ni explication.`;

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${options.apiKey}`
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 4000
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Erreur API (${response.status}): Vérifiez votre clé API`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error("L'IA n'a pas retourné de réponse. Réessayez.");
  }
  
  let jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  }
  
  if (!jsonMatch) {
    throw new Error("❌ L'IA n'a pas retourné de données exploitables. Reformulez votre demande.");
  }
  
  let config;
  try {
    config = JSON.parse(jsonMatch[0]);
  } catch (e) {
    throw new Error("❌ Format de réponse invalide. Simplifiez votre description.");
  }
  
  return {
    type: 'mail',
    triggerText: config.triggerText || '',
    userEmail: config.userEmail || 'user@example.com',
    userName: config.userName,
    userAvatar: config.userAvatar,
    provider: config.provider || 'gmail',
    emails: (config.emails || []).map((e: any, i: number) => ({
      id: e.id || `mail-${i}`,
      senderName: e.senderName || 'Unknown',
      senderEmail: e.senderEmail || 'unknown@example.com',
      subject: e.subject || '',
      preview: e.preview || '',
      body: e.body || '',
      date: e.date || 'Aujourd\'hui',
      read: e.read ?? true,
      starred: e.starred || false,
      important: e.important || false,
      labels: e.labels || [],
      attachments: e.attachments,
      threadId: e.threadId,
      folder: e.folder || 'inbox'
    })),
    inboxCount: config.inboxCount || 0
  };
}

/**
 * Génère du contenu additionnel pour enrichir une configuration existante
 */
export async function enrichConfiguration(
  type: 'search' | 'chat' | 'mail',
  currentConfig: any,
  enrichmentPrompt: string,
  options: GeneratorOptions
): Promise<any> {
  const systemPrompts = {
    search: 'Génère 3-5 résultats de recherche supplémentaires au format JSON array. Chaque résultat doit être cohérent avec le contexte existant.',
    chat: 'Génère 2-4 messages supplémentaires pour la conversation au format JSON array. Respecte le ton et le contexte.',
    mail: 'Génère 2-3 emails supplémentaires au format JSON array. Respecte le style et le contexte professionnel.'
  };

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${options.apiKey}`
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompts[type] },
        { role: 'user', content: `Contexte actuel: ${JSON.stringify(currentConfig)}\n\nDemande: ${enrichmentPrompt}` }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    throw new Error(`Erreur API Groq: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '[]';
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  
  if (!jsonMatch) return [];
  return JSON.parse(jsonMatch[0]);
}
