import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { 
  Zap,
  Plus,
  Play,
  Pause,
  Settings,
  BarChart3,
  Users,
  TrendingUp,
  Eye,
  Edit
} from "lucide-react"

const funis = [
  { 
    id: 1,
    name: "Funil de Vendas Premium", 
    status: "Ativo", 
    leads: 1547,
    conversions: 234,
    conversionRate: 15.1,
    revenue: 45600,
    lastUpdate: "2 min atrás"
  },
  { 
    id: 2,
    name: "Funil Webinar Gratuito", 
    status: "Ativo", 
    leads: 2856,
    conversions: 142,
    conversionRate: 5.0,
    revenue: 12800,
    lastUpdate: "5 min atrás"
  },
  { 
    id: 3,
    name: "Funil E-book Marketing", 
    status: "Pausado", 
    leads: 892,
    conversions: 67,
    conversionRate: 7.5,
    revenue: 8900,
    lastUpdate: "1 hora atrás"
  },
  { 
    id: 4,
    name: "Funil Consultoria", 
    status: "Ativo", 
    leads: 567,
    conversions: 89,
    conversionRate: 15.7,
    revenue: 67500,
    lastUpdate: "10 min atrás"
  },
]

const chartData = [
  { name: 'Seg', leads: 45, conversions: 12 },
  { name: 'Ter', leads: 67, conversions: 18 },
  { name: 'Qua', leads: 89, conversions: 25 },
  { name: 'Qui', leads: 123, conversions: 34 },
  { name: 'Sex', leads: 156, conversions: 42 },
  { name: 'Sab', leads: 98, conversions: 28 },
  { name: 'Dom', leads: 76, conversions: 19 },
]

const FunisPage = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Funis de Vendas</h1>
          <p className="text-muted-foreground">Gerencie suas estratégias de conversão</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Funil
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Funis</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">3 ativos, 1 pausado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Totais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.862</div>
            <p className="text-xs text-muted-foreground">+18% este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">532</div>
            <p className="text-xs text-muted-foreground">Taxa média de 9.1%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 134.800</div>
            <p className="text-xs text-muted-foreground">+25% este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Semanal</CardTitle>
          <CardDescription>Leads capturados vs conversões nos últimos 7 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Bar dataKey="leads" fill="hsl(var(--chart-1))" radius={4} />
              <Bar dataKey="conversions" fill="hsl(var(--chart-2))" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Funis Table */}
      <Card>
        <CardHeader>
          <CardTitle>Seus Funis</CardTitle>
          <CardDescription>Performance detalhada de cada funil de vendas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Conversões</TableHead>
                <TableHead>Taxa</TableHead>
                <TableHead>Receita</TableHead>
                <TableHead>Atualizado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funis.map((funil) => (
                <TableRow key={funil.id}>
                  <TableCell className="font-medium">{funil.name}</TableCell>
                  <TableCell>
                    <Badge variant={funil.status === 'Ativo' ? 'default' : 'secondary'}>
                      {funil.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{funil.leads.toLocaleString()}</TableCell>
                  <TableCell>{funil.conversions}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress value={funil.conversionRate} className="w-[60px] h-2" />
                      <span className="text-sm text-muted-foreground">{funil.conversionRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">R$ {funil.revenue.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">{funil.lastUpdate}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        {funil.status === 'Ativo' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
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
            <CardDescription>Funis pré-configurados</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Zap className="h-4 w-4 mr-2" />
              Explorar Templates
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">A/B Testing</CardTitle>
            <CardDescription>Teste diferentes versões</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <BarChart3 className="h-4 w-4 mr-2" />
              Criar Teste
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Automações</CardTitle>
            <CardDescription>Configure gatilhos automáticos</CardDescription>
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

export default FunisPage;