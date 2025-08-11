import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Users, ShoppingCart, Activity, Download, Eye, Settings, BarChart3 } from "lucide-react";
const chartData = [{
  name: 'Jan',
  vendas: 4000,
  usuarios: 2400
}, {
  name: 'Fev',
  vendas: 3000,
  usuarios: 1398
}, {
  name: 'Mar',
  vendas: 2000,
  usuarios: 9800
}, {
  name: 'Abr',
  vendas: 2780,
  usuarios: 3908
}, {
  name: 'Mai',
  vendas: 1890,
  usuarios: 4800
}, {
  name: 'Jun',
  vendas: 2390,
  usuarios: 3800
}];
const pieData = [{
  name: 'Desktop',
  value: 45,
  color: 'hsl(var(--chart-1))'
}, {
  name: 'Mobile',
  value: 35,
  color: 'hsl(var(--chart-2))'
}, {
  name: 'Tablet',
  value: 20,
  color: 'hsl(var(--chart-3))'
}];
const recentUsers = [{
  name: "Ana Silva",
  email: "ana@exemplo.com",
  status: "Ativo",
  value: "R$ 1.234"
}, {
  name: "João Santos",
  email: "joao@exemplo.com",
  status: "Pendente",
  value: "R$ 856"
}, {
  name: "Maria Costa",
  email: "maria@exemplo.com",
  status: "Ativo",
  value: "R$ 2.145"
}, {
  name: "Pedro Lima",
  email: "pedro@exemplo.com",
  status: "Inativo",
  value: "R$ 642"
}];
export function Dashboard() {
  return <div className="p-6 space-y-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="breadcrumb-nav">
        <span>Início</span>
        <span>•</span>
        <span className="text-foreground font-medium">Dashboard</span>
      </div>

      {/* Header */}
      <div className="section-header">
        <h1 className="page-title">Dashboard Analytics</h1>
        <p className="page-subtitle">Visão geral completa das suas métricas e performance</p>
      </div>

      {/* Metrics Cards */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="metric-card card-compact">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
                <div className="text-2xl font-bold mt-2">R$ 45.231</div>
              </div>
              <div className="icon-badge">
                <DollarSign className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">+20.1% em relação ao mês anterior</p>
            </CardContent>
          </Card>

          <Card className="metric-card card-compact">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">Usuários Ativos</CardTitle>
                <div className="text-2xl font-bold mt-2">2.350</div>
              </div>
              <div className="icon-badge">
                <Users className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">+180 novos usuários este mês</p>
            </CardContent>
          </Card>

          <Card className="metric-card card-compact">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">Vendas</CardTitle>
                <div className="text-2xl font-bold mt-2">12.234</div>
              </div>
              <div className="icon-badge">
                <ShoppingCart className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">+19% em relação ao mês anterior</p>
            </CardContent>
          </Card>

          <Card className="metric-card card-compact">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conversão</CardTitle>
                <div className="text-2xl font-bold mt-2">3.2%</div>
              </div>
              <div className="icon-badge">
                <Activity className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">+0.5% em relação ao mês anterior</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Charts Section */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          <Card className="metric-card bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
            </CardHeader>
          <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Area dataKey="vendas" fill="hsl(var(--foreground))" stroke="hsl(var(--foreground))" strokeWidth={2} />
                  <Area dataKey="usuarios" fill="hsl(var(--muted-foreground))" stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
          </CardContent>
        </Card>

          <Card className="metric-card">
            <CardHeader>
            </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({
                  name,
                  percent
                }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
          </Card>
        </div>
      </section>

      {/* Activity Section */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 metric-card">
            <CardHeader>
            </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.map((user, index) => <TableRow key={index}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'Ativo' ? 'default' : user.status === 'Pendente' ? 'secondary' : 'destructive'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{user.value}</TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>
          </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader>
            </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Vendas</span>
                <span>75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Usuários</span>
                <span>60%</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Receita</span>
                <span>85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Conversão</span>
                <span>45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
          </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <Card className="metric-card">
            <CardHeader>
            </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Baixar Relatório
            </Button>
          </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader>
            </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              Ver Analytics
            </Button>
          </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader>
            </CardHeader>
          <CardContent>
            <Button className="w-full" variant="secondary">
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Button>
          </CardContent>
          </Card>
        </div>
      </section>
    </div>;
}