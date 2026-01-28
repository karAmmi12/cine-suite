import type { SearchResult, ChatMessage, MailMessage } from "../types/schema";

interface AIResponse {
  results: {
    title: string;
    url: string;
    snippet: string;
    pageContent: string;
  }[];
}

export const generateFakeResults = async (
  query: string, 
  apiKey: string, 
  count: number = 5,
  context: string = "general"
): Promise<SearchResult[]> => {
  
  if (!apiKey) throw new Error("Clé API manquante");

  // Prompt optimisé pour Llama 3 (Groq)
  const prompt = `
    Tu es un assistant pour le cinéma. Génère ${count} faux résultats de recherche Google réalistes pour la recherche : "${query}".
    Contexte du scénario : ${context}.
    
    Pour chaque résultat, invente :
    1. Un titre accrocheur.
    2. Une URL crédible (courte, pas de https://).
    3. Une description (snippet) de 2 lignes.
    4. Le contenu complet de l'article (pageContent) en HTML simple (<h1>, <p>, <ul>). Environ 150 mots.

    IMPORTANT : Tu dois répondre UNIQUEMENT avec un objet JSON valide. Pas de texte avant ni après.
    Format attendu :
    {
      "results": [
        { "title": "...", "url": "...", "snippet": "...", "pageContent": "..." }
      ]
    }
  `;

  try {
    // ON CHANGE L'URL ICI (Groq)
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        // Utilisation de Llama 3 (Rapide et gratuit sur Groq)
        model: "llama-3.3-70b-versatile", 
        messages: [
            { role: "system", content: "You are a helpful assistant that outputs JSON." }, // Consigne système pour forcer le JSON
            { role: "user", content: prompt }
        ],
        temperature: 0.7,
        // Force le mode JSON (Crucial pour éviter les erreurs de parsing)
        response_format: { type: "json_object" } 
      })
    });

    const data = await response.json();
    
    if (data.error) throw new Error(data.error.message);

    const jsonContent = data.choices[0].message.content;
    const parsed: AIResponse = JSON.parse(jsonContent);

    return parsed.results.map((r, i) => ({
      id: Date.now().toString() + i,
      type: i === 0 ? 'news' : 'organic',
      title: r.title,
      url: r.url,
      snippet: r.snippet,
      pageContent: r.pageContent
    }));

  } catch (error) {
    console.error("Erreur IA (Groq):", error);
    throw error;
  }
};

// --- GÉNÉRATION CHAT ---
export const generateFakeChat = async (
  promptUser: string, 
  apiKey: string, 
  contactName: string
): Promise<ChatMessage[]> => {
  
  const prompt = `
    Génère une conversation SMS réaliste et émotionnelle entre "Moi" et "${contactName}".
    Contexte : ${promptUser}.
    Génère environ 10 à 15 messages.
    Alterne entre "isMe": true (Moi) et "isMe": false (${contactName}).
    Utilise un langage SMS crédible (pas trop soutenu).
    
    Format JSON attendu :
    {
      "messages": [
        { "text": "Salut, ça va ?", "isMe": false, "time": "10:00" },
        { "text": "Pas trop non...", "isMe": true, "time": "10:02" }
      ]
    }
  `;

  // On réutilise la même logique d'appel (copier-coller de l'autre fonction)
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
          { role: "system", content: "Output JSON only." },
          { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    })
  });

  const data = await response.json();
  const parsed = JSON.parse(data.choices[0].message.content);

  return parsed.messages.map((m: any, i: number) => ({
    id: Date.now().toString() + i,
    isMe: m.isMe,
    text: m.text,
    time: m.time,
    status: 'read'
  }));
};

// --- GÉNÉRATION MAIL ---
export const generateFakeEmails = async (
  promptUser: string, 
  apiKey: string
): Promise<MailMessage[]> => {
  
  const prompt = `
    Génère une liste de 5 à 8 emails pour une fausse boîte de réception.
    Contexte : ${promptUser}.
    Varie les expéditeurs (certains sérieux, certains spams, certains personnels).
    Certains doivent être lus (read: true), d'autres non (read: false).
    
    Format JSON attendu :
    {
      "emails": [
        { "senderName": "...", "senderEmail": "...", "subject": "...", "body": "...", "date": "10:30", "read": false }
      ]
    }
  `;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
          { role: "system", content: "Output JSON only." },
          { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    })
  });

  const data = await response.json();
  const parsed = JSON.parse(data.choices[0].message.content);

  return parsed.emails.map((m: any, i: number) => ({
    id: Date.now().toString() + i,
    folder: 'inbox',
    senderName: m.senderName,
    senderEmail: m.senderEmail,
    subject: m.subject,
    preview: m.body.substring(0, 50) + "...",
    body: m.body,
    date: m.date,
    read: m.read
  }));
};