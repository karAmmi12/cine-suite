/**
 * 🛡️ VALIDATION SCHEMAS - Sécurité des données avec Zod
 * Valide tous les fichiers de configuration importés
 */

import { z } from 'zod';

// ==================== SEARCH MODULE ====================
export const searchResultSchema = z.object({
  id: z.string(),
  type: z.enum(['organic', 'ad', 'featured']),
  title: z.string(),
  url: z.string().url(),
  snippet: z.string(),
  author: z.string().optional(),
  date: z.string().optional(),
  readTime: z.string().optional(),
  pageContent: z.string().optional(),
  pageConfig: z.object({
    layout: z.enum(['article', 'blog', 'news', 'forum', 'wiki', 'ecommerce', 'portal']).optional(),
    headerImage: z.string().optional(),
    contentImages: z.array(z.object({
      url: z.string(),
      caption: z.string().optional(),
      position: z.enum(['top', 'inline', 'side', 'bottom']).optional(),
      width: z.enum(['small', 'medium', 'large', 'full']).optional(),
    })).optional(),
    style: z.object({
      primaryColor: z.string().optional(),
      font: z.enum(['serif', 'sans-serif', 'mono', 'cursive']).optional(),
      textSize: z.enum(['small', 'medium', 'large']).optional(),
      spacing: z.enum(['compact', 'normal', 'relaxed']).optional(),
    }).optional(),
    sidebar: z.object({
      type: z.enum(['ads', 'related', 'author', 'toc', 'none']).optional(),
      content: z.string().optional(),
    }).optional(),
    metadata: z.object({
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      views: z.string().optional(),
      comments: z.number().optional(),
      lastModified: z.string().optional(),
    }).optional(),
  }).optional(),
});

export const searchConfigSchema = z.object({
  query: z.string(),
  placeholder: z.string().optional(),
  results: z.array(searchResultSchema),
  suggestions: z.array(z.string()).optional(),
});

// ==================== CHAT MODULE ====================
export const chatMessageSchema = z.object({
  id: z.string(),
  sender: z.enum(['user', 'contact']),
  content: z.string(),
  timestamp: z.string(),
  status: z.enum(['sent', 'delivered', 'read']).optional(),
});

export const chatConfigSchema = z.object({
  contactName: z.string(),
  contactAvatar: z.string().optional(),
  messages: z.array(chatMessageSchema),
  triggerText: z.string().optional(),
  typingDelay: z.number().optional(),
});

// ==================== MAIL MODULE ====================
export const emailSchema = z.object({
  id: z.string(),
  folder: z.enum(['inbox', 'sent', 'spam', 'draft']),
  read: z.boolean(),
  senderName: z.string(),
  senderEmail: z.string().email(),
  subject: z.string(),
  preview: z.string(),
  body: z.string(),
  date: z.string(),
  attachments: z.array(z.object({
    name: z.string(),
    size: z.string(),
    type: z.string(),
  })).optional(),
});

export const mailConfigSchema = z.object({
  userEmail: z.string().email(),
  triggerText: z.string().optional(),
  emails: z.array(emailSchema),
});

// ==================== TERMINAL MODULE ====================
export const terminalCommandSchema = z.object({
  id: z.string(),
  type: z.enum(['command', 'output', 'error', 'success', 'progress']),
  content: z.string(),
  delay: z.number().optional(),
  speed: z.enum(['instant', 'fast', 'normal', 'slow']).optional(),
});

export const terminalConfigSchema = z.object({
  prompt: z.string(),
  commands: z.array(terminalCommandSchema),
  theme: z.enum(['matrix', 'cyberpunk', 'classic']).optional(),
});

// ==================== GLOBAL SETTINGS ====================
export const globalSettingsSchema = z.object({
  themeId: z.string(), // Accepte tous les thèmes de themeEngine
  zoomLevel: z.number().min(0.5).max(2),
  magicTypingSpeed: z.number().optional(),
});

// ==================== SCENE DEFINITION ====================
export const sceneMetaSchema = z.object({
  projectName: z.string(),
  sceneName: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  author: z.string().optional(),
  notes: z.string().optional(),
});

export const sceneModuleSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('search'), ...searchConfigSchema.omit({ query: true }).shape, query: z.string() }),
  z.object({ type: z.literal('chat'), ...chatConfigSchema.shape }),
  z.object({ type: z.literal('mail'), ...mailConfigSchema.shape }),
  z.object({ type: z.literal('terminal'), ...terminalConfigSchema.shape }),
]);

export const sceneDefinitionSchema = z.object({
  id: z.string(),
  meta: sceneMetaSchema,
  globalSettings: globalSettingsSchema,
  module: sceneModuleSchema,
});

// ==================== VALIDATION FUNCTIONS ====================

/**
 * Valide une scène complète
 */
export const validateScene = (data: unknown) => {
  try {
    return {
      success: true as const,
      data: sceneDefinitionSchema.parse(data),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false as const,
        errors: error.issues.map((err: z.ZodIssue) => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
      };
    }
    return {
      success: false as const,
      errors: [{ path: 'unknown', message: 'Unknown validation error', code: 'unknown' }],
    };
  }
};

/**
 * Valide une config de recherche
 */
export const validateSearchConfig = (data: unknown) => {
  try {
    return {
      success: true as const,
      data: searchConfigSchema.parse(data),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false as const,
        errors: error.issues.map((err: z.ZodIssue) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      };
    }
    return {
      success: false as const,
      errors: [{ path: 'unknown', message: 'Unknown validation error' }],
    };
  }
};

/**
 * Valide une config de chat
 */
export const validateChatConfig = (data: unknown) => {
  try {
    return {
      success: true as const,
      data: chatConfigSchema.parse(data),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false as const,
        errors: error.issues,
      };
    }
    return {
      success: false as const,
      errors: [{ path: [], message: 'Unknown error' }],
    };
  }
};

/**
 * Valide une config de mail
 */
export const validateMailConfig = (data: unknown) => {
  try {
    return {
      success: true as const,
      data: mailConfigSchema.parse(data),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false as const,
        errors: error.issues,
      };
    }
    return {
      success: false as const,
      errors: [{ path: [], message: 'Unknown error' }],
    };
  }
};

// Export des types TypeScript inférés
export type SearchResult = z.infer<typeof searchResultSchema>;
export type SearchConfig = z.infer<typeof searchConfigSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatConfig = z.infer<typeof chatConfigSchema>;
export type Email = z.infer<typeof emailSchema>;
export type MailConfig = z.infer<typeof mailConfigSchema>;
export type TerminalCommand = z.infer<typeof terminalCommandSchema>;
export type TerminalConfig = z.infer<typeof terminalConfigSchema>;
export type SceneDefinition = z.infer<typeof sceneDefinitionSchema>;
export type GlobalSettings = z.infer<typeof globalSettingsSchema>;
