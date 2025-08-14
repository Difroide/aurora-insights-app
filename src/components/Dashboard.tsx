import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar } from 'recharts';
import { DollarSign, Users, ShoppingCart, Activity, Download, Eye, Settings, BarChart3, ChevronDown, TrendingUp, TrendingDown, RefreshCw, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useState } from "react";
import { Link } from "react-router-dom";

export function Dashboard() {
  const { analytics, loading } = useAnalytics();
  const [timeRange, setTimeRange] = useState("mes");

  if (loading) {
    return (
      <div className="p-6 space-y-8 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-white">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Carregando analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6 space-y-8 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <BarChart3 className="h-12 w-12 text-white/50" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Nenhum dado disponível</h3>
            <p className="text-white/70 mb-6">
              Crie seu primeiro funil para começar a ver analytics
            </p>
            <div className="flex gap-2 justify-center">
              <Link to="/funis">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Funil
                </Button>
              </Link>
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (value: number) => {
    if (value >= 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="section-header">
          <h1 className="page-title text-white">Dashboard Analytics</h1>
          <p className="page-subtitle text-white">Visão geral completa das suas métricas e performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
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
                <CardTitle className="text-sm font-medium text-white/70">Receita Total</CardTitle>
                <div className="text-2xl font-bold mt-2 text-white">{formatCurrency(analytics.totalRevenue)}</div>
              </div>
              <div className="icon-badge">
                <DollarSign className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2">
                {getGrowthIcon(analytics.revenueGrowth)}
                <p className="text-xs text-white/70">
                  {formatPercentage(analytics.revenueGrowth)} em relação ao mês anterior
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card card-compact">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium text-white/70">Transações</CardTitle>
                <div className="text-2xl font-bold mt-2 text-white">{analytics.totalTransactions}</div>
              </div>
              <div className="icon-badge">
                <ShoppingCart className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2">
                {getGrowthIcon(analytics.transactionGrowth)}
                <p className="text-xs text-white/70">
                  {formatPercentage(analytics.transactionGrowth)} em relação ao mês anterior
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card card-compact">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium text-white/70">Bots Ativos</CardTitle>
                <div className="text-2xl font-bold mt-2 text-white">{analytics.activeBots}</div>
              </div>
              <div className="icon-badge">
                <Users className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2">
                {getGrowthIcon(analytics.userGrowth)}
                <p className="text-xs text-white/70">
                  {formatPercentage(analytics.userGrowth)} em relação ao mês anterior
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card card-compact">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium text-white/70">Taxa de Conversão</CardTitle>
                <div className="text-2xl font-bold mt-2 text-white">{analytics.conversionRate}%</div>
              </div>
              <div className="icon-badge">
                <Activity className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-white/70">
                {analytics.totalButtons} botões, {analytics.totalFunnels} funis
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Charts Section */}
      <section className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Receita por Mês */}
          <Card className="metric-card">
            <CardHeader>
              <CardTitle className="text-white">Receita por Mês</CardTitle>
              <CardDescription className="text-white/70">Evolução da receita nos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
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
                      name === 'revenue' ? formatCurrency(Number(value)) : `${value} transações`,
                      name === 'revenue' ? 'Receita' : 'Transações'
                    ]}
                  />
                  <Area 
                    dataKey="revenue" 
                    fill="hsl(var(--primary))" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2} 
                    fillOpacity={0.6} 
                  />
                  <Area 
                    dataKey="transactions" 
                    fill="hsl(var(--chart-2))" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2} 
                    fillOpacity={0.3} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance dos Funis */}
          <Card className="metric-card">
            <CardHeader>
              <CardTitle className="text-white">Performance dos Funis</CardTitle>
              <CardDescription className="text-white/70">Top 5 funis por receita</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.topFunnels.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.topFunnels}>
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
                      formatter={(value, name) => [
                        name === 'revenue' ? formatCurrency(Number(value)) : value,
                        name === 'revenue' ? 'Receita' : 'Conversões'
                      ]}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                    <Bar dataKey="conversions" fill="hsl(var(--chart-2))" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-center">
                    <BarChart3 className="h-8 w-8 text-white/50 mx-auto mb-2" />
                    <p className="text-white/70">Nenhum funil criado ainda</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Transactions & Top Performers */}
      <section className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transações Recentes */}
          <Card className="metric-card">
            <CardHeader>
              <CardTitle className="text-white">Transações Recentes</CardTitle>
              <CardDescription className="text-white/70">Últimas transações realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.recentTransactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-white/70">Funnel</TableHead>
                      <TableHead className="text-white/70">Valor</TableHead>
                      <TableHead className="text-white/70">Status</TableHead>
                      <TableHead className="text-white/70">Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.recentTransactions.slice(0, 5).map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium text-white">{transaction.funnel}</TableCell>
                        <TableCell className="text-white">{formatCurrency(transaction.value)}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                            {transaction.status === 'completed' ? 'Concluída' : 'Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">
                          {transaction.date.toLocaleDateString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex items-center justify-center h-[200px]">
                  <div className="text-center">
                    <ShoppingCart className="h-8 w-8 text-white/50 mx-auto mb-2" />
                    <p className="text-white/70">Nenhuma transação ainda</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Botões */}
          <Card className="metric-card">
            <CardHeader>
              <CardTitle className="text-white">Top Botões</CardTitle>
              <CardDescription className="text-white/70">Botões com maior receita</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.topButtons.length > 0 ? (
                <div className="space-y-4">
                  {analytics.topButtons.map((button, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-white">{button.name}</p>
                          <p className="text-sm text-white/70">{button.clicks} cliques</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">{formatCurrency(button.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px]">
                  <div className="text-center">
                    <Activity className="h-8 w-8 text-white/50 mx-auto mb-2" />
                    <p className="text-white/70">Nenhum botão criado ainda</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}