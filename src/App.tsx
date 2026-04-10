import { useState, useCallback, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Toaster, toast } from 'sonner';
import { 
  Bot, 
  MessageSquare, 
  Zap, 
  Settings,
  WifiOff,
  Download,
  MessageCircle,
  LayoutDashboard,
  Trash2
} from 'lucide-react';
import { CommandInterface } from '@/sections/CommandInterface';
import { AutomationBuilder } from '@/sections/AutomationBuilder';
import { Dashboard } from '@/sections/Dashboard';
import { WhatsAppPanel } from '@/sections/WhatsAppPanel';
import { useVoice } from '@/hooks/useVoice';
import { useAgent } from '@/hooks/useAgent';
import { usePWA } from '@/hooks/usePWA';
import './App.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'automation' | 'error';
  metadata?: any;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState('chat');

  const voice = useVoice();
  const agent = useAgent();
  const pwa = usePWA();

  useEffect(() => {
    pwa.requestNotificationPermission();
  }, []);

  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);

    const result = await agent.processCommand(content);

    const assistantMessage: Message = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content: result.success 
        ? (result.message || 'Done!')
        : `Error: ${result.error || 'Unknown error'}`,
      timestamp: new Date(),
      type: result.success ? 'automation' : 'error',
      metadata: result.automation ? { automationId: result.automation.id } : undefined,
    };

    setMessages(prev => [...prev, assistantMessage]);

    if (voice.isSupported && result.success && result.message) {
      voice.speak(result.message);
    }

    if (result.success) {
      agent.refreshData();
    }
  }, [agent, voice]);

  const handleSaveAutomation = useCallback(async (
    name: string, 
    actions: any[], 
    schedule?: string
  ) => {
    try {
      await agent.createCustomAutomation(name, actions, schedule);
      toast.success(`Automation "${name}" created!`);
      agent.refreshData();
    } catch (error) {
      toast.error('Failed to create automation');
    }
  }, [agent]);

  const handleRunActions = useCallback(async (actions: any[]) => {
    try {
      const tempId = `temp-${Date.now()}`;
      await agent.createCustomAutomation('Temporary', actions);
      const result = await agent.runAutomation(tempId);
      
      if (result.success) {
        toast.success('Automation executed successfully!');
      } else {
        toast.error(result.error || 'Execution failed');
      }
    } catch (error) {
      toast.error('Failed to run automation');
    }
  }, [agent]);

  const handleConnectWhatsApp = useCallback(async (phone: string, name?: string) => {
    try {
      await agent.connectWhatsApp(phone, name || undefined);
      toast.success('WhatsApp connection initiated!');
    } catch (error) {
      toast.error('Failed to connect WhatsApp');
    }
  }, [agent]);

  const handleSendWhatsApp = useCallback(async (phone: string, message: string) => {
    const success = await agent.sendWhatsAppMessage(phone, message);
    if (success) {
      toast.success('WhatsApp opened with message!');
    } else {
      toast.error('Failed to open WhatsApp');
    }
  }, [agent]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  AI Personal Agent
                </h1>
                <p className="text-xs text-slate-500">
                  {pwa.isOffline ? 'Working offline' : 'Connected'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {pwa.isOffline && (
                <Badge variant="destructive" className="hidden sm:flex items-center gap-1">
                  <WifiOff className="h-3 w-3" />
                  Offline
                </Badge>
              )}

              {pwa.isInstallable && !pwa.isInstalled && (
                <Button size="sm" variant="outline" onClick={pwa.install}>
                  <Download className="h-4 w-4 mr-1" />
                  Install
                </Button>
              )}

              {messages.length > 0 && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={clearMessages}
                  className="text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Builder</span>
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="hidden lg:flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-0">
            <div className="h-[calc(100vh-12rem)]">
              <CommandInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                isProcessing={agent.isProcessing}
                voiceState={voice}
              />
            </div>
          </TabsContent>

          <TabsContent value="dashboard" className="mt-0">
            <Dashboard
              automations={agent.automations}
              isOffline={pwa.isOffline}
              isInstalled={pwa.isInstalled}
              onRunAutomation={agent.runAutomation}
              onDeleteAutomation={agent.deleteAutomation}
              onInstall={pwa.install}
            />
          </TabsContent>

          <TabsContent value="builder" className="mt-0">
            <div className="h-[calc(100vh-12rem)]">
              <AutomationBuilder
                actions={agent.actions}
                templates={agent.templates}
                onSave={handleSaveAutomation}
                onRun={handleRunActions}
              />
            </div>
          </TabsContent>

          <TabsContent value="whatsapp" className="mt-0">
            <div className="h-[calc(100vh-12rem)]">
              <WhatsAppPanel
                connections={agent.whatsappConnections}
                onConnect={handleConnectWhatsApp}
                onSendMessage={handleSendWhatsApp}
              />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold mb-4">App Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium">Offline Mode</p>
                      <p className="text-sm text-slate-500">Works without internet</p>
                    </div>
                    <Badge variant={pwa.isOffline ? 'default' : 'secondary'}>
                      {pwa.isOffline ? 'Active' : 'Ready'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium">Notifications</p>
                      <p className="text-sm text-slate-500">Get alerts from automations</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={pwa.requestNotificationPermission}
                    >
                      Enable
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium">Install App</p>
                      <p className="text-sm text-slate-500">Add to home screen</p>
                    </div>
                    {pwa.isInstalled ? (
                      <Badge variant="default" className="bg-green-500">Installed</Badge>
                    ) : pwa.isInstallable ? (
                      <Button size="sm" onClick={pwa.install}>
                        <Download className="h-4 w-4 mr-1" />
                        Install
                      </Button>
                    ) : (
                      <Badge variant="secondary">Not available</Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium">Voice Commands</p>
                      <p className="text-sm text-slate-500">Speak to control</p>
                    </div>
                    <Badge variant={voice.isSupported ? 'default' : 'secondary'}>
                      {voice.isSupported ? 'Available' : 'Not supported'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold mb-4">About</h3>
                <p className="text-sm text-slate-500">
                  AI Personal Agent v1.0 - Your offline-capable automation assistant.
                  All data is stored locally on your device.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App;
