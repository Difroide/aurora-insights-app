import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useState } from "react"
import { 
  Bot,
  Plus,
  Play,
  Pause,
  Settings,
  BarChart3,
  MessageSquare,
  Zap,
} from "lucide-react"

const bots = [
  { 
    id: 1,
    name: "Bot Atendimento", 
    status: "Ativo", 
    messages: 1247,
    conversions: 23,
    lastActive: "2 min atrás",
    performance: 89
  },
  { 
    id: 2,
    name: "Bot Vendas", 
    status: "Ativo", 
    messages: 856,
    conversions: 45,
    lastActive: "5 min atrás",
    performance: 92
  },
  { 
    id: 3,
    name: "Bot Suporte", 
    status: "Pausado", 
    messages: 342,
    conversions: 12,
    lastActive: "1 hora atrás",
    performance: 78
  },
  { 
    id: 4,
    name: "Bot FAQ", 
    status: "Ativo", 
    messages: 567,
    conversions: 8,
    lastActive: "10 min atrás",
    performance: 85
  },
]

const funis = [
  { id: "1", name: "Funil de Vendas Premium" },
  { id: "2", name: "Funil Webinar Gratuito" },
  { id: "3", name: "Funil E-book Marketing" },
  { id: "4", name: "Funil Consultoria" },
]

const BotsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    token: "",
    funil: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Novo bot:", formData)
    setIsDialogOpen(false)
    setFormData({ nome: "", token: "", funil: "" })
  }
  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="breadcrumb-nav">
        <span>Início</span>
        <span>•</span>
        <span className="text-foreground font-medium">Bots</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="section-header">
          <h1 className="page-title">Bots Inteligentes</h1>
          <p className="page-subtitle">Gerencie e monitore seus assistentes automatizados</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Bot
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Criar Novo Bot</DialogTitle>
              <DialogDescription>
                Configure as informações básicas do seu novo bot.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  placeholder="Digite o nome do bot"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="token">Token</Label>
                <Input
                  id="token"
                  placeholder="Digite o token do bot"
                  value={formData.token}
                  onChange={(e) => setFormData(prev => ({ ...prev, token: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="funil">Funil</Label>
                <Select
                  value={formData.funil}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, funil: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um funil" />
                  </SelectTrigger>
                  <SelectContent>
                    {funis.map((funil) => (
                      <SelectItem key={funil.id} value={funil.id}>
                        {funil.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Criar Bot
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Bots Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">🤖 Seus Assistentes</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {bots.map((bot) => (
            <Card key={bot.id} className="metric-card">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="icon-badge">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">{bot.name}</CardTitle>
                      <div className="status-indicator mt-1">
                        <div className={`w-2 h-2 rounded-full ${bot.status === 'Ativo' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className={bot.status === 'Ativo' ? 'text-green-600' : 'text-gray-500'}>{bot.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10">
                      {bot.status === 'Ativo' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-4">
                <div className="info-grid grid-cols-2">
                  <div className="info-item">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Mensagens</span>
                    </div>
                    <span className="font-semibold">{bot.messages.toLocaleString()}</span>
                  </div>
                  
                  <div className="info-item">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Conversões</span>
                    </div>
                    <span className="font-semibold">{bot.conversions}</span>
                  </div>
                </div>
                
                <div className="divider-section">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <BarChart3 className="h-4 w-4" />
                      Performance
                    </span>
                    <span className="font-medium">{bot.performance}%</span>
                  </div>
                  <Progress value={bot.performance} className="h-2" />
                </div>
                
                <div className="info-item pt-2">
                  <span className="text-muted-foreground text-xs">Última atividade</span>
                  <span className="text-xs font-medium">{bot.lastActive}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

    </div>
  )
}

export default BotsPage;