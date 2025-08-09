import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
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

const BotsPage = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bots</h1>
          <p className="text-muted-foreground">Gerencie seus bots automatizados</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Bot
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Bots</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">3 ativos, 1 pausado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Hoje</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.012</div>
            <p className="text-xs text-muted-foreground">+12% em relação a ontem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">88</div>
            <p className="text-xs text-muted-foreground">Taxa de 2.9%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Média</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">86%</div>
            <p className="text-xs text-muted-foreground">+3% este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Bots Table */}
      <Card>
        <CardHeader>
          <CardTitle>Seus Bots</CardTitle>
          <CardDescription>Lista completa dos bots e suas métricas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Mensagens</TableHead>
                <TableHead>Conversões</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Última Atividade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bots.map((bot) => (
                <TableRow key={bot.id}>
                  <TableCell className="font-medium">{bot.name}</TableCell>
                  <TableCell>
                    <Badge variant={bot.status === 'Ativo' ? 'default' : 'secondary'}>
                      {bot.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{bot.messages.toLocaleString()}</TableCell>
                  <TableCell>{bot.conversions}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress value={bot.performance} className="w-[60px] h-2" />
                      <span className="text-sm text-muted-foreground">{bot.performance}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{bot.lastActive}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline">
                        {bot.status === 'Ativo' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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