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
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="breadcrumb-nav">
        <span>Início</span>
        <span>•</span>
        <span className="text-foreground font-medium">Funis de Vendas</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="section-header">
          <h1 className="page-title">Funis de Vendas</h1>
          <p className="page-subtitle">Estratégias inteligentes para maximizar suas conversões</p>
        </div>
        <Button className="btn-gradient">
          <Plus className="h-4 w-4 mr-2" />
          Novo Funil
        </Button>
      </div>



      {/* Funis Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">⚡ Seus Funis de Conversão</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {funis.map((funil) => (
            <Card key={funil.id} className="metric-card">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="icon-badge">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold leading-tight">{funil.name}</CardTitle>
                      <div className="status-indicator mt-1">
                        <div className={`w-2 h-2 rounded-full ${funil.status === 'Ativo' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className={funil.status === 'Ativo' ? 'text-green-600' : 'text-gray-500'}>{funil.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10">
                      {funil.status === 'Ativo' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-4">
                <div className="info-grid grid-cols-2">
                  <div className="info-item">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Leads</span>
                    </div>
                    <span className="font-semibold">{funil.leads.toLocaleString()}</span>
                  </div>
                  
                  <div className="info-item">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Conversões</span>
                    </div>
                    <span className="font-semibold">{funil.conversions}</span>
                  </div>
                </div>
                
                <div className="divider-section">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <BarChart3 className="h-4 w-4" />
                      Taxa de Conversão
                    </span>
                    <span className="font-medium">{funil.conversionRate}%</span>
                  </div>
                  <Progress value={funil.conversionRate} className="h-2" />
                </div>
                
                <div className="info-item">
                  <span className="text-muted-foreground text-sm">Receita Gerada</span>
                  <span className="font-bold text-green-600">R$ {funil.revenue.toLocaleString()}</span>
                </div>
                
                <div className="info-item pt-2">
                  <span className="text-muted-foreground text-xs">Última atualização</span>
                  <span className="text-xs font-medium">{funil.lastUpdate}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

export default FunisPage;