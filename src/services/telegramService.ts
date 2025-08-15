import { Bot, InlineKeyboard } from "grammy";
import { Funnel, InlineButton, PIXData } from '@/hooks/useFunnels';
import { paymentService } from '@/services/paymentService';
import { Context } from "grammy";
import { supabase } from '@/lib/supabase';

interface BotInstance {
  id: string;
  name: string;
  token: string;
  funnelId: string;
  bot: Bot;
  isActive: boolean;
}

interface UserTransaction {
  userId: number;
  transactionId: string;
  buttonId: string;
  funnelId: string;
  timestamp: Date;
}

class TelegramService {
  private bots: Map<string, BotInstance> = new Map();
  private funnels: Map<string, Funnel> = new Map();
  private userTransactions: Map<number, UserTransaction> = new Map();

  // Inicializar um bot
  async initializeBot(botId: string, token: string, name: string, funnelId: string): Promise<boolean> {
    try {
      // Criar instância do bot com GrammY
      const bot = new Bot(token);
      
      // Configurar handlers para o bot
      this.setupBotHandlers(bot, botId, funnelId);

      // Iniciar o bot
      bot.start();

      // Armazenar instância do bot
      this.bots.set(botId, {
        id: botId,
        name,
        token,
        funnelId,
        bot,
        isActive: true
      });

      console.log(`Bot ${name} inicializado com sucesso`);
      return true;
    } catch (error) {
      console.error(`Erro ao inicializar bot ${name}:`, error);
      return false;
    }
  }

  // Configurar handlers para um bot específico
  private setupBotHandlers(bot: Bot, botId: string, funnelId: string) {
    // Handler para comando /start
    bot.command("start", async (ctx) => {
      try {
        const chatId = ctx.chat.id;
        const funnel = this.funnels.get(funnelId);
        
        if (!funnel) {
          await ctx.reply('Erro: Funil não encontrado');
          return;
        }

        // Salvar usuário no banco de dados
        await this.saveTelegramUser(ctx, botId, funnelId);

        // Enviar mensagem de boas-vindas
        await this.sendWelcomeMessage(ctx, funnel);
        
        console.log(`Mensagem de boas-vindas enviada para ${chatId} no bot ${botId}`);
      } catch (error) {
        console.error(`Erro ao enviar mensagem de boas-vindas:`, error);
      }
    });

    // Handler para callback queries (cliques nos botões inline)
    bot.on("callback_query", async (ctx) => {
      try {
        if (!ctx.callbackQuery.data) return;
        
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        const funnel = this.funnels.get(funnelId);
        if (!funnel) return;

        // Incrementar interações do usuário
        await this.incrementUserInteractions(chatId, botId);

        // Verificar se é um botão secundário (confirmação)
        if (ctx.callbackQuery.data.startsWith('confirm_')) {
          await this.handleSecondaryButtons(ctx, ctx.callbackQuery.data);
        } else if (ctx.callbackQuery.data.startsWith('orderbump_')) {
          await this.handleOrderbumpResponse(ctx, ctx.callbackQuery.data, funnel);
        } else {
          // Processar clique no botão principal
          await this.handleButtonClick(ctx, ctx.callbackQuery.data, funnel);
        }
        
        // Responder ao callback query
        await ctx.answerCallbackQuery();
        
        console.log(`Botão clicado: ${ctx.callbackQuery.data} no bot ${botId}`);
      } catch (error) {
        console.error(`Erro ao processar clique no botão:`, error);
      }
    });

    // Handler para mensagens de texto
    bot.on("message", async (ctx) => {
      if (ctx.message?.text?.startsWith('/')) return; // Ignorar comandos
      
      try {
        const chatId = ctx.chat.id;
        const funnel = this.funnels.get(funnelId);
        
        if (!funnel) return;

        // Incrementar interações do usuário
        await this.incrementUserInteractions(chatId, botId);

        // Aqui você pode implementar lógica adicional para responder a outras mensagens
        // Por exemplo, enviar o funil novamente ou oferecer suporte
        
        console.log(`Mensagem recebida no bot ${botId}: ${ctx.message.text}`);
      } catch (error) {
        console.error(`Erro ao processar mensagem:`, error);
      }
    });
  }

