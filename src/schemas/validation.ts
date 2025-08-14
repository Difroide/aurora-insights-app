import { z } from 'zod';

// Validações para valores monetários
const currencyRegex = /^R\$\s?\d{1,3}(?:\.\d{3})*,\d{2}$/;
const simpleCurrencyRegex = /^R\$\s?\d+,\d{2}$/;
const flexibleCurrencyRegex = /^(R\$\s?)?\d+([.,]\d{2})?$/;

// Schema para botão inline
export const InlineButtonSchema = z.object({
  id: z.string().min(1, 'ID do botão obrigatório'),
  name: z
    .string()
    .min(1, 'Nome do botão obrigatório')
    .max(50, 'Nome do botão deve ter no máximo 50 caracteres')
    .regex(/^[^\n\r]*$/, 'Nome do botão não pode conter quebras de linha'),
  value: z
    .string()
    .min(1, 'Valor obrigatório')
    .refine((val) => {
      // Aceitar formatos flexíveis: R$ 97,00, 97,00, 97.00, etc.
      const cleanValue = val.replace(/[^\d,.]/g, '').replace(',', '.');
      const numericValue = parseFloat(cleanValue);
      return !isNaN(numericValue) && numericValue > 0 && numericValue <= 150;
    }, 'Valor deve estar entre R$ 0,01 e R$ 150,00'),
  link: z
    .string()
    .optional()
    .or(z.literal('')),
  generatePIX: z.boolean().default(false),
  pixData: z.any().optional()
}).refine((data) => {
  // Se generatePIX é true, link pode estar vazio
  if (data.generatePIX) {
    return true;
  }
  // Se generatePIX é false, link deve estar preenchido
  if (!data.generatePIX && (!data.link || data.link.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: 'Botão deve ter ou PIX automático ou link',
  path: ['generatePIX']
});

// Schema para funil
export const FunnelSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, 'Nome do funil obrigatório')
    .max(100, 'Nome do funil deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-Z0-9\s\-_À-ÿ]+$/, 'Nome do funil contém caracteres inválidos'),
  welcomeMessage: z
    .string()
    .min(10, 'Mensagem de boas-vindas deve ter pelo menos 10 caracteres')
    .max(4096, 'Mensagem de boas-vindas deve ter no máximo 4096 caracteres'),
  mediaUrl: z
    .string()
    .optional()
    .or(z.literal('')),
  inlineButtons: z
    .array(InlineButtonSchema)
    .min(1, 'Pelo menos um botão inline obrigatório')
    .max(8, 'Máximo de 8 botões inline permitidos')
    .refine((buttons) => {
      // Verificar se não há nomes duplicados
      const names = buttons.map(b => b.name.toLowerCase().trim());
      return new Set(names).size === names.length;
    }, 'Nomes dos botões devem ser únicos'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  userId: z.string().uuid('ID do usuário deve ser um UUID válido').optional()
});

// Schema para token do bot do Telegram
export const TelegramBotTokenSchema = z
  .string()
  .min(1, 'Token do bot obrigatório')
  .regex(
    /^\d{8,10}:[A-Za-z0-9_-]{35}$/,
    'Token inválido. Formato esperado: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz'
  );

// Schema para bot
export const BotSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, 'Nome do bot obrigatório')
    .max(50, 'Nome do bot deve ter no máximo 50 caracteres')
    .regex(/^[a-zA-Z0-9\s\-_À-ÿ]+$/, 'Nome do bot contém caracteres inválidos'),
  token: TelegramBotTokenSchema,
  funnelId: z
    .string()
    .uuid('ID do funil deve ser um UUID válido')
    .min(1, 'Funil obrigatório'),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  userId: z.string().uuid('ID do usuário deve ser um UUID válido').optional()
});

// Schema para configurações PIX
export const PixConfigSchema = z.object({
  id: z.string().optional(),
  pixApiToken: z
    .string()
    .min(1, 'Token da API PIX obrigatório')
    .min(10, 'Token da API PIX deve ter pelo menos 10 caracteres')
    .max(500, 'Token da API PIX muito longo'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  userId: z.string().uuid('ID do usuário deve ser um UUID válido').optional()
});

// Schema para upload de arquivo
export const FileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 50 * 1024 * 1024, 'Arquivo deve ter no máximo 50MB')
    .refine((file) => {
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'video/ogg',
        'application/pdf',
        'text/plain'
      ];
      return allowedTypes.includes(file.type);
    }, 'Tipo de arquivo não suportado. Formatos aceitos: JPG, PNG, GIF, WebP, MP4, WebM, OGG, PDF, TXT'),
  name: z.string().min(1, 'Nome do arquivo obrigatório').optional(),
  description: z.string().max(200, 'Descrição deve ter no máximo 200 caracteres').optional()
});

// Schema para autenticação
export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email obrigatório')
    .email('Email deve ser válido')
    .max(100, 'Email deve ter no máximo 100 caracteres'),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
});

export const RegisterSchema = z.object({
  email: z
    .string()
    .min(1, 'Email obrigatório')
    .email('Email deve ser válido')
    .max(100, 'Email deve ter no máximo 100 caracteres'),
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword']
});

