import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect } from "react"
import { 
  Bot,
  Plus,
  Play,
  Pause,
  Settings,
  BarChart3,
  MessageSquare,
  Zap,
  Edit,
  Trash2,
  Users,
  UserPlus,
  Activity,
} from "lucide-react"
import { useFunnels } from "@/hooks/useFunnels"
import { useBots } from "@/hooks/useBots"
import { useTelegramUsers } from "@/hooks/useTelegramUsers"
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import telegramService from "@/services/telegramService"

const BotsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    token: "",
    funil: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const { funnels } = useFunnels();
  const { bots, loading: botsLoading, addBot, removeBot, toggleBotStatus } = useBots();
  const { stats: globalStats, loading: statsLoading } = useTelegramUsers();
  const { toast } = useToast();

  // Atualizar funis no serviço do Telegram quando mudarem
  useEffect(() => {
    telegramService.updateFunnels(funnels);
  }, [funnels]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome.trim() || !formData.token.trim() || !formData.funil) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const selectedFunnel = funnels.find(f => f.id === formData.funil);
    if (!selectedFunnel) {
      toast({
        title: "Erro",
        description: "Funil selecionado não encontrado",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Inicializar bot no serviço do Telegram
      const botInitialized = await telegramService.initializeBot(
        Date.now().toString(),
        formData.token,
        formData.nome,
        formData.funil
      );

      if (!botInitialized) {
        toast({
          title: "Erro",
          description: "Não foi possível inicializar o bot. Verifique o token.",
          variant: "destructive"
        });
        return;
      }

      const newBot = {
        name: formData.nome,
        token: formData.token,
        funnelId: formData.funil,
        status: "Ativo" as const,
        messages: 0,
        conversions: 0,
        lastActive: "Agora",
        performance: 100
      };

      await addBot(newBot);

      toast({
        title: "Bot criado!",
        description: `O bot "${newBot.name}" foi criado com sucesso e associado ao funil "${selectedFunnel.name}". Agora ele responderá automaticamente ao comando /start no Telegram.`,
      });

      setIsDialogOpen(false)
      setFormData({ nome: "", token: "", funil: "" })
    } catch (error) {
      console.error('Erro ao criar bot:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar bot. Verifique o token e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleDeleteBot = async (botId: string, botName: string) => {
    try {
      // Parar bot no serviço do Telegram
      telegramService.stopBot(botId);
      
      await removeBot(botId);
      
      toast({
        title: "Bot removido",
        description: `O bot "${botName}" foi removido com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao remover bot:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover bot",
        variant: "destructive"
      });
    }
  };

  const handleToggleBotStatus = async (botId: string) => {
    try {
      await toggleBotStatus(botId);
      
      toast({
        title: "Status alterado",
        description: "Status do bot alterado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao alterar status do bot:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do bot",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="section-header">
        <h1 className="page-title text-white">Bots do Telegram</h1>
        <p className="page-subtitle text-white">Gerencie seus bots automatizados e acompanhe o desempenho</p>
      </div>

      {/* Estatísticas Globais */}
      {globalStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/70">Total de Usuários</p>
                  <p className="text-2xl font-bold text-white">{globalStats.totalUsers}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/70">Usuários Ativos</p>
                  <p className="text-2xl font-bold text-white">{globalStats.activeUsers}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-600/20">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/70">Novos Hoje</p>
                  <p className="text-2xl font-bold text-white">{globalStats.newUsersToday}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600/20">
                  <UserPlus className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/70">Esta Semana</p>
                  <p className="text-2xl font-bold text-white">{globalStats.newUsersThisWeek}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600/20">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">Seus Bots</h2>
          <p className="text-white/70">Gerencie e monitore seus bots do Telegram</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Bot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Bot</DialogTitle>
              <DialogDescription>
                Configure um novo bot do Telegram para automatizar suas vendas
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Bot</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Bot de Vendas"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="token">Token do Bot</Label>
                <Input
                  id="token"
                  placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                  value={formData.token}
                  onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Obtenha o token com @BotFather no Telegram
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="funil">Funil Associado</Label>
                <Select value={formData.funil} onValueChange={(value) => setFormData({ ...formData, funil: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um funil" />
                  </SelectTrigger>
                  <SelectContent>
                    {funnels.map((funnel) => (
                      <SelectItem key={funnel.id} value={funnel.id}>
                        {funnel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Criando..." : "Criar Bot"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Bots */}
      {botsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : bots.length === 0 ? (
        <Card className="empty-state">
          <CardContent className="p-12 text-center">
            <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Nenhum bot criado</h3>
            <p className="text-white/70 mb-6">
              Crie seu primeiro bot para começar a automatizar suas vendas no Telegram
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Bot
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots.map((bot) => (
            <Card key={bot.id} className="bot-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-white">{bot.name}</CardTitle>
                      <CardDescription className="text-white/70">
                        {bot.status === "Ativo" ? "Bot ativo" : "Bot pausado"}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={bot.status === "Ativo" ? "default" : "secondary"}>
                    {bot.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{bot.messages}</p>
                    <p className="text-sm text-white/70">Mensagens</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{bot.conversions}</p>
                    <p className="text-sm text-white/70">Conversões</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Performance</span>
                    <span className="text-white">{bot.performance}%</span>
                  </div>
                  <Progress value={bot.performance} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Última atividade</span>
                  <span className="text-white">{bot.lastActive}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleBotStatus(bot.id)}
                    className="flex-1"
                  >
                    {bot.status === "Ativo" ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Ativar
                      </>
                    )}
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover Bot</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja remover o bot "{bot.name}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteBot(bot.id, bot.name)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default BotsPage