import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { DollarSign, Users, ShoppingCart, Activity, Download, Eye, Settings, BarChart3, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="section-header">
          <h1 className="page-title">Dashboard Analytics</h1>
          <p className="page-subtitle">Visão geral completa das suas métricas e performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="mes">
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dia">Hoje</SelectItem>
              <SelectItem value="semana">Esta Semana</SelectItem>
              <SelectItem value="mes">Este Mês</SelectItem>
              <SelectItem value="ano">Este Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
        <div className="grid grid-cols-1 gap-6 animate-fade-in">
          <Card className="metric-card">
            <CardHeader>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value, name) => [
                      name === 'vendas' ? `${value} vendas` : `${value} usuários`,
                      name === 'vendas' ? 'Vendas' : 'Usuários'
                    ]}
                  />
                  <Area dataKey="vendas" fill="hsl(var(--primary))" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={0.6} />
                  <Area dataKey="usuarios" fill="hsl(var(--primary))" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>;
}