  // Processar resposta do orderbump
  private async handleOrderbumpResponse(ctx: Context, callbackData: string, funnel: Funnel) {
    try {
      const parts = callbackData.split('_');
      if (parts.length !== 3) return;
      
      const action = parts[1]; // 'accept' ou 'reject'
      const buttonId = parts[2];
      
      const button = funnel.inlineButtons.find(btn => btn.id === buttonId);
      if (!button) {
        await ctx.reply('Erro: Botão não encontrado');
        return;
      }

      if (action === 'accept') {
        // Usuário aceitou o orderbump
        console.log('Usuário aceitou orderbump');
        await this.processOrderbumpAccept(ctx, button, funnel.id);
      } else if (action === 'reject') {
        // Usuário recusou o orderbump
        console.log('Usuário recusou orderbump');
        await this.processOrderbumpReject(ctx, button, funnel.id);
      }
    } catch (error) {
      console.error('Erro ao processar resposta do orderbump:', error);
      await ctx.reply('❌ Erro ao processar sua escolha. Tente novamente.');
    }
  }

  // Salvar usuário do Telegram no banco de dados
  private async saveTelegramUser(ctx: Context, botId: string, funnelId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('Usuário não autenticado para salvar usuário do Telegram');
        return;
      }

      // Validar dados antes de enviar
      if (!ctx.chat || !ctx.chat.id) {
        console.error('Dados do chat inválidos:', ctx.chat);
        return;
      }

      if (!botId || !funnelId) {
        console.error('IDs inválidos:', { botId, funnelId });
        return;
      }

      const telegramUser = {
        telegram_user_id: ctx.chat.id,
        telegram_username: ctx.chat.username || null,
        telegram_first_name: ctx.chat.first_name || 'Usuário',
        telegram_last_name: ctx.chat.last_name || null,
        bot_id: botId,
        funnel_id: funnelId,
        user_id: user.id,
        started_at: new Date().toISOString(),
        last_interaction: new Date().toISOString(),
        total_interactions: 1,
        is_active: true
      };

      console.log('Tentando salvar usuário do Telegram:', {
        telegram_user_id: telegramUser.telegram_user_id,
        bot_id: telegramUser.bot_id,
        funnel_id: telegramUser.funnel_id,
        user_id: telegramUser.user_id
      });

      // Tentar inserir o usuário (pode falhar se já existir devido à constraint UNIQUE)
      const { error } = await supabase
        .from('telegram_users')
        .insert(telegramUser);

