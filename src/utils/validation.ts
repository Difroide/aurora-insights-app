import { z } from 'zod';
import { ValidationUtils } from '@/schemas/validation';

/**
 * Utilitários avançados de validação para a aplicação
 */

export class AdvancedValidation {
  /**
   * Valida token do bot Telegram fazendo requisição à API
   */
  static async validateTelegramBotToken(token: string): Promise<{
    isValid: boolean;
    botInfo?: {
      id: number;
      username: string;
      firstName: string;
      canJoinGroups: boolean;
      canReadAllGroupMessages: boolean;
    };
    error?: string;
  }> {
    try {
      // Validação básica do formato
      if (!ValidationUtils.validateTelegramBotToken(token)) {
        return {
          isValid: false,
          error: 'Formato do token inválido. Use: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz'
        };
      }

      // Fazer requisição para a API do Telegram
      const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const data = await response.json();

      if (!data.ok) {
        return {
          isValid: false,
          error: data.description || 'Token inválido'
        };
      }

      return {
        isValid: true,
        botInfo: {
          id: data.result.id,
          username: data.result.username,
          firstName: data.result.first_name,
          canJoinGroups: data.result.can_join_groups,
          canReadAllGroupMessages: data.result.can_read_all_group_messages
        }
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Erro ao verificar token. Verifique sua conexão.'
      };
    }
  }

  /**
   * Valida se um arquivo de mídia é seguro
   */
  static validateMediaFile(file: File): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validação básica com schema
    const basicValidation = ValidationUtils.validateFile(file);
    if (!basicValidation.isValid) {
      errors.push(...basicValidation.errors);
    }

