import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Trash2, 
  Play, 
  Save, 
  Clock,
  Globe,
  MessageCircle,
  Mail,
  Bell,
  Download,
  Copy,
  GitBranch,
  Filter,
  Type,
  FileJson,
  Search,
  Zap,
  LayoutTemplate
} from 'lucide-react';
import type { AutomationAction } from '@/lib/automationBuilder';

const iconMap: Record<string, React.ElementType> = {
  Globe,
  MessageCircle,
  Mail,
  Bell,
  Download,
  Copy,
  GitBranch,
  Clock,
  Filter,
  Type,
  FileJson,
  Search,
  Zap,
};

interface AutomationBuilderProps {
  actions: AutomationAction[];
  templates: any[];
  onSave: (name: string, actions: AutomationAction[], schedule?: string) => void;
  onRun: (actions: AutomationAction[]) => void;
}

export function AutomationBuilder({ actions, templates, onSave, onRun }: AutomationBuilderProps) {
  const [name, setName] = useState('');
  const [selectedActions, setSelectedActions] = useState<AutomationAction[]>([]);
  const [schedule, setSchedule] = useState('');
  const [activeTab, setActiveTab] = useState('actions');

  const addAction = (action: AutomationAction) => {
    setSelectedActions([...selectedActions, { ...action, id: `${action.id}-${Date.now()}` }]);
  };

  const removeAction = (index: number) => {
    setSelectedActions(selectedActions.filter((_, i) => i !== index));
  };

  const updateActionConfig = (index: number, config: any) => {
    const updated = [...selectedActions];
    updated[index] = { ...updated[index], config: { ...updated[index].config, ...config } };
    setSelectedActions(updated);
  };

  const handleSave = () => {
    if (name && selectedActions.length > 0) {
      onSave(name, selectedActions, schedule || undefined);
      setName('');
      setSelectedActions([]);
      setSchedule('');
    }
  };

  const handleRun = () => {
    if (selectedActions.length > 0) {
      onRun(selectedActions);
    }
  };

  const loadTemplate = (template: any) => {
    setName(template.name);
    setSelectedActions(template.actions.map((a: any) => ({ ...a, id: `${a.id}-${Date.now()}` })));
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b border-slate-100 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-violet-500" />
            <CardTitle className="text-lg">Automation Builder</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRun}
              disabled={selectedActions.length === 0}
            >
              <Play className="h-4 w-4 mr-1" />
              Run
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={!name || selectedActions.length === 0}
              className="bg-violet-500 hover:bg-violet-600"
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 overflow-hidden">
        <div className="space-y-4 h-full flex flex-col">
          <Input
            placeholder="Automation name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="flex gap-2">
            <Clock className="h-5 w-5 text-slate-400 mt-2" />
            <Input
              placeholder="Schedule (e.g., '1 hour', '1 day') - leave empty for manual"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="actions">Actions</TabsTrigger>
              <TabsTrigger value="templates">
                <LayoutTemplate className="h-4 w-4 mr-1" />
                Templates
              </TabsTrigger>
            </TabsList>

            <TabsContent value="actions" className="flex-1 flex gap-4 mt-4">
              <div className="w-1/2 border rounded-lg p-3">
                <h4 className="text-sm font-medium text-slate-700 mb-3">Available Actions</h4>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {actions.map((action) => {
                      const Icon = iconMap[action.icon || 'Zap'] || Zap;
                      return (
                        <button
                          key={action.id}
                          onClick={() => addAction(action)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                            <Icon className="h-4 w-4 text-violet-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700">{action.label}</p>
                            <p className="text-xs text-slate-400">{action.description}</p>
                          </div>
                          <Plus className="h-4 w-4 text-slate-400 ml-auto" />
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>

              <div className="w-1/2 border rounded-lg p-3">
                <h4 className="text-sm font-medium text-slate-700 mb-3">
                  Workflow ({selectedActions.length} actions)
                </h4>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {selectedActions.length === 0 && (
                      <p className="text-sm text-slate-400 text-center py-8">
                        Click actions to add them
                      </p>
                    )}
                    {selectedActions.map((action, index) => {
                      const Icon = iconMap[action.icon || 'Zap'] || Zap;
                      return (
                        <div
                          key={action.id}
                          className="p-3 rounded-lg bg-slate-50 border border-slate-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-violet-600" />
                              <span className="text-sm font-medium">{action.label}</span>
                            </div>
                            <button
                              onClick={() => removeAction(index)}
                              className="p-1 hover:bg-red-100 rounded"
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </button>
                          </div>
                          <div className="space-y-2">
                            {Object.entries(action.config).map(([key, value]) => (
                              <div key={key} className="flex gap-2">
                                <span className="text-xs text-slate-500 w-16 pt-1">{key}:</span>
                                <input
                                  type="text"
                                  value={String(value)}
                                  onChange={(e) => updateActionConfig(index, { [key]: e.target.value })}
                                  className="flex-1 text-xs px-2 py-1 border rounded"
                                  placeholder={key}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="flex-1 mt-4">
              <ScrollArea className="h-[350px]">
                <div className="grid grid-cols-1 gap-3">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => loadTemplate(template)}
                      className="p-4 rounded-lg border border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                          <Zap className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-800">{template.name}</h4>
                          <p className="text-sm text-slate-500">{template.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {template.actions.length} actions
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">
                              {template.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
