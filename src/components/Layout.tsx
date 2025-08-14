import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Home, Filter, Bot, Settings, Menu, LogOut, ChevronLeft, ChevronRight, User, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isOnline } = useOnlineStatus();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: Filter, label: "Funís", path: "/funis" },
    { icon: Bot, label: "Bots", path: "/bots" },
    { icon: Settings, label: "Configurações", path: "/config" },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Aviso de conectividade */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <Alert variant="destructive" className="rounded-none border-0">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              Você está offline. Verifique sua conexão com a internet.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className={cn("bg-card border-r border-border flex flex-col transition-all duration-300", sidebarCollapsed ? "w-16" : "w-64")}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          {!sidebarCollapsed && (
            <h1 className="text-lg font-bold text-white">Aurora Insights</h1>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-8 w-8 p-0"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-border space-y-3">
          {/* User Section */}
          {user && (
            <div className={cn("flex items-center gap-3", sidebarCollapsed ? "justify-center" : "")}>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.email}</p>
                  <p className="text-xs text-white/70">Minha Conta</p>
                </div>
              )}
            </div>
          )}
          
          <Button 
            onClick={handleSignOut} 
            variant="outline" 
            size="sm" 
            className={cn("w-full", sidebarCollapsed ? "h-8 w-8 p-0" : "")}
          >
            {sidebarCollapsed ? (
              <LogOut className="h-4 w-4" />
            ) : (
              <>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 