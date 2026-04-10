import { useState, useCallback } from 'react';
import type { AutomationTask, AgentDecision } from '@/types';
import { automationEngine } from '@/lib/automationEngine';

export function useAutomation() {
  const [tasks, setTasks] = useState<AutomationTask[]>([]);
  const [currentTask, setCurrentTask] = useState<AutomationTask | null>(null);

  const createTask = useCallback(async (description: string): Promise<AgentDecision> => {
    const decision = await automationEngine.analyzeRequest(description);
    return decision;
  }, []);

  const executeTask = useCallback(async (description: string, decision: AgentDecision) => {
    const taskId = `task-${Date.now()}`;
    
    const newTask: AutomationTask = {
      id: taskId,
      name: `Automation: ${description.slice(0, 50)}...`,
      description,
      status: 'pending',
      approach: decision.approach,
      progress: 0,
      createdAt: new Date(),
      apiIntegrations: decision.recommendedAPIs,
      logs: [],
    };

    setTasks(prev => [...prev, newTask]);
    setCurrentTask(newTask);

    try {
      setCurrentTask(prev => prev ? { ...prev, status: 'running', logs: ['Starting automation...'] } : null);
      
      const result = await automationEngine.execute(decision, description, (progress, log) => {
        setCurrentTask(prev => prev ? { 
          ...prev, 
          progress,
          logs: [...prev.logs, log]
        } : null);
      });

      setCurrentTask(prev => prev ? { 
        ...prev, 
        status: 'completed',
        progress: 100,
        completedAt: new Date(),
        workflow: result.workflow,
        code: result.code,
        logs: [...prev.logs, 'Automation completed successfully!']
      } : null);

      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, status: 'completed', progress: 100, completedAt: new Date() }
          : t
      ));

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setCurrentTask(prev => prev ? { 
        ...prev, 
        status: 'failed',
        logs: [...prev.logs, `Error: ${errorMsg}`]
      } : null);

      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, status: 'failed' }
          : t
      ));
      throw error;
    }
  }, []);

  const getTaskById = useCallback((id: string) => {
    return tasks.find(t => t.id === id);
  }, [tasks]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (currentTask?.id === id) {
      setCurrentTask(null);
    }
  }, [currentTask]);

  return {
    tasks,
    currentTask,
    createTask,
    executeTask,
    getTaskById,
    deleteTask,
  };
}
