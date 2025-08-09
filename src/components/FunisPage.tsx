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
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Funis de Vendas</h1>
          <p className="text-muted-foreground">Gerencie suas estratégias de conversão</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Funil
        </Button>
      </div>



      {/* Funis Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Seus Funis</CardTitle>
          <CardDescription>Performance detalhada de cada funil de vendas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
            {funis.map((funil) => (
              <Card key={funil.id} className="relative card-hover hover-scale">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{funil.name}</CardTitle>
                        <Badge variant={funil.status === 'Ativo' ? 'default' : 'secondary'} className="text-xs">
                          {funil.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        {funil.status === 'Ativo' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Leads</p>
                        <p className="font-semibold">{funil.leads.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Conversões</p>
                        <p className="font-semibold">{funil.conversions}</p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Taxa de Conversão</span>
                        <span className="font-medium">{funil.conversionRate}%</span>
                      </div>
                      <Progress value={funil.conversionRate} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Receita</span>
                      <span className="font-medium">R$ {funil.revenue.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Atualizado</span>
                      <span>{funil.lastUpdate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default FunisPage;