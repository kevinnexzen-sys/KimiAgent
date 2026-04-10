import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { AutomationTask } from '@/types';
import { 
  History, 
  Code, 
  Workflow,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskHistoryProps {
  tasks: AutomationTask[];
  onSelectTask: (task: AutomationTask) => void;
  onDeleteTask: (taskId: string) => void;
  selectedTaskId?: string;
}

const statusIcons = {
  pending: Clock,
  running: Loader2,
  completed: CheckCircle,
  failed: XCircle,
};

const statusColors = {
  pending: 'text-amber-500',
  running: 'text-blue-500',
  completed: 'text-green-500',
  failed: 'text-red-500',
};

const statusBgColors = {
  pending: 'bg-amber-50 border-amber-200',
  running: 'bg-blue-50 border-blue-200',
  completed: 'bg-green-50 border-green-200',
  failed: 'bg-red-50 border-red-200',
};

export function TaskHistory({ 
  tasks, 
  onSelectTask, 
  onDeleteTask,
  selectedTaskId 
}: TaskHistoryProps) {
  const sortedTasks = [...tasks].sort((a, b) => 
    b.createdAt.getTime() - a.createdAt.getTime()
  );

  if (tasks.length === 0) {
    return (
      <Card className="h-full border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center h-full py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <History className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-600 mb-2">
            No Tasks Yet
          </h3>
          <p className="text-sm text-slate-400 text-center max-w-xs">
            Your automation tasks will appear here once you create them
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b border-slate-100 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-violet-500" />
            <CardTitle className="text-lg">Task History</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      
      <ScrollArea className="flex-1">
        <CardContent className="p-4">
          <div className="space-y-3">
            {sortedTasks.map(task => {
              const StatusIcon = statusIcons[task.status];
              
              return (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className={cn(
                    'p-3 rounded-lg border-2 cursor-pointer transition-all',
                    selectedTaskId === task.id
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-slate-200 hover:border-violet-300 hover:shadow-sm'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                      statusBgColors[task.status]
                    )}>
                      <StatusIcon className={cn(
                        'h-4 w-4',
                        task.status === 'running' && 'animate-spin',
                        statusColors[task.status]
                      )} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-800 text-sm truncate">
                          {task.name}
                        </h4>
                        <Badge 
                          variant="secondary" 
                          className="text-xs flex items-center gap-1"
                        >
                          {task.approach === 'code' ? (
                            <Code className="h-3 w-3" />
                          ) : (
                            <Workflow className="h-3 w-3" />
                          )}
                          {task.approach}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                        {task.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>{task.createdAt.toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{task.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {task.apiIntegrations.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {task.apiIntegrations.length} API{task.apiIntegrations.length !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {task.status === 'running' && (
                        <div className="mt-2">
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {task.logs.length > 0 && task.status !== 'completed' && (
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {task.logs[task.logs.length - 1]}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTask(task.id);
                        }}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 className="h-3 w-3 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
