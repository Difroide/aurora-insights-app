import { supabase } from '@/lib/supabase';

export interface PIXRequest {
  value: number;
  description?: string;
  webhook_url?: string;
}

export interface PIXData {
  id: string;
  value: number;
  qr_code: string;
  qr_code_text: string;
  status: string;
  created_at: string;
  expires_at: string;
}

export class PaymentAPIError extends Error {
  constructor(message: string, public maxValue?: number) {
    super(message);
    this.name = 'PaymentAPIError';
  }
}

export class PaymentService {
  private baseURL: string;
  private apiToken: string | null = null;
  private configLoaded: boolean = false;

  constructor() {
    // URLs fixas da API PushinPay (como no pix.py)
    this.baseURL = 'https://api.pushinpay.com.br';
  }

  private async loadConfig(): Promise<void> {
    if (this.configLoaded) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('Usuário não autenticado');
        this.configLoaded = true;
        return;
      }

      const { data: config, error } = await supabase
        .from('configs')
        .select('pix_api_token')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar configurações:', error);
        this.configLoaded = true;
        return;
      }

      if (config) {
        this.apiToken = config.pix_api_token || null;
      }
      
      this.configLoaded = true;
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      this.configLoaded = true;
    }
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Gera um QR Code PIX para pagamento (como no pix.py)
   */
  async generatePIX(value: number, description: string = ''): Promise<PIXData> {
    // Recarregar configurações antes de usar
    await this.loadConfig();
    
    if (!this.apiToken) {
      throw new PaymentAPIError('Token da API não configurado');
    }

    if (value <= 0) {
      throw new PaymentAPIError('Valor deve ser maior que zero');
    }

    if (value > 150) {
      throw new PaymentAPIError(
        `Valor R$ ${value.toFixed(2)} excede o limite máximo de R$ 150,00`,
        150
      );
    }

    const payload: PIXRequest = {
      value: Math.round(value * 100), // Converte para centavos
      webhook_url: undefined // Webhook fixo ou configurável via backend
    };

    if (description) {
      payload.description = description;
    }

    try {
      // Usar a mesma URL do pix.py
      const response = await fetch(`${this.baseURL}/api/pix/cashIn`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Verifica se é erro de limite
        if (response.status === 400 && errorText.includes('valor máximo')) {
          throw new PaymentAPIError(
            'Valor excede o limite máximo permitido de R$ 150,00',
            150
          );
        }

        throw new PaymentAPIError(`Erro na API: ${response.status} - ${errorText}`);
      }

      const pixData = await response.json();
      console.log(`PIX gerado com sucesso. ID: ${pixData.id}`);

      return {
        ...pixData,
        value: pixData.value / 100 // Converte de volta para reais
      };
    } catch (error) {
      if (error instanceof PaymentAPIError) {
        throw error;
      }
      
      console.error('Erro ao gerar PIX:', error);
      throw new PaymentAPIError('Erro interno ao gerar PIX');
    }
  }

  /**
   * Verifica o status de um pagamento PIX (como no pix.py)
   */
  async checkPaymentStatus(transactionId: string): Promise<any> { // Assuming PIXStatus is replaced by 'any' or needs a new interface
    // Recarregar configurações antes de usar
    await this.loadConfig();
    
    if (!this.apiToken) {
      throw new PaymentAPIError('Token da API não configurado');
    }

    try {
      // Usar a mesma URL do pix.py
      const response = await fetch(`${this.baseURL}/api/transactions/${transactionId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new PaymentAPIError(`Erro ao verificar status: ${response.status} - ${errorText}`);
      }

      const statusData = await response.json();
      console.log(`Status do PIX ID ${transactionId}: ${statusData.status}`);

      return {
        ...statusData,
        value: statusData.value / 100 // Converte de volta para reais
      };
    } catch (error) {
      if (error instanceof PaymentAPIError) {
        throw error;
      }
      
      console.error('Erro ao verificar status do PIX:', error);
      throw new PaymentAPIError(`Falha ao verificar status do pagamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Gera QR Code a partir da chave PIX (como no pix.py)
   */
  async generateQRCode(pixKey: string): Promise<string> {
    try {
      // Em um ambiente real, você geraria o QR Code no backend
      // Por enquanto, retornamos a chave para o frontend processar
      return pixKey;
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      throw new PaymentAPIError('Falha ao gerar QR Code');
    }
  }

  /**
   * Verifica se a API está configurada
   */
  async isConfigured(): Promise<boolean> {
    await this.loadConfig();
    return !!this.apiToken;
  }

  /**
   * Obtém informações sobre a configuração atual
   */
  async getConfigInfo() {
    await this.loadConfig();
    return {
      isConfigured: !!this.apiToken,
      baseURL: this.baseURL,
      hasToken: !!this.apiToken
    };
  }

  /**
   * Atualiza configurações em tempo real
   */
  async updateConfig() {
    this.configLoaded = false;
    await this.loadConfig();
  }

  /**
   * Obtém URLs padrão da API (como no pix.py)
   */
  getDefaultURLs() {
    return {
      pixGenerate: `${this.baseURL}/api/pix/cashIn`,
      pixStatus: `${this.baseURL}/api/transactions/`
    };
  }
}

// Instância singleton
export const paymentService = new PaymentService();
export default paymentService; 