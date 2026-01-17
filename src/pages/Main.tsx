import { useState, useEffect } from "react";
import { Settings, Volume2, VolumeX, Power, MessageSquare, Link, Key, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { updateSetting, verifyAdminCode } from "@/hooks/useAdminSettings";
import { supabase } from "@/integrations/supabase/client";

const Main = () => {
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
  const [newAdminCode, setNewAdminCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
          }
        });
      }
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

  const handleSaveMaintenanceMessage = () => {
    saveSetting('maintenance_message', maintenanceMessage, "Mensagem de manutenção atualizada!");
  };

  const handleSaveGroupText = () => {
    saveSetting('group_dialog_text', groupText, "Texto do grupo atualizado!");
  };

  const handleSaveGroupLink = () => {
    saveSetting('group_dialog_link', groupLink, "Link do grupo atualizado!");
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
              <p className="text-muted-foreground text-sm">Gerencie as configurações do sistema</p>
            </div>
          </div>
          <Button variant="outline" onClick={loadSettings} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

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
        </Card>

        {/* Group Dialog Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-secondary" />
              <div>
                <CardTitle className="text-lg">Diálogo do Grupo</CardTitle>
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
      </div>
    </div>
  );
};

export default Main;
