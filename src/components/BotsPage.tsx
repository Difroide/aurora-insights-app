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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bots</h1>
            <p className="text-muted-foreground">Gerencie seus bots automatizados</p>
          </div>
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

      {/* Bots Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Seus Bots</CardTitle>
          <CardDescription>Lista completa dos bots e suas métricas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bots.map((bot) => (
              <Card key={bot.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{bot.name}</CardTitle>
                        <Badge variant={bot.status === 'Ativo' ? 'default' : 'secondary'} className="text-xs">
                          {bot.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        {bot.status === 'Ativo' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Mensagens</p>
                        <p className="font-semibold">{bot.messages.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Conversões</p>
                        <p className="font-semibold">{bot.conversions}</p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Performance</span>
                        <span className="font-medium">{bot.performance}%</span>
                      </div>
                      <Progress value={bot.performance} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Última atividade</span>
                      <span>{bot.lastActive}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Templates</CardTitle>
            <CardDescription>Use templates prontos</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Bot className="h-4 w-4 mr-2" />
              Ver Templates
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Analytics</CardTitle>
            <CardDescription>Relatórios detalhados</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <BarChart3 className="h-4 w-4 mr-2" />
              Ver Relatórios
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configurações</CardTitle>
            <CardDescription>Ajustes globais</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="secondary">
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default BotsPage;