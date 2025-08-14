import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, X, Upload, Save, CreditCard, QrCode, Gift, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFunnels, Funnel } from "@/hooks/useFunnels";
import { paymentService, PIXData } from "@/services/paymentService";
import { supabase } from "@/lib/supabase";

interface Orderbump {
  id: string;
  mediaUrl?: string;
  title: string;
  acceptText: string;
  rejectText: string;
  value: string;
  messageAfterPayment: string;
}

interface InlineButton {
  id: string;
  name: string;
  value: string;
  link: string;
  generatePIX: boolean;
  pixData?: PIXData;
  orderbump?: Orderbump;
}

interface CreateFunnelModalProps {
  onSave: (funnel: Funnel) => void | Promise<void>;
  trigger?: React.ReactNode;
}

export const CreateFunnelModal = ({ onSave, trigger }: CreateFunnelModalProps) => {
  const [open, setOpen] = useState(false);
  const [funnelName, setFunnelName] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [inlineButtons, setInlineButtons] = useState<InlineButton[]>([]);
  const [isGeneratingPIX, setIsGeneratingPIX] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isOrderbumpUploading, setIsOrderbumpUploading] = useState(false);
  
  // Estados do modal de orderbump
  const [orderbumpModalOpen, setOrderbumpModalOpen] = useState(false);
  const [currentButtonId, setCurrentButtonId] = useState<string>("");
  const [orderbumpData, setOrderbumpData] = useState<Orderbump>({
    id: "",
    title: "",
    acceptText: "Sim, quero aproveitar!",
    rejectText: "Não, obrigado",
    value: "",
    messageAfterPayment: ""
  });
  const [orderbumpMediaFile, setOrderbumpMediaFile] = useState<File | null>(null);
  const [orderbumpMediaUrl, setOrderbumpMediaUrl] = useState("");
  
  const { toast } = useToast();
  const { addFunnel } = useFunnels();

  // Verificar se a API está configurada
  useEffect(() => {
    const checkConfig = async () => {
      try {
        const configured = await paymentService.isConfigured();
        setIsConfigured(configured);
      } catch (error) {
        console.error('Erro ao verificar configuração:', error);
        setIsConfigured(false);
      }
    };
    
    checkConfig();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setIsUploading(true);
      
      try {
        const { data, error } = await supabase.storage
          .from('media')
          .upload(`funnel_${Date.now()}_${file.name}`, file);

        if (error) {
          throw error;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(`${data.path}`);

        setMediaUrl(publicUrl || "");
        toast({
          title: "Upload bem-sucedido",
          description: `Arquivo "${file.name}" carregado com sucesso.`,
        });
      } catch (error) {
        console.error('Erro ao fazer upload de mídia:', error);
        toast({
          title: "Erro de Upload",
          description: error instanceof Error ? error.message : "Erro desconhecido ao fazer upload.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleOrderbumpFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setOrderbumpMediaFile(file);
      setIsOrderbumpUploading(true);
      
      try {
        const { data, error } = await supabase.storage
          .from('media')
          .upload(`orderbump_${Date.now()}_${file.name}`, file);

        if (error) {
          throw error;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(`${data.path}`);

        setOrderbumpMediaUrl(publicUrl || "");
        toast({
          title: "Upload bem-sucedido",
          description: `Arquivo "${file.name}" carregado com sucesso.`,
        });
      } catch (error) {
        console.error('Erro ao fazer upload de mídia do orderbump:', error);
        toast({
          title: "Erro de Upload",
          description: error instanceof Error ? error.message : "Erro desconhecido ao fazer upload.",
          variant: "destructive",
        });
      } finally {
        setIsOrderbumpUploading(false);
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      setMediaFile(file);
      // Para arquivos locais, vamos usar uma URL temporária
      // Em produção, você faria upload para um servidor e usaria a URL real
      const url = URL.createObjectURL(file);
      setMediaUrl(url);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const addInlineButton = () => {
    const newButton: InlineButton = {
      id: Date.now().toString(),
      name: "",
      value: "",
      link: "",
      generatePIX: false
    };
    setInlineButtons([...inlineButtons, newButton]);
  };

  const updateInlineButton = (id: string, field: keyof InlineButton, value: string | boolean | undefined | PIXData | Orderbump) => {
    setInlineButtons(buttons =>
      buttons.map(btn =>
        btn.id === id ? { ...btn, [field]: value } : btn
      )
    );
  };

  const removeInlineButton = (id: string) => {
    setInlineButtons(buttons => buttons.filter(btn => btn.id !== id));
  };

  // Função para abrir modal de orderbump
  const openOrderbumpModal = (buttonId: string) => {
    const button = inlineButtons.find(btn => btn.id === buttonId);
    if (button?.orderbump) {
      setOrderbumpData(button.orderbump);
      setOrderbumpMediaUrl(button.orderbump.mediaUrl || "");
    } else {
      setOrderbumpData({
        id: Date.now().toString(),
        title: "",
        acceptText: "Sim, quero aproveitar!",
        rejectText: "Não, obrigado",
        value: "",
        messageAfterPayment: ""
      });
      setOrderbumpMediaUrl("");
    }
    setCurrentButtonId(buttonId);
    setOrderbumpModalOpen(true);
  };

  // Função para salvar orderbump
  const saveOrderbump = async () => {
    if (!orderbumpData.title.trim() || !orderbumpData.value.trim() || !orderbumpData.messageAfterPayment.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios do orderbump",
        variant: "destructive"
      });
      return;
    }

    const orderbump: Orderbump = {
      ...orderbumpData,
      mediaUrl: orderbumpMediaUrl || undefined
    };

    updateInlineButton(currentButtonId, 'orderbump', orderbump);
    setOrderbumpModalOpen(false);
    
    toast({
      title: "Sucesso",
      description: "Orderbump configurado com sucesso!",
    });
  };

  // Função para remover orderbump
  const removeOrderbump = (buttonId: string) => {
    updateInlineButton(buttonId, 'orderbump', undefined);
    toast({
      title: "Orderbump removido",
      description: "Orderbump foi removido do botão",
    });
  };

  // Função para gerar PIX automaticamente quando o valor mudar
  const handleValueChange = async (buttonId: string, value: string) => {
    updateInlineButton(buttonId, 'value', value);
    
    // Se o valor contém números, gerar PIX automaticamente
    const valueMatch = value.match(/(\d+[.,]\d+|\d+)/);
    if (valueMatch && !isGeneratingPIX) {
      const numValue = parseFloat(valueMatch[1].replace(',', '.'));
      if (!isNaN(numValue) && numValue > 0 && numValue <= 150) {
        // Aguardar um pouco para o usuário terminar de digitar
        setTimeout(async () => {
          const button = inlineButtons.find(btn => btn.id === buttonId);
          if (button && button.value === value && !button.pixData) {
            try {
              setIsGeneratingPIX(true);

              // Verificar se a API está configurada
              if (!isConfigured) {
                toast({
                  title: "Configuração necessária",
                  description: "Configure o token da API PushinPay nas configurações",
                  variant: "destructive"
                });
                return;
              }

              const pixData = await paymentService.generatePIX(numValue, button.name);
              
              updateInlineButton(buttonId, 'pixData', pixData);
              updateInlineButton(buttonId, 'generatePIX', true);
              
              toast({
                title: "PIX gerado!",
                description: `PIX criado automaticamente para ${button.name} - R$ ${numValue.toFixed(2)}`,
              });
            } catch (error) {
              console.error('Erro ao gerar PIX:', error);
              toast({
                title: "Erro ao gerar PIX",
                description: error instanceof Error ? error.message : "Erro desconhecido",
                variant: "destructive"
              });
            } finally {
              setIsGeneratingPIX(false);
            }
          }
        }, 1000);
      }
    }
  };

  const handleSave = async () => {
    if (!funnelName.trim()) {
      toast({
        title: "Erro",
        description: "Nome do funil é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!welcomeMessage.trim()) {
      toast({
        title: "Erro",
        description: "Mensagem de boas-vindas é obrigatória",
        variant: "destructive"
      });
      return;
    }

    try {
      const newFunnel = await addFunnel({
        name: funnelName,
        mediaUrl: mediaUrl || undefined,
        welcomeMessage,
        inlineButtons: inlineButtons.filter(btn => btn.name && btn.value)
      });

      onSave(newFunnel);
      
      // Limpar formulário
      setFunnelName("");
      setMediaFile(null);
      setMediaUrl("");
      setWelcomeMessage("");
      setInlineButtons([]);
      
      setOpen(false);
      
      toast({
        title: "Sucesso",
        description: "Funil criado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao criar funil:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar funil. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setFunnelName("");
    setMediaFile(null);
    setMediaUrl("");
    setWelcomeMessage("");
    setInlineButtons([]);
    setOpen(false);
  };

  const formatCurrency = (value: string) => {
    // Formatar valor para exibição
    const numValue = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.'));
    if (isNaN(numValue)) return value;
    return `R$ ${numValue.toFixed(2).replace('.', ',')}`;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button className="btn-gradient">
              <Plus className="h-4 w-4 mr-2" />
              Novo Funil
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Funil</DialogTitle>
            <DialogDescription>
              Configure seu funil de vendas com mensagem de boas-vindas, botões inline e geração automática de PIX
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Nome do Funil */}
            <div className="space-y-2">
              <Label htmlFor="funnel-name">Nome do Funil *</Label>
              <Input
                id="funnel-name"
                placeholder="Ex: Funil de Vendas Premium"
                value={funnelName}
                onChange={(e) => setFunnelName(e.target.value)}
              />
            </div>

            {/* Upload de Mídia */}
            <div className="space-y-2">
              <Label>Mídia (opcional)</Label>
              <p className="text-xs text-muted-foreground">
                Faça upload de imagens ou vídeos do seu computador. 
                Os arquivos serão salvos e enviados com a mensagem de boas-vindas.
              </p>
              
              <div 
                className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {isUploading ? (
                  <div className="space-y-2">
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Fazendo upload...</p>
                  </div>
                ) : mediaFile ? (
                  <div className="space-y-2">
                    <div className="max-w-xs mx-auto">
                      {mediaFile?.type.startsWith('image/') ? (
                        <img src={URL.createObjectURL(mediaFile)} alt="Preview" className="w-full h-auto rounded" />
                      ) : (
                        <div className="bg-muted p-4 rounded">
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mt-2">{mediaFile?.name}</p>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMediaFile(null);
                        setMediaUrl("");
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                    {mediaUrl && (
                      <p className="text-xs text-green-600">
                        ✅ Arquivo enviado com sucesso!
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Clique para fazer upload ou arraste o arquivo
                    </p>
                    <Input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="media-upload"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="cursor-pointer"
                      onClick={() => document.getElementById('media-upload')?.click()}
                    >
                      Escolher Arquivo
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Mensagem de Boas-vindas */}
            <div className="space-y-2">
              <Label htmlFor="welcome-message">Mensagem de Boas-vindas *</Label>
              <Textarea
                id="welcome-message"
                placeholder="Digite sua mensagem de boas-vindas que será enviada junto com a mídia..."
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                rows={4}
              />
            </div>

            {/* Botões Inline */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Botões Inline</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addInlineButton}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Botão
                </Button>
              </div>

              {inlineButtons.length === 0 && (
                <div className="text-center text-muted-foreground py-8 border border-dashed border-border rounded-lg">
                  <p>Nenhum botão inline configurado</p>
                  <p className="text-sm">Clique em "Adicionar Botão" para começar</p>
                </div>
              )}

              {inlineButtons.map((button, index) => (
                <Card key={button.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      Botão {index + 1}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInlineButton(button.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor={`btn-name-${button.id}`}>Nome</Label>
                        <Input
                          id={`btn-name-${button.id}`}
                          placeholder="Ex: Comprar Agora"
                          value={button.name}
                          onChange={(e) => updateInlineButton(button.id, 'name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`btn-value-${button.id}`}>Valor</Label>
                        <Input
                          id={`btn-value-${button.id}`}
                          placeholder="Ex: 97,00 ou R$ 97,00"
                          value={button.value}
                          onChange={(e) => handleValueChange(button.id, e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`btn-link-${button.id}`}>Link VIP (opcional se PIX ativado)</Label>
                        <Input
                          id={`btn-link-${button.id}`}
                          placeholder="https://..."
                          value={button.link}
                          onChange={(e) => updateInlineButton(button.id, 'link', e.target.value)}
                          disabled={button.generatePIX}
                        />
                      </div>
                    </div>

                    {/* Botão Orderbump */}
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant={button.orderbump ? "default" : "outline"}
                        size="sm"
                        onClick={() => openOrderbumpModal(button.id)}
                        className="flex items-center gap-2"
                      >
                        <Gift className="h-4 w-4" />
                        {button.orderbump ? "Orderbump Configurado" : "Configurar Orderbump"}
                      </Button>
                      {button.orderbump && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOrderbump(button.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Configuração PIX */}
                    <div className="space-y-3">
                      {button.generatePIX && (
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <QrCode className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-600">PIX Gerado Automaticamente</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            O PIX foi gerado automaticamente baseado no valor configurado
                          </p>
                          {button.pixData && (
                            <div className="mt-2 text-xs">
                              <p><strong>ID:</strong> {button.pixData.id}</p>
                              <p><strong>Valor:</strong> {formatCurrency(button.value)}</p>
                              <p><strong>Status:</strong> {button.pixData.status}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              className="btn-gradient"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Funil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Orderbump */}
      <Dialog open={orderbumpModalOpen} onOpenChange={setOrderbumpModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurar Orderbump</DialogTitle>
            <DialogDescription>
              Configure uma oferta adicional que aparecerá antes do PIX
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Título do Orderbump */}
            <div className="space-y-2">
              <Label htmlFor="orderbump-title">Título do Orderbump *</Label>
              <Input
                id="orderbump-title"
                placeholder="Ex: Aproveite esta oferta especial!"
                value={orderbumpData.title}
                onChange={(e) => setOrderbumpData({...orderbumpData, title: e.target.value})}
              />
            </div>

            {/* Upload de Mídia do Orderbump */}
            <div className="space-y-2">
              <Label>Mídia do Orderbump (opcional)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                {isOrderbumpUploading ? (
                  <div className="space-y-2">
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Fazendo upload...</p>
                  </div>
                ) : orderbumpMediaUrl ? (
                  <div className="space-y-2">
                    <div className="max-w-xs mx-auto">
                      {orderbumpMediaFile?.type.startsWith('image/') ? (
                        <img src={orderbumpMediaUrl} alt="Preview" className="w-full h-auto rounded" />
                      ) : (
                        <div className="bg-muted p-4 rounded">
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mt-2">{orderbumpMediaFile?.name}</p>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setOrderbumpMediaFile(null);
                        setOrderbumpMediaUrl("");
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                    <p className="text-xs text-green-600">
                      ✅ Arquivo enviado com sucesso!
                    </p>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Clique para fazer upload ou arraste o arquivo
                    </p>
                    <Input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleOrderbumpFileUpload}
                      className="hidden"
                      id="orderbump-media-upload"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="cursor-pointer"
                      onClick={() => document.getElementById('orderbump-media-upload')?.click()}
                    >
                      Escolher Arquivo
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Textos dos Botões */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accept-text">Texto do Botão Aceitar</Label>
                <Input
                  id="accept-text"
                  placeholder="Ex: Sim, quero aproveitar!"
                  value={orderbumpData.acceptText}
                  onChange={(e) => setOrderbumpData({...orderbumpData, acceptText: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reject-text">Texto do Botão Recusar</Label>
                <Input
                  id="reject-text"
                  placeholder="Ex: Não, obrigado"
                  value={orderbumpData.rejectText}
                  onChange={(e) => setOrderbumpData({...orderbumpData, rejectText: e.target.value})}
                />
              </div>
            </div>

            {/* Valor do Orderbump */}
            <div className="space-y-2">
              <Label htmlFor="orderbump-value">Valor do Orderbump *</Label>
              <Input
                id="orderbump-value"
                placeholder="Ex: 47,00 ou R$ 47,00"
                value={orderbumpData.value}
                onChange={(e) => setOrderbumpData({...orderbumpData, value: e.target.value})}
              />
            </div>

            {/* Mensagem após Pagamento */}
            <div className="space-y-2">
              <Label htmlFor="message-after-payment">Mensagem após Pagamento *</Label>
              <Textarea
                id="message-after-payment"
                placeholder="Mensagem que será enviada após o pagamento ser confirmado..."
                value={orderbumpData.messageAfterPayment}
                onChange={(e) => setOrderbumpData({...orderbumpData, messageAfterPayment: e.target.value})}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderbumpModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveOrderbump} className="btn-gradient">
              <Save className="h-4 w-4 mr-2" />
              Salvar Orderbump
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}; 