    // Validações específicas de segurança
    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
      errors.push('Nome do arquivo contém caracteres perigosos');
    }

    // Verificar extensão vs tipo MIME
    const extension = file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type.toLowerCase();

    const validMimeTypes: Record<string, string[]> = {
      'jpg': ['image/jpeg'],
      'jpeg': ['image/jpeg'],
      'png': ['image/png'],
      'gif': ['image/gif'],
      'webp': ['image/webp'],
      'mp4': ['video/mp4'],
      'webm': ['video/webm'],
      'ogg': ['video/ogg'],
      'pdf': ['application/pdf'],
      'txt': ['text/plain']
    };

    if (extension && validMimeTypes[extension]) {
      if (!validMimeTypes[extension].includes(mimeType)) {
        errors.push(`Tipo de arquivo não corresponde à extensão: ${extension} vs ${mimeType}`);
      }
    }

    // Avisos para arquivos grandes
    if (file.size > 10 * 1024 * 1024) { // 10MB
      warnings.push('Arquivo grande pode demorar para fazer upload');
    }

    // Avisos para formatos específicos
    if (mimeType.startsWith('video/') && file.size > 20 * 1024 * 1024) {
      warnings.push('Vídeos grandes podem ter problemas de reprodução no Telegram');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Valida URL de forma mais rigorosa
   */
  static validateUrl(url: string): {
    isValid: boolean;
    isSecure: boolean;
    domain: string;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Se a URL estiver vazia, considerar válida
    if (!url || url.trim() === '') {
      return {
        isValid: true,
        isSecure: true,
        domain: '',
        errors: [],
        warnings: []
      };
    }

    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      const isSecure = urlObj.protocol === 'https:';

      // Verificar protocolos permitidos
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        errors.push('Protocolo não permitido. Use HTTP ou HTTPS');
      }

      // Verificar se não é IP local
      if (domain.match(/^(localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.|10\.|172\.)/)) {
        errors.push('URLs locais não são permitidas');
      }

      // Verificar domínios suspeitos
      const suspiciousDomains = [
        'bit.ly', 'tinyurl.com', 'short.link', 'tiny.cc'
      ];
      
      if (suspiciousDomains.some(d => domain.includes(d))) {
        warnings.push('URL encurtada detectada. Verifique se é confiável');
      }

      // Avisos de segurança
      if (!isSecure) {
        warnings.push('URL não segura (HTTP). Prefira HTTPS');
      }

      // Verificar comprimento
      if (url.length > 2048) {
        errors.push('URL muito longa');
      }

      return {
        isValid: errors.length === 0,
        isSecure,
        domain,
        errors,
        warnings
      };
    } catch (error) {
      return {
        isValid: false,
        isSecure: false,
        domain: '',
        errors: ['URL inválida'],
        warnings: []
      };
    }
  }

  /**
   * Valida dados PIX para segurança
   */
  static validatePixData(amount: number, metadata: any): {
    isValid: boolean;
    sanitizedAmount: number;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar valor
    if (amount <= 0) {
      errors.push('Valor deve ser positivo');
    }

    if (amount > 150) {
      errors.push('Valor excede limite máximo de R$ 150,00');
    }

    if (amount < 0.01) {
      errors.push('Valor mínimo é R$ 0,01');
    }

    // Sanitizar valor (remover centavos desnecessários)
    const sanitizedAmount = Math.round(amount * 100) / 100;

    // Validar metadados
    if (metadata && typeof metadata === 'object') {
      const requiredFields = ['buttonName', 'funnelName', 'botName', 'userFirstName'];
      
      for (const field of requiredFields) {
        if (!metadata[field] || typeof metadata[field] !== 'string') {
          errors.push(`Campo obrigatório ausente ou inválido: ${field}`);
        }
      }

      // Sanitizar strings nos metadados
      Object.keys(metadata).forEach(key => {
        if (typeof metadata[key] === 'string') {
          metadata[key] = ValidationUtils.sanitizeString(metadata[key]);
        }
      });
    }

    // Avisos
    if (amount > 100) {
      warnings.push('Valor alto pode requerer confirmação adicional');
    }

    return {
      isValid: errors.length === 0,
      sanitizedAmount,
      errors,
      warnings
    };
  }

  /**
   * Valida formulário de funil de forma completa
   */
  static validateFunnelForm(data: any): {
    isValid: boolean;
    errors: Record<string, string[]>;
    warnings: Record<string, string[]>;
    sanitizedData: any;
  } {
    const errors: Record<string, string[]> = {};
    const warnings: Record<string, string[]> = {};
    const sanitizedData = { ...data };

    // Validar nome
    if (!data.name || data.name.trim().length === 0) {
      errors.name = ['Nome do funil obrigatório'];
    } else {
      // Sanitizar nome
      sanitizedData.name = ValidationUtils.sanitizeString(data.name);
      
      if (sanitizedData.name.length > 100) {
        errors.name = ['Nome muito longo (máximo 100 caracteres)'];
      }
    }

    // Validar mensagem de boas-vindas
    if (!data.welcomeMessage || data.welcomeMessage.trim().length === 0) {
      errors.welcomeMessage = ['Mensagem de boas-vindas obrigatória'];
    } else {
      sanitizedData.welcomeMessage = ValidationUtils.sanitizeString(data.welcomeMessage);
      
      if (sanitizedData.welcomeMessage.length < 10) {
        errors.welcomeMessage = ['Mensagem muito curta (mínimo 10 caracteres)'];
      }
      
      if (sanitizedData.welcomeMessage.length > 4096) {
        errors.welcomeMessage = ['Mensagem muito longa (máximo 4096 caracteres)'];
      }
    }

    // Validar URL da mídia
    if (data.mediaUrl && data.mediaUrl.trim() !== '') {
      const urlValidation = this.validateUrl(data.mediaUrl);
      if (!urlValidation.isValid) {
        errors.mediaUrl = urlValidation.errors;
      }
      if (urlValidation.warnings.length > 0) {
        warnings.mediaUrl = urlValidation.warnings;
      }
    }

    // Validar botões inline
    if (!data.inlineButtons || !Array.isArray(data.inlineButtons) || data.inlineButtons.length === 0) {
      errors.inlineButtons = ['Pelo menos um botão obrigatório'];
    } else {
      const buttonErrors: string[] = [];
      const buttonWarnings: string[] = [];

      // Verificar duplicatas
      const buttonNames = data.inlineButtons.map((btn: any) => btn.name?.toLowerCase().trim());
      const duplicates = buttonNames.filter((name: string, index: number) => 
        buttonNames.indexOf(name) !== index
      );

      if (duplicates.length > 0) {
        buttonErrors.push('Nomes dos botões devem ser únicos');
      }

      // Validar cada botão
      data.inlineButtons.forEach((button: any, index: number) => {
        if (!button.name || button.name.trim().length === 0) {
          buttonErrors.push(`Botão ${index + 1}: Nome obrigatório`);
        }

        // Validação mais flexível de valores
        if (!button.value || button.value.trim().length === 0) {
          buttonErrors.push(`Botão ${index + 1}: Valor obrigatório`);
        } else {
          // Aceitar formatos flexíveis: R$ 97,00, 97,00, 97.00, etc.
          const cleanValue = button.value.replace(/[^\d,.]/g, '').replace(',', '.');
          const amount = parseFloat(cleanValue);
          
          if (isNaN(amount) || amount <= 0) {
            buttonErrors.push(`Botão ${index + 1}: Valor inválido`);
          } else if (amount > 150) {
            buttonErrors.push(`Botão ${index + 1}: Valor excede R$ 150,00`);
          }
        }

        // Validar lógica PIX vs Link
        if (button.generatePIX && button.link && button.link.trim() !== '') {
          buttonErrors.push(`Botão ${index + 1}: Não pode ter PIX e link ao mesmo tempo`);
        }

        if (!button.generatePIX && (!button.link || button.link.trim() === '')) {
          buttonErrors.push(`Botão ${index + 1}: Deve ter PIX automático ou link`);
        }

        // Validar link se presente
        if (button.link && button.link.trim() !== '') {
          const linkValidation = this.validateUrl(button.link);
          if (!linkValidation.isValid) {
            buttonErrors.push(`Botão ${index + 1}: ${linkValidation.errors.join(', ')}`);
          }
        }
      });

      if (buttonErrors.length > 0) {
        errors.inlineButtons = buttonErrors;
      }

      if (buttonWarnings.length > 0) {
        warnings.inlineButtons = buttonWarnings;
      }

      // Sanitizar botões
      sanitizedData.inlineButtons = data.inlineButtons.map((button: any) => ({
        ...button,
        name: ValidationUtils.sanitizeString(button.name || ''),
        value: button.value || '',
        link: button.link || ''
      }));
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings,
      sanitizedData
    };
  }

  /**
   * Validação de rate limiting para prevenir spam
   */
  static validateRateLimit(userId: string, action: string, windowMs: number = 60000, maxAttempts: number = 5): {
    isAllowed: boolean;
    remainingAttempts: number;
    resetTime: Date;
  } {
    const key = `${userId}_${action}`;
    const now = Date.now();
    
    // Recuperar tentativas do localStorage (em produção seria Redis/banco)
    const stored = localStorage.getItem(`rate_limit_${key}`);
    let attempts: { timestamp: number; count: number } = stored 
      ? JSON.parse(stored) 
      : { timestamp: now, count: 0 };

    // Reset se a janela de tempo passou
    if (now - attempts.timestamp > windowMs) {
      attempts = { timestamp: now, count: 0 };
    }

    attempts.count += 1;

    // Salvar tentativas
    localStorage.setItem(`rate_limit_${key}`, JSON.stringify(attempts));

    const remainingAttempts = Math.max(0, maxAttempts - attempts.count);
    const resetTime = new Date(attempts.timestamp + windowMs);

    return {
      isAllowed: attempts.count <= maxAttempts,
      remainingAttempts,
      resetTime
    };
  }

  /**
   * Limpar rate limits (para testes ou reset manual)
   */
  static clearRateLimit(userId: string, action: string): void {
    const key = `rate_limit_${userId}_${action}`;
    localStorage.removeItem(key);
  }
}