      if (error) {
        if (error.code === '23505') { // Violação de constraint UNIQUE
          console.log(`Usuário ${ctx.chat.id} já existe no bot ${botId}`);
          // Atualizar última interação
          await this.incrementUserInteractions(ctx.chat.id, botId);
        } else {
          console.error('Erro ao salvar usuário do Telegram:', error);
          console.error('Código do erro:', error.code);
          console.error('Mensagem do erro:', error.message);
          console.error('Detalhes do erro:', error.details);
          console.error('Hint do erro:', error.hint);
          console.error('Dados que causaram erro:', telegramUser);
          
          // Tentar verificar se a tabela existe
          const { error: tableError } = await supabase
            .from('telegram_users')
            .select('id')
            .limit(1);
          
          if (tableError) {
            console.error('Erro ao verificar tabela telegram_users:', tableError);
            console.error('A tabela telegram_users pode não existir no Supabase!');
          }
        }
      } else {
        console.log(`Novo usuário salvo: ${ctx.chat.id} no bot ${botId}`);
      }
    } catch (error) {
      console.error('Erro ao salvar usuário do Telegram:', error);
      // Não interromper o fluxo se falhar ao salvar usuário
    }
  }

  // Incrementar interações do usuário
  private async incrementUserInteractions(telegramUserId: number, botId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('telegram_users')
        .update({
          last_interaction: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('telegram_user_id', telegramUserId)
        .eq('bot_id', botId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao incrementar interações:', error);
      }
    } catch (error) {
      console.error('Erro ao incrementar interações:', error);
    }
  }

  // Enviar mensagem de boas-vindas com mídia e botões
  private async sendWelcomeMessage(ctx: Context, funnel: Funnel) {
    try {
      // Preparar botões inline
      const inlineKeyboard = this.createInlineKeyboard(funnel.inlineButtons);
      
      // Se há mídia, enviar com caption
      if (funnel.mediaUrl) {
        try {
          // Verificar se é uma URL válida e não local
          const url = new URL(funnel.mediaUrl);
          
          // Ignorar URLs locais (blob:, data:, etc.)
          if (url.protocol === 'blob:' || url.protocol === 'data:' || url.hostname === 'localhost') {
            console.log('URL local detectada, enviando apenas texto');
            await ctx.reply(funnel.welcomeMessage, {
              reply_markup: inlineKeyboard
            });
            return;
          }
          
          if (funnel.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            // Imagem
            await ctx.replyWithPhoto(funnel.mediaUrl, {
              caption: funnel.welcomeMessage,
              reply_markup: inlineKeyboard
            });
          } else if (funnel.mediaUrl.match(/\.(mp4|avi|mov|mkv|webm)$/i)) {
            // Vídeo
            await ctx.replyWithVideo(funnel.mediaUrl, {
              caption: funnel.welcomeMessage,
              reply_markup: inlineKeyboard
            });
          } else {
            // Documento ou outros tipos
            await ctx.replyWithDocument(funnel.mediaUrl, {
              caption: funnel.welcomeMessage,
              reply_markup: inlineKeyboard
            });
          }
        } catch (urlError) {
          console.error('Erro ao processar URL da mídia:', urlError);
          // Fallback: enviar apenas texto se a URL for inválida
          await ctx.reply(funnel.welcomeMessage, {
            reply_markup: inlineKeyboard
          });
        }
      } else {
        // Apenas texto com botões
        await ctx.reply(funnel.welcomeMessage, {
          reply_markup: inlineKeyboard
        });
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem de boas-vindas:', error);
      
      // Fallback: tentar enviar apenas texto
      try {
        const inlineKeyboard = this.createInlineKeyboard(funnel.inlineButtons);
        await ctx.reply(funnel.welcomeMessage, {
          reply_markup: inlineKeyboard
        });
      } catch (fallbackError) {
        console.error('Erro no fallback:', fallbackError);
        // Último recurso: enviar apenas texto sem botões
        try {
          await ctx.reply(funnel.welcomeMessage);
        } catch (finalError) {
          console.error('Erro final ao enviar mensagem:', finalError);
        }
      }
    }
  }

  // Criar teclado inline com os botões do funil
  private createInlineKeyboard(buttons: InlineButton[]) {
    if (buttons.length === 0) return undefined;

    const keyboard = new InlineKeyboard();
    
    buttons.forEach(button => {
      const buttonText = button.generatePIX 
        ? `${button.name} - ${button.value} (PIX)`
        : `${button.name} - ${button.value}`;
      
      keyboard.text(buttonText, `btn_${button.id}`);
    });

    return keyboard;
  }

  // Processar clique nos botões inline
  private async handleButtonClick(ctx: Context, callbackData: string, funnel: Funnel) {
    try {
      if (!callbackData.startsWith('btn_')) return;
      
      const buttonId = callbackData.replace('btn_', '');
      const button = funnel.inlineButtons.find(btn => btn.id === buttonId);
      
      if (!button) {
        await ctx.reply('Erro: Botão não encontrado');
        return;
      }

      console.log(`Processando botão: ${button.name}, generatePIX: ${button.generatePIX}, pixData: ${!!button.pixData}, link: ${button.link}, orderbump: ${!!button.orderbump}`);

      // Se o botão tem orderbump configurado, mostrar o orderbump primeiro
      if (button.orderbump) {
        console.log('Mostrando orderbump');
        await this.showOrderbump(ctx, button, funnel.id);
        return;
      }

      // Se não tem orderbump, processar normalmente
      await this.processButtonAction(ctx, button, funnel.id);
    } catch (error) {
      console.error('Erro ao processar clique no botão:', error);
      await ctx.reply('❌ Erro ao processar sua solicitação. Tente novamente.');
    }
  }

  // Mostrar orderbump
  private async showOrderbump(ctx: Context, button: InlineButton, funnelId: string) {
    try {
      const orderbump = button.orderbump!;
      
      // Preparar mensagem do orderbump
      let message = `🎁 **${orderbump.title}**\n\n`;
      
      // Se há mídia, enviar com caption
      if (orderbump.mediaUrl) {
        if (orderbump.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          // Imagem
          await ctx.replyWithPhoto(orderbump.mediaUrl, {
            caption: message,
            reply_markup: this.createOrderbumpKeyboard(button.id, orderbump)
          });
        } else if (orderbump.mediaUrl.match(/\.(mp4|avi|mov|mkv)$/i)) {
          // Vídeo
          await ctx.replyWithVideo(orderbump.mediaUrl, {
            caption: message,
            reply_markup: this.createOrderbumpKeyboard(button.id, orderbump)
          });
        } else {
          // Documento
          await ctx.replyWithDocument(orderbump.mediaUrl, {
            caption: message,
            reply_markup: this.createOrderbumpKeyboard(button.id, orderbump)
          });
        }
      } else {
        // Apenas texto com botões
        await ctx.reply(message, {
          reply_markup: this.createOrderbumpKeyboard(button.id, orderbump)
        });
      }
    } catch (error) {
      console.error('Erro ao mostrar orderbump:', error);
      await ctx.reply('❌ Erro ao mostrar oferta especial. Tente novamente.');
    }
  }

  // Criar teclado para orderbump
  private createOrderbumpKeyboard(buttonId: string, orderbump: any) {
    const keyboard = new InlineKeyboard();
    
    keyboard
      .text(orderbump.acceptText, `orderbump_accept_${buttonId}`)
      .text(orderbump.rejectText, `orderbump_reject_${buttonId}`);
    
    return keyboard;
  }

  // Processar aceitação do orderbump
  private async processOrderbumpAccept(ctx: Context, button: InlineButton, funnelId: string) {
    try {
      const orderbump = button.orderbump!;
      
      // Calcular valor total (botão + orderbump)
      const buttonValue = this.extractValue(button.value);
      const orderbumpValue = this.extractValue(orderbump.value);
      const totalValue = buttonValue + orderbumpValue;
      
      console.log(`Valor total com orderbump: ${totalValue} (${buttonValue} + ${orderbumpValue})`);
      
      // Gerar PIX com valor total
      const pixData = await paymentService.generatePIX(totalValue, `${button.name} + ${orderbump.title}`);
      
      // Enviar PIX
      await this.sendPIXMessage(ctx, { ...button, pixData }, funnelId);
      
      // Enviar mensagem de confirmação do orderbump
      await ctx.reply(`✅ **Oferta Aceita!**\n\nVocê adicionou: **${orderbump.title}**\nValor adicional: **${orderbump.value}**\n\nTotal: **${this.formatCurrency(totalValue)}**`);
      
    } catch (error) {
      console.error('Erro ao processar aceitação do orderbump:', error);
      await ctx.reply('❌ Erro ao processar oferta. Tente novamente.');
    }
  }

  // Processar rejeição do orderbump
  private async processOrderbumpReject(ctx: Context, button: InlineButton, funnelId: string) {
    try {
      // Processar botão normalmente (sem orderbump)
      await this.processButtonAction(ctx, button, funnelId);
      
      // Enviar mensagem de confirmação
      await ctx.reply('✅ **Oferta Recusada**\n\nContinuando com sua escolha original.');
      
    } catch (error) {
      console.error('Erro ao processar rejeição do orderbump:', error);
      await ctx.reply('❌ Erro ao processar sua escolha. Tente novamente.');
    }
  }

  // Processar ação do botão (PIX ou link)
  private async processButtonAction(ctx: Context, button: InlineButton, funnelId: string) {
    try {
      // Se o botão tem PIX configurado, enviar PIX
      if (button.generatePIX && button.pixData) {
        console.log('Enviando PIX configurado');
        await this.sendPIXMessage(ctx, button, funnelId);
      } 
      // Se não tem PIX configurado mas tem valor válido, tentar gerar PIX automaticamente
      else if (button.value && button.value.match(/(\d+[.,]\d+|\d+)/)) {
        console.log('Tentando gerar PIX automaticamente');
        // Tentar gerar PIX automaticamente baseado no valor
        const valueMatch = button.value.match(/(\d+[.,]\d+|\d+)/);
        if (valueMatch) {
          const value = parseFloat(valueMatch[1].replace(',', '.'));
          console.log(`Valor extraído: ${value}`);
          if (!isNaN(value) && value > 0 && value <= 150) {
            try {
              // Verificar se a API está configurada
              if (!paymentService.isConfigured()) {
                console.log('API não configurada');
                await ctx.reply('❌ **Erro de Configuração**\n\nConfigure o token da API PushinPay nas configurações para gerar PIX automaticamente.');
                return;
              }

              console.log('Gerando PIX automaticamente...');
              const pixData = await paymentService.generatePIX(value, button.name);
              
              // Atualizar botão com PIX gerado
              button.pixData = pixData;
              button.generatePIX = true;
              
              console.log('PIX gerado automaticamente, enviando...');
              await this.sendPIXMessage(ctx, button, funnelId);
            } catch (error) {
              console.error('Erro ao gerar PIX automaticamente:', error);
              await ctx.reply('❌ **Erro ao Gerar PIX**\n\nNão foi possível gerar o PIX automaticamente. Tente novamente.');
            }
          } else {
            console.log('Valor inválido para PIX automático');
            await ctx.reply('❌ **Valor Inválido**\n\nO valor deve estar entre R$ 0,01 e R$ 150,00.');
          }
        }
      } 
      // Se tem link VIP, enviar link
      else if (button.link) {
        console.log('Enviando link VIP');
        await ctx.reply(`🔗 **${button.name}**\n\nAcesse o link: ${button.link}`);
      } 
      // Se não tem nada configurado
      else {
        console.log('Botão sem configuração');
        await ctx.reply(`❌ **Botão não configurado**\n\nO botão "${button.name}" não está configurado corretamente.`);
      }
    } catch (error) {
      console.error('Erro ao processar ação do botão:', error);
      await ctx.reply('❌ Erro ao processar sua solicitação. Tente novamente.');
    }
  }

  // Extrair valor numérico de uma string
  private extractValue(valueString: string): number {
    const valueMatch = valueString.match(/(\d+[.,]\d+|\d+)/);
    if (valueMatch) {
      return parseFloat(valueMatch[1].replace(',', '.'));
    }
    return 0;
  }

  // Formatar valor para exibição
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  // Enviar mensagem com PIX (versão temporária para frontend)
  private async sendPIXMessage(ctx: Context, button: InlineButton, funnelId: string) {
    try {
      if (!button.pixData) {
        console.error('PIX data não encontrado para o botão:', button.id);
        await ctx.reply('Erro: Dados do PIX não encontrados');
        return;
      }

      const pixData = button.pixData;
      const userId = ctx.chat.id;
      
      console.log('Iniciando envio de PIX:', {
        buttonId: button.id,
        buttonName: button.name,
        pixDataId: pixData.id,
        qrCodeText: pixData.qr_code_text,
        qrCode: pixData.qr_code,
        hasOrderbump: !!button.orderbump
      });
      
      // Armazenar transação do usuário
      this.userTransactions.set(userId, {
        userId,
        transactionId: pixData.id,
        buttonId: button.id,
        funnelId,
        timestamp: new Date()
      });

      // Extrair valor do botão
      const valueMatch = button.value.match(/(\d+[.,]\d+|\d+)/);
      const value = valueMatch ? parseFloat(valueMatch[1].replace(',', '.')) : 0;

      console.log('Enviando PIX (versão frontend):', pixData.qr_code_text || pixData.qr_code);

      // Versão temporária: enviar apenas texto com chave PIX
      const mensagem = `🧾 *Detalhes do pagamento:*\n\n` +
                      `💰 *Valor:* R$ ${value.toFixed(2)}\n\n` +
                      `📲 *Chave Copia e Cola (CLIQUE SOBRE O TEXTO E COLE NO SEU BANCO):*\n\n` +
                      `\`${pixData.qr_code_text || pixData.qr_code}\`\n\n` +
                      `💡 *Instruções:*\n` +
                      `1. Abra o app do seu banco\n` +
                      `2. Cole a chave PIX acima no seu app\n` +
                      `3. Confirme o pagamento\n\n` +
                      `👉 Clique no botão abaixo quando concluir o pagamento:`;

      // Enviar mensagem principal
      await ctx.reply(mensagem, {
        parse_mode: 'Markdown'
      });

      console.log('Mensagem PIX enviada com sucesso');

      // Enviar botão de confirmação em mensagem separada
      const keyboard = new InlineKeyboard();
      keyboard.text("💸 Já Fiz o Pagamento", `confirm_${button.id}`);

      await ctx.reply("💸 Confirme seu pagamento:", {
        reply_markup: keyboard
      });

      console.log(`PIX enviado com sucesso para ${button.name}: ${pixData.id}`);

    } catch (error) {
      console.error('Erro detalhado ao enviar PIX:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
      
      // Tentar enviar mensagem de erro mais específica
      let errorMessage = 'Erro ao processar PIX. Tente novamente.';
      
      if (error instanceof Error) {
        if (error.message.includes('Network request')) {
          errorMessage = 'Erro de conexão. Este serviço precisa rodar no backend.';
        } else if (error.message.includes('photo')) {
          errorMessage = 'Erro ao enviar imagem. Tente novamente.';
        } else if (error.message.includes('caption')) {
          errorMessage = 'Erro na formatação da mensagem. Tente novamente.';
        }
      }
      
      await ctx.reply(`❌ ${errorMessage}\n\nErro técnico: ${error instanceof Error ? error.message : 'Desconhecido'}`);
    }
  }

  // Enviar link VIP
  private async sendVIPLink(ctx: Context, button: InlineButton) {
    try {
      const message = `🚀 *${button.name}*\n\n💰 Valor: *${button.value}*\n\n🔗 Clique no link abaixo para acessar:\n${button.link}`;
      
      await ctx.reply(message, {
        parse_mode: 'Markdown'
      });

      console.log(`Link VIP enviado: ${button.link}`);
    } catch (error) {
      console.error('Erro ao enviar link VIP:', error);
    }
  }

  // Processar botões secundários (apenas confirmação)
  private async handleSecondaryButtons(ctx: Context, callbackData: string) {
    try {
      const userId = ctx.chat.id;
      const userTransaction = this.userTransactions.get(userId);

      if (!userTransaction) {
        await ctx.reply('Erro: Transação não encontrada. Clique no botão PIX novamente.');
        return;
      }

      if (callbackData.startsWith('confirm_')) {
        // Verificar pagamento
        await this.checkPayment(ctx, userTransaction);
      }

    } catch (error) {
      console.error('Erro ao processar botão secundário:', error);
      await ctx.reply('Erro ao processar solicitação. Tente novamente.');
    }
  }

  // Verificar pagamento
  private async checkPayment(ctx: Context, userTransaction: UserTransaction) {
    try {
      const status = await paymentService.checkPaymentStatus(userTransaction.transactionId);
      
      if (status.status === 'paid') {
        // Encontrar o botão e funil para verificar se tem orderbump
        const funnel = this.funnels.get(userTransaction.funnelId);
        const button = funnel?.inlineButtons.find(btn => btn.id === userTransaction.buttonId);
        
        // Mensagem simples de confirmação
        await ctx.reply('✅ *Pagamento confirmado!*', { parse_mode: 'Markdown' });
        
        // Se o botão tem link VIP configurado, enviar o link
        if (button?.link) {
          const linkMessage = `🔗 *Acesse seu produto:*\n\n${button.link}`;
          await ctx.reply(linkMessage, { parse_mode: 'Markdown' });
        }
        
        // Se o botão tem orderbump e foi aceito, enviar mensagem adicional
        if (button?.orderbump) {
          // Verificar se o valor total inclui o orderbump (valor do botão + orderbump)
          const buttonValue = this.extractValue(button.value);
          const orderbumpValue = this.extractValue(button.orderbump.value);
          const totalValue = buttonValue + orderbumpValue;
          
          // Se o valor pago é igual ou maior que o total com orderbump, significa que foi aceito
          if (status.value >= totalValue) {
            console.log('Orderbump aceito, enviando mensagem adicional');
            
            // Enviar mensagem do orderbump após pagamento
            await ctx.reply(button.orderbump.messageAfterPayment, { parse_mode: 'Markdown' });
          }
        }
        
        // Limpar transação do usuário
        this.userTransactions.delete(userTransaction.userId);
      } else {
        await ctx.reply(`⚠️ *Pagamento ainda não confirmado*\n\n` +
                        `Status atual: ${status.status}\n\n` +
                        `Clique novamente em "💸 Já Fiz o Pagamento" quando concluir o pagamento.`);
      }

    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      await ctx.reply('Erro ao verificar pagamento. Tente novamente.');
    }
  }

  // Atualizar funis disponíveis
  updateFunnels(funnels: Funnel[]) {
    this.funnels.clear();
    funnels.forEach(funnel => {
      this.funnels.set(funnel.id, funnel);
    });
  }

  // Parar um bot
  stopBot(botId: string): boolean {
    const botInstance = this.bots.get(botId);
    if (!botInstance) return false;

    try {
      botInstance.bot.stop();
      botInstance.isActive = false;
      this.bots.delete(botId);
      console.log(`Bot ${botInstance.name} parado com sucesso`);
      return true;
    } catch (error) {
      console.error(`Erro ao parar bot ${botInstance.name}:`, error);
      return false;
    }
  }

  // Verificar status de um bot
  getBotStatus(botId: string): { isActive: boolean; name: string } | null {
    const botInstance = this.bots.get(botId);
    if (!botInstance) return null;

    return {
      isActive: botInstance.isActive,
      name: botInstance.name
    };
  }

  // Listar todos os bots ativos
  getActiveBots(): Array<{ id: string; name: string; funnelId: string }> {
    return Array.from(this.bots.values()).map(bot => ({
      id: bot.id,
      name: bot.name,
      funnelId: bot.funnelId
    }));
  }

  // Limpar todos os bots
  clearAllBots() {
    this.bots.forEach(botInstance => {
      try {
        botInstance.bot.stop();
      } catch (error) {
        console.error(`Erro ao parar bot ${botInstance.name}:`, error);
      }
    });
    this.bots.clear();
    console.log('Todos os bots foram parados e removidos');
  }

  // Obter estatísticas de transações
  getTransactionStats() {
    return {
      totalTransactions: this.userTransactions.size,
      activeTransactions: Array.from(this.userTransactions.values()).filter(t => 
        (new Date().getTime() - t.timestamp.getTime()) < 24 * 60 * 60 * 1000 // Últimas 24h
      ).length
    };
  }
}

// Exportar instância singleton
export const telegramService = new TelegramService();
export default telegramService; 