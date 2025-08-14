import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  CreditCard, 
  Save, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Key,
  Globe,
  Webhook
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/hooks/useSupabase";
import { paymentService } from "@/services/paymentService";

interface ConfigForm {
  pixApiToken: string;
}

interface ConfigInfo {
  isConfigured: boolean;
  baseURL: string;
  hasToken: boolean;
}

const ConfigPage = () => {
  const [formData, setFormData] = useState<ConfigForm>({
    pixApiToken: ""
  });
  const [showToken, setShowToken] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [configInfo, setConfigInfo] = useState<ConfigInfo | null>(null);
  const { toast } = useToast();
  const supabase = useSupabase();

  // Carregar configurações salvas
  useEffect(() => {
    loadConfig();
    updateConfigInfo();
  }, []);

  const loadConfig = async () => {
    try {
      const config = await supabase.getConfig();
      if (config) {
        setFormData({
          pixApiToken: config.pix_api_token || ""
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const updateConfigInfo = async () => {
    try {
      const info = await paymentService.getConfigInfo();
      setConfigInfo(info);
    } catch (error) {
      console.error('Erro ao atualizar informações de configuração:', error);
    }
  };

  const saveConfig = async () => {
    if (!formData.pixApiToken.trim()) {
      toast({
        title: "Erro",
        description: "Token da API é obrigatório",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Salvar no Supabase
      await supabase.saveConfig({
        pix_api_token: formData.pixApiToken
      });
      
      // Atualizar informações de configuração
      await updateConfigInfo();

      toast({
        title: "Configuração salva!",
        description: "As configurações da PushinPay foram salvas com sucesso.",
      });

    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    if (!formData.pixApiToken.trim()) {
      toast({
        title: "Erro",
        description: "Configure o token da API primeiro",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Testar com um valor pequeno
      const testPIX = await paymentService.generatePIX(1.00, "Teste de conexão");
      
      toast({
        title: "Conexão bem-sucedida!",
        description: `PIX de teste criado com ID: ${testPIX.id}`,
      });

    } catch (error) {
      console.error('Erro no teste de conexão:', error);
      toast({
        title: "Erro na conexão",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const clearConfig = async () => {
    if (confirm('Tem certeza que deseja limpar todas as configurações?')) {
      try {
        // Remover configuração do Supabase
        const config = await supabase.getConfig();
        if (config) {
          // Como não temos um método deleteConfig, vamos salvar com string vazia
          await supabase.saveConfig({
            pix_api_token: ""
          });
        }
        
        setFormData({
          pixApiToken: ""
        });
        await updateConfigInfo();
        
        toast({
          title: "Configurações limpas",
          description: "Todas as configurações foram removidas.",
        });
      } catch (error) {
        console.error('Erro ao limpar configurações:', error);
        toast({
          title: "Erro",
          description: "Erro ao limpar configurações",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="section-header">
        <h1 className="page-title text-white">Configurações</h1>
        <p className="page-subtitle text-white">Gerencie as configurações da sua conta e integrações</p>
      </div>

      {/* PushinPay Configuration */}
      <Card className="config-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="icon-badge">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-white">PushinPay - PIX</CardTitle>
              <CardDescription className="text-white">
                Configure sua integração com a API PushinPay para geração automática de PIX
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pixApiToken" className="flex items-center gap-2 text-white">
                <Key className="h-4 w-4" />
                Token da API PushinPay
              </Label>
              <div className="relative">
                <Input
                  id="pixApiToken"
                  type={showToken ? "text" : "password"}
                  placeholder="Digite seu token da API PushinPay"
                  value={formData.pixApiToken}
                  onChange={(e) => setFormData({ ...formData, pixApiToken: e.target.value })}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? (
                    <EyeOff className="h-4 w-4 text-white" />
                  ) : (
                    <Eye className="h-4 w-4 text-white" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-white">
                Obtenha seu token em{" "}
                <a
                  href="https://pushinpay.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 inline-flex"
                >
                  pushinpay.com.br
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>

            {/* Status da Configuração */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-white">Status da Configuração</h4>
                {configInfo?.hasToken ? (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Configurado
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-yellow-600">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Não Configurado
                  </Badge>
                )}
              </div>
              
              {configInfo?.hasToken && (
                <div className="p-3 bg-green-600/10 border border-green-600/20 rounded-lg">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium text-white">Token configurado com sucesso!</span>
                  </div>
                  <p className="text-xs text-white mt-1">
                    Sua integração com PushinPay está ativa e pronta para gerar PIX automaticamente.
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Botões de Ação */}
          <div className="flex gap-3">
            <Button
              onClick={saveConfig}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading ? "Salvando..." : "Salvar Configuração"}
            </Button>
            
            <Button
              variant="outline"
              onClick={testConnection}
              disabled={isLoading || !formData.pixApiToken.trim()}
              className="flex items-center gap-2"
            >
              <Webhook className="h-4 w-4" />
              Testar Conexão
            </Button>
            
            <Button
              variant="outline"
              onClick={clearConfig}
              disabled={isLoading}
              className="flex items-center gap-2 text-destructive hover:text-destructive"
            >
              <Settings className="h-4 w-4" />
              Limpar Configuração
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card className="config-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="icon-badge">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-white">Informações do Sistema</CardTitle>
              <CardDescription className="text-white">
                Detalhes sobre a versão e configurações do sistema
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-white">Versão</span>
              <Badge variant="outline">1.0.0</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-white">Ambiente</span>
              <Badge variant="outline">Produção</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-white">Banco de Dados</span>
              <Badge variant="outline">Supabase</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-white">Autenticação</span>
              <Badge variant="outline">Supabase Auth</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigPage; 