// Schema para transação PIX
export const PixTransactionSchema = z.object({
  amount: z
    .number()
    .positive('Valor deve ser positivo')
    .max(150, 'Valor máximo é R$ 150,00')
    .multipleOf(0.01, 'Valor deve ter no máximo 2 casas decimais'),
  botId: z.string().uuid('ID do bot deve ser um UUID válido'),
  funnelId: z.string().uuid('ID do funil deve ser um UUID válido'),
  buttonId: z.string().min(1, 'ID do botão obrigatório'),
  telegramUserId: z.number().int().positive('ID do usuário Telegram deve ser um número positivo'),
  status: z.enum(['pending', 'completed', 'failed', 'expired']).default('pending'),
  metadata: z.object({
    buttonName: z.string(),
    funnelName: z.string(),
    botName: z.string(),
    userFirstName: z.string(),
    userUsername: z.string().optional()
  })
});

// Schema para interação do bot
export const BotInteractionSchema = z.object({
  botId: z.string().uuid('ID do bot deve ser um UUID válido'),
  telegramUserId: z.number().int().positive('ID do usuário Telegram deve ser um número positivo'),
  type: z.enum(['start', 'button_click', 'pix_generation', 'pix_view', 'pix_confirm']),
  funnelId: z.string().uuid('ID do funil deve ser um UUID válido'),
  buttonId: z.string().optional(),
  metadata: z.record(z.any()).default({}),
  sessionId: z.string().min(1, 'ID da sessão obrigatório')
});

// Schema para filtros de analytics
export const AnalyticsFiltersSchema = z.object({
  dateRange: z.object({
    start: z.date(),
    end: z.date()
  }).refine((range) => range.start <= range.end, {
    message: 'Data de início deve ser anterior à data de fim',
    path: ['dateRange']
  }),
  botIds: z.array(z.string().uuid()).optional(),
  funnelIds: z.array(z.string().uuid()).optional(),
  status: z.array(z.enum(['pending', 'completed', 'failed', 'expired'])).optional(),
  groupBy: z.enum(['day', 'week', 'month', 'year']).default('day')
});

// Utilitários de validação
export const ValidationUtils = {
  /**
   * Valida se um token do bot Telegram é válido
   */
  validateTelegramBotToken: (token: string): boolean => {
    return TelegramBotTokenSchema.safeParse(token).success;
  },

  /**
   * Valida formato de valor monetário
   */
  validateCurrency: (value: string): boolean => {
    if (!value || value.trim() === '') return false;
    
    // Aceitar formatos flexíveis: R$ 97,00, 97,00, 97.00, etc.
    const cleanValue = value.replace(/[^\d,.]/g, '').replace(',', '.');
    const numericValue = parseFloat(cleanValue);
    
    return !isNaN(numericValue) && numericValue > 0 && numericValue <= 150;
  },

  /**
   * Converte string de moeda para número
   */
  currencyToNumber: (value: string): number => {
    const cleanValue = value.replace(/[^\d,.]/g, '').replace(',', '.');
    return parseFloat(cleanValue);
  },

  /**
   * Converte número para string de moeda
   */
  numberToCurrency: (value: number): string => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  },

  /**
   * Valida se um email é válido
   */
  validateEmail: (email: string): boolean => {
    return z.string().email().safeParse(email).success;
  },

  /**
   * Valida se uma URL é válida
   */
  validateUrl: (url: string): boolean => {
    return z.string().url().safeParse(url).success;
  },

  /**
   * Valida se um UUID é válido
   */
  validateUuid: (uuid: string): boolean => {
    return z.string().uuid().safeParse(uuid).success;
  },

  /**
   * Sanitiza string removendo caracteres perigosos
   */
  sanitizeString: (str: string): string => {
    return str
      .replace(/[<>\"']/g, '') // Remove caracteres HTML perigosos
      .replace(/[\r\n\t]/g, ' ') // Substitui quebras de linha por espaços
      .trim();
  },

  /**
   * Valida força da senha
   */
  validatePasswordStrength: (password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score += 1;
    else feedback.push('Senha deve ter pelo menos 8 caracteres');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Senha deve conter pelo menos uma letra minúscula');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Senha deve conter pelo menos uma letra maiúscula');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Senha deve conter pelo menos um número');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

    if (password.length >= 12) score += 1;

    return {
      isValid: score >= 4,
      score,
      feedback
    };
  },

  /**
   * Valida tamanho e tipo de arquivo
   */
  validateFile: (file: File): { isValid: boolean; errors: string[] } => {
    const result = FileUploadSchema.safeParse({ file });
    
    if (result.success) {
      return { isValid: true, errors: [] };
    }

    const errors = result.error.errors.map(err => err.message);
    return { isValid: false, errors };
  }
};

// Tipos TypeScript derivados dos schemas
export type InlineButton = z.infer<typeof InlineButtonSchema>;
export type Funnel = z.infer<typeof FunnelSchema>;
export type Bot = z.infer<typeof BotSchema>;
export type PixConfig = z.infer<typeof PixConfigSchema>;
export type FileUpload = z.infer<typeof FileUploadSchema>;
export type Login = z.infer<typeof LoginSchema>;
export type Register = z.infer<typeof RegisterSchema>;
export type PixTransaction = z.infer<typeof PixTransactionSchema>;
export type BotInteraction = z.infer<typeof BotInteractionSchema>;
export type AnalyticsFilters = z.infer<typeof AnalyticsFiltersSchema>;