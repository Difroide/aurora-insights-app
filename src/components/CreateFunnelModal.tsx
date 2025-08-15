import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface Upsell {
  id: string;
  mediaUrl?: string;
  description: string;
  delayMinutes: number;
  inlineButtons: UpsellButton[];
}

interface Downsell {
  id: string;
  mediaUrl?: string;
  description: string;
  delayMinutes: number;
  inlineButtons: DownsellButton[];
}

interface DownsellButton {
  id: string;
  name: string;
  value: string;
  link: string;
  orderbump?: Orderbump;
}

interface UpsellButton {
  id: string;
  name: string;
  value: string;
  link: string;
  orderbump?: Orderbump;
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
  const [upsells, setUpsells] = useState<Upsell[]>([]);
  const [downsells, setDownsells] = useState<Downsell[]>([]);
  const [isGeneratingPIX, setIsGeneratingPIX] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isOrderbumpUploading, setIsOrderbumpUploading] = useState(false);
  const [isUpsellUploading, setIsUpsellUploading] = useState(false);
  const [isDownsellUploading, setIsDownsellUploading] = useState(false);
  
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
  
  // Estados do modal de upsell
  const [upsellModalOpen, setUpsellModalOpen] = useState(false);
  const [currentUpsellId, setCurrentUpsellId] = useState<string>("");
  const [upsellData, setUpsellData] = useState<Upsell>({
    id: "",
    description: "",
    delayMinutes: 0,
    inlineButtons: []
  });
  const [upsellMediaFile, setUpsellMediaFile] = useState<File | null>(null);
  const [upsellMediaUrl, setUpsellMediaUrl] = useState("");
  
  // Estados do modal de downsell
  const [downsellModalOpen, setDownsellModalOpen] = useState(false);
  const [currentDownsellId, setCurrentDownsellId] = useState<string>("");
  const [downsellData, setDownsellData] = useState<Downsell>({
    id: "",
    description: "",
    delayMinutes: 0,
    inlineButtons: []
  });
  const [downsellMediaFile, setDownsellMediaFile] = useState<File | null>(null);
  const [downsellMediaUrl, setDownsellMediaUrl] = useState("");
  
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

    // Verificar se é um botão de upsell, downsell ou botão inline normal
    if (upsellModalOpen) {
      updateUpsellButton(currentButtonId, 'orderbump', orderbump);
    } else if (downsellModalOpen) {
      updateDownsellButton(currentButtonId, 'orderbump', orderbump);
    } else {
      updateInlineButton(currentButtonId, 'orderbump', orderbump);
    }
    
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

  // Funções para gerenciar upsells
  const addUpsell = () => {
    const newUpsell: Upsell = {
      id: Date.now().toString(),
      description: "",
      delayMinutes: 0,
      inlineButtons: []
    };
    setUpsells([...upsells, newUpsell]);
  };

  const removeUpsell = (upsellId: string) => {
    setUpsells(upsells => upsells.filter(upsell => upsell.id !== upsellId));
    toast({
      title: "Upsell removido",
      description: "Upsell foi removido com sucesso",
    });
  };

  const openUpsellModal = (upsellId: string) => {
    const upsell = upsells.find(u => u.id === upsellId);
    if (upsell) {
      setUpsellData(upsell);
      setUpsellMediaUrl(upsell.mediaUrl || "");
    } else {
      setUpsellData({
        id: upsellId,
        description: "",
        delayMinutes: 0,
        inlineButtons: []
      });
      setUpsellMediaUrl("");
    }
    setCurrentUpsellId(upsellId);
    setUpsellModalOpen(true);
  };

  const handleUpsellFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUpsellMediaFile(file);
      setIsUpsellUploading(true);
      
      try {
        const { data, error } = await supabase.storage
          .from('media')
          .upload(`upsell_${Date.now()}_${file.name}`, file);

        if (error) {
          throw error;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(`${data.path}`);

        setUpsellMediaUrl(publicUrl || "");
        toast({
          title: "Upload bem-sucedido",
          description: `Arquivo "${file.name}" carregado com sucesso.`,
        });
      } catch (error) {
        console.error('Erro ao fazer upload de mídia do upsell:', error);
        toast({
          title: "Erro de Upload",
          description: error instanceof Error ? error.message : "Erro desconhecido ao fazer upload.",
          variant: "destructive",
        });
      } finally {
        setIsUpsellUploading(false);
      }
    }
  };

  const addUpsellButton = () => {
    const newButton: UpsellButton = {
      id: Date.now().toString(),
      name: "",
      value: "",
      link: ""
    };
    setUpsellData({
      ...upsellData,
      inlineButtons: [...upsellData.inlineButtons, newButton]
    });
  };

  const updateUpsellButton = (buttonId: string, field: keyof UpsellButton, value: string | Orderbump | undefined) => {
    setUpsellData({
      ...upsellData,
      inlineButtons: upsellData.inlineButtons.map(btn =>
        btn.id === buttonId ? { ...btn, [field]: value } : btn
      )
    });
  };

  const removeUpsellButton = (buttonId: string) => {
    setUpsellData({
      ...upsellData,
      inlineButtons: upsellData.inlineButtons.filter(btn => btn.id !== buttonId)
    });
  };

  const saveUpsell = () => {
    if (!upsellData.description.trim()) {
      toast({
        title: "Erro",
        description: "Descrição do upsell é obrigatória",
        variant: "destructive"
      });
      return;
    }

    const upsell: Upsell = {
      ...upsellData,
      mediaUrl: upsellMediaUrl || undefined
    };

    setUpsells(upsells => 
      upsells.map(u => u.id === currentUpsellId ? upsell : u)
    );
    
    setUpsellModalOpen(false);
    
    toast({
      title: "Sucesso",
      description: "Upsell configurado com sucesso!",
    });
  };

  // Funções para gerenciar downsells
  const addDownsell = () => {
    const newDownsell: Downsell = {
      id: Date.now().toString(),
      description: "",
      delayMinutes: 0,
      inlineButtons: []
    };
    setDownsells([...downsells, newDownsell]);
  };

  const removeDownsell = (downsellId: string) => {
    setDownsells(downsells => downsells.filter(downsell => downsell.id !== downsellId));
    toast({
      title: "Downsell removido",
      description: "Downsell foi removido com sucesso",
    });
  };

  const openDownsellModal = (downsellId: string) => {
    const downsell = downsells.find(d => d.id === downsellId);
    if (downsell) {
      setDownsellData(downsell);
      setDownsellMediaUrl(downsell.mediaUrl || "");
    } else {
      setDownsellData({
        id: downsellId,
        description: "",
        delayMinutes: 0,
        inlineButtons: []
      });
      setDownsellMediaUrl("");
    }
    setCurrentDownsellId(downsellId);
    setDownsellModalOpen(true);
  };

  const handleDownsellFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDownsellMediaFile(file);
      setIsDownsellUploading(true);
      
      try {
        const { data, error } = await supabase.storage
          .from('media')
          .upload(`downsell_${Date.now()}_${file.name}`, file);

        if (error) {
          throw error;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(`${data.path}`);

        setDownsellMediaUrl(publicUrl || "");
        toast({
          title: "Upload bem-sucedido",
          description: `Arquivo "${file.name}" carregado com sucesso.`,
        });
      } catch (error) {
        console.error('Erro ao fazer upload de mídia do downsell:', error);
        toast({
          title: "Erro de Upload",
          description: error instanceof Error ? error.message : "Erro desconhecido ao fazer upload.",
          variant: "destructive",
        });
      } finally {
        setIsDownsellUploading(false);
      }
    }
  };

  const addDownsellButton = () => {
    const newButton: DownsellButton = {
      id: Date.now().toString(),
      name: "",
      value: "",
      link: ""
    };
    setDownsellData({
      ...downsellData,
      inlineButtons: [...downsellData.inlineButtons, newButton]
    });
  };

  const updateDownsellButton = (buttonId: string, field: keyof DownsellButton, value: string | Orderbump | undefined) => {
    setDownsellData({
      ...downsellData,
      inlineButtons: downsellData.inlineButtons.map(btn =>
        btn.id === buttonId ? { ...btn, [field]: value } : btn
      )
    });
  };

  const removeDownsellButton = (buttonId: string) => {
    setDownsellData({
      ...downsellData,
      inlineButtons: downsellData.inlineButtons.filter(btn => btn.id !== buttonId)
    });
  };

  const saveDownsell = () => {
    if (!downsellData.description.trim()) {
      toast({
        title: "Erro",
        description: "Descrição do downsell é obrigatória",
        variant: "destructive"
      });
      return;
    }

    const downsell: Downsell = {
      ...downsellData,
      mediaUrl: downsellMediaUrl || undefined
    };

    setDownsells(downsells => 
      downsells.map(d => d.id === currentDownsellId ? downsell : d)
    );
    
    setDownsellModalOpen(false);
    
    toast({
      title: "Sucesso",
      description: "Downsell configurado com sucesso!",
    });
  };

  // Função para abrir modal de orderbump para botões do upsell
  const openUpsellOrderbumpModal = (buttonId: string) => {
    const button = upsellData.inlineButtons.find(btn => btn.id === buttonId);
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

  // Função para abrir modal de orderbump para botões do downsell
  const openDownsellOrderbumpModal = (buttonId: string) => {
    const button = downsellData.inlineButtons.find(btn => btn.id === buttonId);
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
      setUpsells([]);
      setDownsells([]);
      
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
    setUpsells([]);
    setDownsells([]);
    setOpen(false);
  };

  const formatCurrency = (value: string) => {
    // Formatar valor para exibição
    const numValue = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.'));
    if (isNaN(numValue)) return value;
    return `R$ ${numValue.toFixed(2).replace('.', ',')}`;
  };

  // Opções de tempo para delay
  const delayOptions = [
    { value: 0, label: "Imediato" },
    { value: 3, label: "3 minutos" },
    { value: 5, label: "5 minutos" },
    { value: 7, label: "7 minutos" },
    { value: 10, label: "10 minutos" },
    { value: 15, label: "15 minutos" },
    { value: 20, label: "20 minutos" },
    { value: 25, label: "25 minutos" },
    { value: 30, label: "30 minutos" }
  ];

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

            {/* Seção de Upsells */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Upsells</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addUpsell}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Upsell
                </Button>
              </div>

              {upsells.length === 0 && (
                <div className="text-center text-muted-foreground py-8 border border-dashed border-border rounded-lg">
                  <p>Nenhum upsell configurado</p>
                  <p className="text-sm">Clique em "Adicionar Upsell" para começar</p>
                </div>
              )}

              {upsells.map((upsell, index) => (
                <Card key={upsell.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      Upsell {index + 1}
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openUpsellModal(upsell.id)}
                        >
                          <Gift className="h-4 w-4 mr-2" />
                          Configurar
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUpsell(upsell.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upsell.description ? (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm font-medium">Descrição:</p>
                        <p className="text-sm text-muted-foreground">{upsell.description}</p>
                        {upsell.delayMinutes !== undefined && (
                          <p className="text-xs text-orange-600 mt-1">
                            ⏱️ Envio: {delayOptions.find(opt => opt.value === upsell.delayMinutes)?.label}
                          </p>
                        )}
                        {upsell.mediaUrl && (
                          <p className="text-xs text-green-600 mt-2">✅ Mídia anexada</p>
                        )}
                        {upsell.inlineButtons.length > 0 && (
                          <p className="text-xs text-blue-600 mt-1">
                            {upsell.inlineButtons.length} botão(ões) configurado(s)
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Clique em "Configurar" para definir este upsell</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Seção de Downsells */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Downsells</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDownsell}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Downsell
                </Button>
              </div>

              {downsells.length === 0 && (
                <div className="text-center text-muted-foreground py-8 border border-dashed border-border rounded-lg">
                  <p>Nenhum downsell configurado</p>
                  <p className="text-sm">Clique em "Adicionar Downsell" para começar</p>
                </div>
              )}

              {downsells.map((downsell, index) => (
                <Card key={downsell.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      Downsell {index + 1}
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openDownsellModal(downsell.id)}
                        >
                          <Gift className="h-4 w-4 mr-2" />
                          Configurar
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDownsell(downsell.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {downsell.description ? (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm font-medium">Descrição:</p>
                        <p className="text-sm text-muted-foreground">{downsell.description}</p>
                        {downsell.delayMinutes !== undefined && (
                          <p className="text-xs text-orange-600 mt-1">
                            ⏱️ Envio: {delayOptions.find(opt => opt.value === downsell.delayMinutes)?.label}
                          </p>
                        )}
                        {downsell.mediaUrl && (
                          <p className="text-xs text-green-600 mt-2">✅ Mídia anexada</p>
                        )}
                        {downsell.inlineButtons.length > 0 && (
                          <p className="text-xs text-blue-600 mt-1">
                            {downsell.inlineButtons.length} botão(ões) configurado(s)
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Clique em "Configurar" para definir este downsell</p>
                    )}
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

      {/* Modal de Upsell */}
      <Dialog open={upsellModalOpen} onOpenChange={setUpsellModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurar Upsell</DialogTitle>
            <DialogDescription>
              Configure uma oferta especial com mídia, descrição e botões inline
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Tempo de Envio do Upsell */}
            <div className="space-y-2">
              <Label htmlFor="upsell-delay">Tempo após pagamento confirmado para envio</Label>
              <Select 
                value={upsellData.delayMinutes.toString()} 
                onValueChange={(value) => setUpsellData({...upsellData, delayMinutes: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tempo de envio" />
                </SelectTrigger>
                <SelectContent>
                  {delayOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Upload de Mídia do Upsell */}
            <div className="space-y-2">
              <Label>Mídia do Upsell (opcional)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                {isUpsellUploading ? (
                  <div className="space-y-2">
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Fazendo upload...</p>
                  </div>
                ) : upsellMediaUrl ? (
                  <div className="space-y-2">
                    <div className="max-w-xs mx-auto">
                      {upsellMediaFile?.type.startsWith('image/') ? (
                        <img src={upsellMediaUrl} alt="Preview" className="w-full h-auto rounded" />
                      ) : (
                        <div className="bg-muted p-4 rounded">
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mt-2">{upsellMediaFile?.name}</p>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUpsellMediaFile(null);
                        setUpsellMediaUrl("");
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
                      onChange={handleUpsellFileUpload}
                      className="hidden"
                      id="upsell-media-upload"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="cursor-pointer"
                      onClick={() => document.getElementById('upsell-media-upload')?.click()}
                    >
                      Escolher Arquivo
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Descrição do Upsell */}
            <div className="space-y-2">
              <Label htmlFor="upsell-description">Descrição do Upsell *</Label>
              <Textarea
                id="upsell-description"
                placeholder="Digite a descrição do seu upsell..."
                value={upsellData.description}
                onChange={(e) => setUpsellData({...upsellData, description: e.target.value})}
                rows={4}
              />
            </div>

            {/* Botões Inline do Upsell */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Botões Inline do Upsell</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addUpsellButton}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Botão
                </Button>
              </div>

              {upsellData.inlineButtons.length === 0 && (
                <div className="text-center text-muted-foreground py-8 border border-dashed border-border rounded-lg">
                  <p>Nenhum botão configurado</p>
                  <p className="text-sm">Clique em "Adicionar Botão" para começar</p>
                </div>
              )}

              {upsellData.inlineButtons.map((button, index) => (
                <Card key={button.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      Botão {index + 1}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUpsellButton(button.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor={`upsell-btn-name-${button.id}`}>Nome</Label>
                        <Input
                          id={`upsell-btn-name-${button.id}`}
                          placeholder="Ex: Comprar Agora"
                          value={button.name}
                          onChange={(e) => updateUpsellButton(button.id, 'name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`upsell-btn-value-${button.id}`}>Valor</Label>
                        <Input
                          id={`upsell-btn-value-${button.id}`}
                          placeholder="Ex: 97,00 ou R$ 97,00"
                          value={button.value}
                          onChange={(e) => updateUpsellButton(button.id, 'value', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`upsell-btn-link-${button.id}`}>Link</Label>
                        <Input
                          id={`upsell-btn-link-${button.id}`}
                          placeholder="https://..."
                          value={button.link}
                          onChange={(e) => updateUpsellButton(button.id, 'link', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Botão Orderbump para Upsell */}
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant={button.orderbump ? "default" : "outline"}
                        size="sm"
                        onClick={() => openUpsellOrderbumpModal(button.id)}
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
                          onClick={() => updateUpsellButton(button.id, 'orderbump', undefined)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUpsellModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveUpsell} className="btn-gradient">
              <Save className="h-4 w-4 mr-2" />
              Salvar Upsell
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Downsell */}
      <Dialog open={downsellModalOpen} onOpenChange={setDownsellModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurar Downsell</DialogTitle>
            <DialogDescription>
              Configure uma oferta de recuperação com mídia, descrição e botões inline
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Tempo de Envio do Downsell */}
            <div className="space-y-2">
              <Label htmlFor="downsell-delay">Tempo após pagamento confirmado para envio</Label>
              <Select 
                value={downsellData.delayMinutes.toString()} 
                onValueChange={(value) => setDownsellData({...downsellData, delayMinutes: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tempo de envio" />
                </SelectTrigger>
                <SelectContent>
                  {delayOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Upload de Mídia do Downsell */}
            <div className="space-y-2">
              <Label>Mídia do Downsell (opcional)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                {isDownsellUploading ? (
                  <div className="space-y-2">
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Fazendo upload...</p>
                  </div>
                ) : downsellMediaUrl ? (
                  <div className="space-y-2">
                    <div className="max-w-xs mx-auto">
                      {downsellMediaFile?.type.startsWith('image/') ? (
                        <img src={downsellMediaUrl} alt="Preview" className="w-full h-auto rounded" />
                      ) : (
                        <div className="bg-muted p-4 rounded">
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mt-2">{downsellMediaFile?.name}</p>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDownsellMediaFile(null);
                        setDownsellMediaUrl("");
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
                      onChange={handleDownsellFileUpload}
                      className="hidden"
                      id="downsell-media-upload"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="cursor-pointer"
                      onClick={() => document.getElementById('downsell-media-upload')?.click()}
                    >
                      Escolher Arquivo
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Descrição do Downsell */}
            <div className="space-y-2">
              <Label htmlFor="downsell-description">Descrição do Downsell *</Label>
              <Textarea
                id="downsell-description"
                placeholder="Digite a descrição do seu downsell..."
                value={downsellData.description}
                onChange={(e) => setDownsellData({...downsellData, description: e.target.value})}
                rows={4}
              />
            </div>

            {/* Botões Inline do Downsell */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Botões Inline do Downsell</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDownsellButton}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Botão
                </Button>
              </div>

              {downsellData.inlineButtons.length === 0 && (
                <div className="text-center text-muted-foreground py-8 border border-dashed border-border rounded-lg">
                  <p>Nenhum botão configurado</p>
                  <p className="text-sm">Clique em "Adicionar Botão" para começar</p>
                </div>
              )}

              {downsellData.inlineButtons.map((button, index) => (
                <Card key={button.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      Botão {index + 1}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDownsellButton(button.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor={`downsell-btn-name-${button.id}`}>Nome</Label>
                        <Input
                          id={`downsell-btn-name-${button.id}`}
                          placeholder="Ex: Comprar Agora"
                          value={button.name}
                          onChange={(e) => updateDownsellButton(button.id, 'name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`downsell-btn-value-${button.id}`}>Valor</Label>
                        <Input
                          id={`downsell-btn-value-${button.id}`}
                          placeholder="Ex: 47,00 ou R$ 47,00"
                          value={button.value}
                          onChange={(e) => updateDownsellButton(button.id, 'value', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`downsell-btn-link-${button.id}`}>Link</Label>
                        <Input
                          id={`downsell-btn-link-${button.id}`}
                          placeholder="https://..."
                          value={button.link}
                          onChange={(e) => updateDownsellButton(button.id, 'link', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Botão Orderbump para Downsell */}
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant={button.orderbump ? "default" : "outline"}
                        size="sm"
                        onClick={() => openDownsellOrderbumpModal(button.id)}
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
                          onClick={() => updateDownsellButton(button.id, 'orderbump', undefined)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDownsellModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveDownsell} className="btn-gradient">
              <Save className="h-4 w-4 mr-2" />
              Salvar Downsell
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}; 