/**
 * Hook React para validação em tempo real
 */
export const useValidation = () => {
  const validateField = (value: any, schema: z.ZodSchema): {
    isValid: boolean;
    error?: string;
  } => {
    try {
      schema.parse(value);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          error: error.errors[0]?.message || 'Valor inválido'
        };
      }
      return {
        isValid: false,
        error: 'Erro de validação'
      };
    }
  };

  const validateForm = <T>(data: T, schema: z.ZodSchema<T>): {
    isValid: boolean;
    errors: Record<string, string>;
    data?: T;
  } => {
    try {
      const validatedData = schema.parse(data);
      return {
        isValid: true,
        errors: {},
        data: validatedData
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
        return {
          isValid: false,
          errors
        };
      }
      return {
        isValid: false,
        errors: { general: 'Erro de validação' }
      };
    }
  };

  return {
    validateField,
    validateForm,
    validateTelegramToken: AdvancedValidation.validateTelegramBotToken,
    validateMediaFile: AdvancedValidation.validateMediaFile,
    validateUrl: AdvancedValidation.validateUrl,
    validatePixData: AdvancedValidation.validatePixData,
    validateFunnelForm: AdvancedValidation.validateFunnelForm,
    validateRateLimit: AdvancedValidation.validateRateLimit
  };
};