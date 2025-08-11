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
  Edit,
  Trash2
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
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="space-y-3">
              {funis.map((funil) => (
                <Card key={funil.id} className="border border-border/50 hover:border-border transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="icon-badge">
                          <Zap className="h-5 w-5" />
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-base">{funil.name}</h3>
                          <div className="status-indicator mt-1">
                            <div className={`w-2 h-2 rounded-full ${funil.status === 'Ativo' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            <span className={`text-sm ${funil.status === 'Ativo' ? 'text-green-600' : 'text-gray-500'}`}>{funil.status}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-destructive/10 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10">
                          {funil.status === 'Ativo' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

export default FunisPage;