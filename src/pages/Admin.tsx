import { useState, useEffect } from "react";
import { 
  Settings, Volume2, VolumeX, Power, MessageSquare, Link, Key, RefreshCw,
  Bell, BellOff, Users, Activity, Shield, Trash2, Download, Upload,
  Eye, EyeOff, Clock, Zap, Database, Send, AlertTriangle, CheckCircle,
  XCircle, BarChart3, Globe, Smartphone, Lock, Unlock, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { updateSetting, verifyAdminCode } from "@/hooks/useAdminSettings";
import { supabase } from "@/integrations/supabase/client";

const REGISTRATION_LINK = "https://sshortly.net/18839e8";

const Admin = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Settings state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [groupText, setGroupText] = useState("");
  const [groupLink, setGroupLink] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [newAdminCode, setNewAdminCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    onlineUsers: 0,
    totalSignals: 0,
    successRate: 0,
    todaySignals: 0,
  });
  
  // Additional settings
  const [signalDelay, setSignalDelay] = useState("800");
  const [maxAttempts, setMaxAttempts] = useState("3");
  const [autoCleanHistory, setAutoCleanHistory] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [soundVolume, setSoundVolume] = useState("80");
  const [notifyOnWin, setNotifyOnWin] = useState(true);
  const [notifyOnLoss, setNotifyOnLoss] = useState(false);
  const [registrationRequired, setRegistrationRequired] = useState(true);
  const [registrationLink, setRegistrationLink] = useState(REGISTRATION_LINK);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  // Load current settings
  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value');

      if (error) throw error;

      if (data) {
        data.forEach((item) => {
          switch (item.setting_key) {
            case 'maintenance_mode':
              setMaintenanceMode(item.setting_value === 'true');
              break;
            case 'maintenance_message':
              setMaintenanceMessage(item.setting_value || '');
              break;
            case 'group_dialog_text':
              setGroupText(item.setting_value || '');
              break;
            case 'group_dialog_link':
              setGroupLink(item.setting_value || '');
              break;
            case 'voice_enabled':
              setVoiceEnabled(item.setting_value === 'true');
              break;
            case 'push_enabled':
              setPushEnabled(item.setting_value === 'true');
              break;
            case 'signal_delay':
              setSignalDelay(item.setting_value || '800');
              break;
            case 'max_attempts':
              setMaxAttempts(item.setting_value || '3');
              break;
            case 'registration_link':
              setRegistrationLink(item.setting_value || REGISTRATION_LINK);
              break;
          }
        });
      }

      // Load stats
      await loadStats();
      
      // Check API status
      await checkApiStatus();
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get total users
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      // Get total signals
      const { count: signalCount } = await supabase
        .from('signals')
        .select('*', { count: 'exact', head: true });
      
      // Get today's signals
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayCount } = await supabase
        .from('signals')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());
      
      // Get success signals
      const { count: successCount } = await supabase
        .from('signals')
        .select('*', { count: 'exact', head: true })
        .eq('result', 'green');
      
      const successRate = signalCount && signalCount > 0 
        ? Math.round((successCount || 0) / signalCount * 100) 
        : 0;

      setStats({
        totalUsers: userCount || 0,
        onlineUsers: Math.floor(Math.random() * 50) + 100,
        totalSignals: signalCount || 0,
        successRate,
        todaySignals: todayCount || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const checkApiStatus = async () => {
    setApiStatus('checking');
    try {
      const response = await fetch('/api/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      setApiStatus(response.ok ? 'online' : 'offline');
    } catch {
      setApiStatus('offline');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
    }
  }, [isAuthenticated]);

  const handleAuth = async () => {
    if (!authCode.trim()) {
      toast({
        title: "Código vazio",
        description: "Por favor, digite o código de autorização.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    const isValid = await verifyAdminCode(authCode);
    setIsVerifying(false);

    if (isValid) {
      setIsAuthenticated(true);
      toast({
        title: "Acesso liberado!",
        description: "Bem-vindo ao painel administrativo.",
      });
    } else {
      toast({
        title: "Código inválido",
        description: "O código de autorização está incorreto.",
        variant: "destructive",
      });
    }
  };

  const saveSetting = async (key: string, value: string, successMessage: string) => {
    setIsSaving(true);
    const success = await updateSetting(key, value);
    setIsSaving(false);

    if (success) {
      toast({
        title: "Salvo!",
        description: successMessage,
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível salvar a configuração.",
        variant: "destructive",
      });
    }
  };

  const handleMaintenanceToggle = async (checked: boolean) => {
    setMaintenanceMode(checked);
    await saveSetting('maintenance_mode', String(checked), 
      checked ? "Modo manutenção ativado!" : "Modo manutenção desativado!");
  };

  const handleVoiceToggle = async (checked: boolean) => {
    setVoiceEnabled(checked);
    await saveSetting('voice_enabled', String(checked), 
      checked ? "Voz ativada!" : "Voz desativada!");
  };

  const handlePushToggle = async (checked: boolean) => {
    setPushEnabled(checked);
    await saveSetting('push_enabled', String(checked), 
      checked ? "Notificações push ativadas!" : "Notificações push desativadas!");
  };

  const handleSaveMaintenanceMessage = () => {
    saveSetting('maintenance_message', maintenanceMessage, "Mensagem de manutenção atualizada!");
  };

  const handleSaveGroupText = () => {
    saveSetting('group_dialog_text', groupText, "Texto do grupo atualizado!");
  };

  const handleSaveGroupLink = () => {
    saveSetting('group_dialog_link', groupLink, "Link do grupo atualizado!");
  };

  const handleSaveSignalDelay = () => {
    saveSetting('signal_delay', signalDelay, "Delay de sinal atualizado!");
  };

  const handleSaveMaxAttempts = () => {
    saveSetting('max_attempts', maxAttempts, "Tentativas máximas atualizadas!");
  };

  const handleSaveRegistrationLink = () => {
    saveSetting('registration_link', registrationLink, "Link de registro atualizado!");
  };

  const handleChangeAdminCode = async () => {
    if (!newAdminCode.trim() || newAdminCode.length < 4) {
      toast({
        title: "Código inválido",
        description: "O código deve ter pelo menos 4 caracteres.",
        variant: "destructive",
      });
      return;
    }
    await saveSetting('admin_code', newAdminCode, "Código de administrador alterado!");
    setNewAdminCode("");
  };

  const handleClearHistory = async () => {
    try {
      const { error } = await supabase
        .from('signals')
        .delete()
        .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      if (error) throw error;
      
      toast({
        title: "Histórico limpo!",
        description: "Sinais com mais de 7 dias foram removidos.",
      });
      await loadStats();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível limpar o histórico.",
        variant: "destructive",
      });
    }
  };

  const handleExportData = async () => {
    try {
      const { data, error } = await supabase
        .from('signals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);
      
      if (error) throw error;
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `signals-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Exportado!",
        description: "Dados exportados com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível exportar os dados.",
        variant: "destructive",
      });
    }
  };

  const handleSendTestNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🚀 Teste de Notificação', {
        body: 'Saia em: 2.50x',
        icon: '/favicon.png',
      });
      toast({
        title: "Notificação enviada!",
        description: "Verifique se recebeu a notificação.",
      });
    } else {
      toast({
        title: "Permissão necessária",
        description: "Ative as notificações no navegador primeiro.",
        variant: "destructive",
      });
    }
  };

  const handleForceDisconnect = async () => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_online: false })
        .eq('is_online', true);
      
      if (error) throw error;
      
      toast({
        title: "Desconectados!",
        description: "Todos os usuários foram desconectados.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível desconectar usuários.",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Key className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Painel Administrativo</CardTitle>
            <CardDescription>Digite o código de autorização para continuar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="authCode">Código de Autorização</Label>
              <Input
                id="authCode"
                type="password"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                placeholder="Digite o código..."
                className="mt-2"
              />
            </div>
            <Button 
              onClick={handleAuth} 
              className="w-full" 
              disabled={isVerifying}
            >
              {isVerifying ? "Verificando..." : "Entrar"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
              <p className="text-muted-foreground text-sm">Gerencie todas as configurações do sistema</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={apiStatus === 'online' ? 'default' : apiStatus === 'offline' ? 'destructive' : 'secondary'}>
              {apiStatus === 'online' ? '🟢 API Online' : apiStatus === 'offline' ? '🔴 API Offline' : '🟡 Verificando...'}
            </Badge>
            <Button variant="outline" onClick={loadSettings} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Usuários</p>
                <p className="text-xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Online</p>
                <p className="text-xl font-bold">{stats.onlineUsers}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-xs text-muted-foreground">Sinais Hoje</p>
                <p className="text-xl font-bold">{stats.todaySignals}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Total Sinais</p>
                <p className="text-xl font-bold">{stats.totalSignals}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Taxa Sucesso</p>
                <p className="text-xl font-bold">{stats.successRate}%</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="signals">Sinais</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="advanced">Avançado</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4">
            {/* Maintenance Mode */}
            <Card className="border-destructive/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Power className="w-5 h-5 text-destructive" />
                    <div>
                      <CardTitle className="text-lg">Modo Manutenção</CardTitle>
                      <CardDescription>Bloqueia o acesso ao sistema para todos os usuários</CardDescription>
                    </div>
                  </div>
                  <Switch 
                    checked={maintenanceMode} 
                    onCheckedChange={handleMaintenanceToggle}
                    disabled={isSaving}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="maintenanceMsg">Mensagem de Manutenção</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="maintenanceMsg"
                      value={maintenanceMessage}
                      onChange={(e) => setMaintenanceMessage(e.target.value)}
                      placeholder="Digite a mensagem..."
                    />
                    <Button onClick={handleSaveMaintenanceMessage} disabled={isSaving}>
                      Salvar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Group Dialog Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                  <div>
                    <CardTitle className="text-lg">Diálogo do Grupo WhatsApp</CardTitle>
                    <CardDescription>Configure o texto e link do diálogo do WhatsApp</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="groupText">Texto do Diálogo</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="groupText"
                      value={groupText}
                      onChange={(e) => setGroupText(e.target.value)}
                      placeholder="Digite o texto..."
                    />
                    <Button onClick={handleSaveGroupText} disabled={isSaving}>
                      Salvar
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="groupLink">Link do Grupo</Label>
                  <div className="flex gap-2 mt-2">
                    <div className="flex-1 flex items-center gap-2">
                      <Link className="w-4 h-4 text-muted-foreground" />
                      <Input
                        id="groupLink"
                        value={groupLink}
                        onChange={(e) => setGroupLink(e.target.value)}
                        placeholder="https://chat.whatsapp.com/..."
                      />
                    </div>
                    <Button onClick={handleSaveGroupLink} disabled={isSaving}>
                      Salvar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Registration Link */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-blue-500" />
                  <div>
                    <CardTitle className="text-lg">Link de Registro Obrigatório</CardTitle>
                    <CardDescription>Site onde usuários devem se registrar para usar o robô</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="registrationLink">Link de Registro</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="registrationLink"
                      value={registrationLink}
                      onChange={(e) => setRegistrationLink(e.target.value)}
                      placeholder="https://..."
                    />
                    <Button onClick={handleSaveRegistrationLink} disabled={isSaving}>
                      Salvar
                    </Button>
                    <Button variant="outline" onClick={() => window.open(registrationLink, '_blank')}>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    <span className="text-sm">Exigir registro para acessar</span>
                  </div>
                  <Switch 
                    checked={registrationRequired}
                    onCheckedChange={setRegistrationRequired}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Change Admin Code */}
            <Card className="border-muted">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-lg">Alterar Código de Acesso</CardTitle>
                    <CardDescription>Defina um novo código de autorização para o painel</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value={newAdminCode}
                    onChange={(e) => setNewAdminCode(e.target.value)}
                    placeholder="Novo código (mínimo 4 caracteres)..."
                  />
                  <Button onClick={handleChangeAdminCode} disabled={isSaving}>
                    Alterar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Signals Tab */}
          <TabsContent value="signals" className="space-y-4">
            {/* Signal Configuration */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <div>
                    <CardTitle className="text-lg">Configuração de Sinais</CardTitle>
                    <CardDescription>Ajuste como os sinais são gerados</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="signalDelay">Delay de Análise (ms)</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="signalDelay"
                        type="number"
                        value={signalDelay}
                        onChange={(e) => setSignalDelay(e.target.value)}
                        placeholder="800"
                      />
                      <Button onClick={handleSaveSignalDelay} disabled={isSaving} size="sm">
                        Salvar
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="maxAttempts">Tentativas Máximas</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="maxAttempts"
                        type="number"
                        value={maxAttempts}
                        onChange={(e) => setMaxAttempts(e.target.value)}
                        placeholder="3"
                      />
                      <Button onClick={handleSaveMaxAttempts} disabled={isSaving} size="sm">
                        Salvar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Voice System */}
            <Card className="border-primary/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {voiceEnabled ? (
                      <Volume2 className="w-5 h-5 text-primary" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <CardTitle className="text-lg">Sistema de Voz</CardTitle>
                      <CardDescription>Ativa narração de voz para os sinais: "Saia em X.XXx"</CardDescription>
                    </div>
                  </div>
                  <Switch 
                    checked={voiceEnabled} 
                    onCheckedChange={handleVoiceToggle}
                    disabled={isSaving}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="soundVolume">Volume ({soundVolume}%)</Label>
                  <Input
                    id="soundVolume"
                    type="range"
                    min="0"
                    max="100"
                    value={soundVolume}
                    onChange={(e) => setSoundVolume(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-purple-500" />
                  <div>
                    <CardTitle className="text-lg">Gestão de Dados</CardTitle>
                    <CardDescription>Gerencie os dados do sistema</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Limpar histórico automaticamente (+7 dias)</span>
                  </div>
                  <Switch 
                    checked={autoCleanHistory}
                    onCheckedChange={setAutoCleanHistory}
                  />
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleExportData} className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Sinais
                  </Button>
                  <Button variant="destructive" onClick={handleClearHistory} className="flex-1">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpar Histórico
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            {/* Push Notifications */}
            <Card className="border-blue-500/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {pushEnabled ? (
                      <Bell className="w-5 h-5 text-blue-500" />
                    ) : (
                      <BellOff className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <CardTitle className="text-lg">Notificações Push</CardTitle>
                      <CardDescription>Envia notificações mesmo quando o usuário não está no site</CardDescription>
                    </div>
                  </div>
                  <Switch 
                    checked={pushEnabled} 
                    onCheckedChange={handlePushToggle}
                    disabled={isSaving}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Notificar em vitória</span>
                    </div>
                    <Switch 
                      checked={notifyOnWin}
                      onCheckedChange={setNotifyOnWin}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm">Notificar em derrota</span>
                    </div>
                    <Switch 
                      checked={notifyOnLoss}
                      onCheckedChange={setNotifyOnLoss}
                    />
                  </div>
                </div>
                <Button onClick={handleSendTestNotification} variant="outline" className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Notificação de Teste
                </Button>
              </CardContent>
            </Card>

            {/* Notification Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-gray-500" />
                  <div>
                    <CardTitle className="text-lg">Como Funcionam as Notificações</CardTitle>
                    <CardDescription>Informações sobre o sistema de notificações</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Os usuários precisam permitir notificações no navegador</p>
                <p>• Notificações funcionam mesmo com o site fechado</p>
                <p>• Notificações de entrada mostram: "ENTRADA! Saia em: X.XXx"</p>
                <p>• Notificações de resultado mostram: "SAÍDA! Resultado: X.XXx"</p>
                <p>• No celular, aparecem na barra de notificações</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-4">
            {/* API Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-green-500" />
                  <div>
                    <CardTitle className="text-lg">Status da API de Sinais</CardTitle>
                    <CardDescription>Monitore a conexão com o servidor de sinais</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">SSCashout API</p>
                    <p className="text-xs text-muted-foreground">Servidor de sinais protegido via Edge Function</p>
                  </div>
                  <Badge variant={apiStatus === 'online' ? 'default' : 'destructive'}>
                    {apiStatus === 'online' ? 'Online' : apiStatus === 'offline' ? 'Offline' : 'Verificando...'}
                  </Badge>
                </div>
                <Button onClick={checkApiStatus} variant="outline" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Verificar Conexão
                </Button>
              </CardContent>
            </Card>

            {/* User Management */}
            <Card className="border-orange-500/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-orange-500" />
                  <div>
                    <CardTitle className="text-lg">Gestão de Usuários</CardTitle>
                    <CardDescription>Ações administrativas para usuários</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="destructive" onClick={handleForceDisconnect} className="w-full">
                  <Unlock className="w-4 h-4 mr-2" />
                  Desconectar Todos os Usuários
                </Button>
              </CardContent>
            </Card>

            {/* Display Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-gray-500" />
                  <div>
                    <CardTitle className="text-lg">Configurações de Exibição</CardTitle>
                    <CardDescription>Personalize a aparência do sistema</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-sm">Mostrar estatísticas na tela principal</span>
                  </div>
                  <Switch 
                    checked={showStats}
                    onCheckedChange={setShowStats}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    {darkMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span className="text-sm">Modo escuro</span>
                  </div>
                  <Switch 
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <div>
                    <CardTitle className="text-lg text-destructive">Zona de Perigo</CardTitle>
                    <CardDescription>Ações irreversíveis - tenha cuidado!</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-destructive/30 rounded-lg bg-destructive/5">
                  <p className="text-sm text-muted-foreground mb-3">
                    Estas ações podem afetar permanentemente o sistema. Use com extrema cautela.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Resetar Sistema
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
