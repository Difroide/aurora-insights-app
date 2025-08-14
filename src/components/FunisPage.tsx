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
  Trash2,
  MessageSquare,
  Link
} from "lucide-react"
import { CreateFunnelModal } from "./CreateFunnelModal"
import { useFunnels, Funnel } from "@/hooks/useFunnels"
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

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
  const { funnels, loading, removeFunnel } = useFunnels();
  const { toast } = useToast();

  const handleSaveFunnel = (funnel: Funnel) => {
    // O hook useFunnels já está sendo usado no modal, então não precisamos fazer nada aqui
    // Apenas mostrar uma mensagem de sucesso
    toast({
      title: "Funil criado!",
      description: `O funil "${funnel.name}" foi criado com sucesso.`,
    });
  };

  const handleDeleteFunnel = (funnelId: string, funnelName: string) => {
    removeFunnel(funnelId);
    toast({
      title: "Funil removido",
      description: `O funil "${funnelName}" foi removido com sucesso.`,
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-8 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando funis...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="section-header">
          <h1 className="page-title text-white">Funis de Vendas</h1>
          <p className="page-subtitle text-white">Estratégias inteligentes para maximizar suas conversões</p>
        </div>
        <CreateFunnelModal onSave={handleSaveFunnel} />
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="icon-badge">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Total de Funis</p>
                <p className="text-2xl font-bold text-white">{funnels.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="icon-badge">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Leads Capturados</p>
                <p className="text-2xl font-bold text-white">1,234</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="icon-badge">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-white">23.4%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="icon-badge">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Vendas Realizadas</p>
                <p className="text-2xl font-bold text-white">289</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funis Section */}
      <section className="space-y-4">
        <Card className="metric-card">
          <CardContent className="p-6">
            {funnels.length === 0 ? (
              <div className="text-center py-12">
                <Zap className="h-12 w-12 text-white mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-white">Nenhum funil criado</h3>
                <p className="text-white mb-4">
                  Comece criando seu primeiro funil de vendas para automatizar suas conversões
                </p>
                <CreateFunnelModal onSave={handleSaveFunnel} />
              </div>
            ) : (
              <div className="space-y-3">
                {funnels.map((funnel) => (
                  <Card key={funnel.id} className="border border-border/50 hover:border-border transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="icon-badge">
                            <Zap className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-semibold text-base text-white">{funnel.name}</h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-white">
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {funnel.welcomeMessage.length > 50 
                                  ? `${funnel.welcomeMessage.substring(0, 50)}...`
                                  : funnel.welcomeMessage
                                }
                              </span>
                              <span className="flex items-center gap-1">
                                <Link className="h-3 w-3" />
                                {funnel.inlineButtons.length} botões
                              </span>
                              {funnel.mediaUrl && (
                                <span className="flex items-center gap-1">
                                  📎 Mídia
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-white mt-1">
                              Criado em {formatDate(funnel.createdAt)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10">
                            <Edit className="h-4 w-4 text-white" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10">
                            <Eye className="h-4 w-4 text-white" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4 text-white" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover Funil</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja remover o funil "{funnel.name}"? 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteFunnel(funnel.id, funnel.name)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

export default FunisPage;