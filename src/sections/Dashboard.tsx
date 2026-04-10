import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Clock, 
  CheckCircle, 
  Play,
  Pause,
  Trash2,
  Wifi,
  WifiOff,
  Download
} from 'lucide-react';

interface DashboardProps {
  automations: any[];
  isOffline: boolean;
  isInstalled: boolean;
  onRunAutomation: (id: string) => void;
  onDeleteAutomation: (id: string) => void;
  onInstall: () => void;
}

export function Dashboard({ 
  automations, 
  isOffline, 
  isInstalled,
  onRunAutomation, 
  onDeleteAutomation,
  onInstall
}: DashboardProps) {
  const activeCount = automations.filter(a => a.status === 'active').length;
  const scheduledCount = automations.filter(a => a.schedule).length;
  const totalRuns = automations.reduce((sum, a) => sum + (a.runCount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isOffline ? (
            <Badge variant="destructive" className="flex items-center gap-1">
              <WifiOff className="h-3 w-3" />
              Offline
            </Badge>
          ) : (
            <Badge variant="default" className="bg-green-500 flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              Online
            </Badge>
          )}
          
          {!isInstalled && (
            <Button size="sm" variant="outline" onClick={onInstall}>
              <Download className="h-4 w-4 mr-1" />
              Install App
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <Zap className="h-4 w-4 text-violet-500" />
            {automations.length} automations
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-blue-500" />
            {scheduledCount} scheduled
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            {totalRuns} runs
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <Zap className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{automations.length}</p>
                <p className="text-xs text-slate-500">Total Automations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Play className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-xs text-slate-500">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{scheduledCount}</p>
                <p className="text-xs text-slate-500">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalRuns}</p>
                <p className="text-xs text-slate-500">Total Runs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automations List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-violet-500" />
            Your Automations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {automations.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No automations yet. Create your first one!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {automations.map((automation) => (
                <div
                  key={automation.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-violet-300 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      automation.status === 'active' ? 'bg-green-100' : 'bg-slate-100'
                    }`}>
                      {automation.status === 'active' ? (
                        <Play className="h-4 w-4 text-green-600" />
                      ) : (
                        <Pause className="h-4 w-4 text-slate-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{automation.name}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{automation.config?.actions?.length || 0} actions</span>
                        {automation.schedule && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {automation.schedule}
                            </span>
                          </>
                        )}
                        {automation.lastRun && (
                          <>
                            <span>•</span>
                            <span>Last run: {new Date(automation.lastRun).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={automation.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                      {automation.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRunAutomation(automation.id)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteAutomation(automation.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
