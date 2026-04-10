import { useState, useCallback, useEffect, useRef } from 'react';
import { initDB, getAllAutomations, deleteAutomation, getPendingTasks, addNotification } from '@/lib/db';
import { executor } from '@/lib/executor';
import { scheduler } from '@/lib/scheduler';
import { whatsAppManager } from '@/lib/whatsapp';
import { parseNaturalLanguage, createAutomationFromParsed, automationTemplates, availableActions } from '@/lib/automationBuilder';
import type { AutomationAction } from '@/lib/automationBuilder';

export interface AgentState {
  isReady: boolean;
  isProcessing: boolean;
  automations: any[];
  tasks: any[];
  whatsappConnections: any[];
}

export function useAgent() {
  const [state, setState] = useState<AgentState>({
    isReady: false,
    isProcessing: false,
    automations: [],
    tasks: [],
    whatsappConnections: [],
  });

  const refreshInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const init = async () => {
      await initDB();
      await scheduler.start();
      await refreshData();
      setState(prev => ({ ...prev, isReady: true }));
    };

    init();

    refreshInterval.current = setInterval(refreshData, 5000);

    return () => {
      scheduler.stop();
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, []);

  const refreshData = useCallback(async () => {
    const [automations, tasks] = await Promise.all([
      getAllAutomations(),
      getPendingTasks(),
    ]);

    setState(prev => ({
      ...prev,
      automations,
      tasks,
      whatsappConnections: whatsAppManager.getWhatsAppConnections(),
    }));
  }, []);

  const processCommand = useCallback(async (input: string) => {
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const parsed = parseNaturalLanguage(input);
      
      const automation = await createAutomationFromParsed(
        parsed.name,
        parsed.actions,
        parsed.schedule
      );

      if (!parsed.schedule) {
        await executor.execute(automation.id);
      }

      await refreshData();

      return {
        success: true,
        automation,
        message: parsed.schedule 
          ? `Created scheduled automation: "${parsed.name}"`
          : `Executed automation: "${parsed.name}"`,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      
      await addNotification({
        title: 'Command Failed',
        body: message,
        type: 'error',
        read: false,
      });

      return { success: false, error: message };
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [refreshData]);

  const createFromTemplate = useCallback(async (templateId: string, customizations: any = {}) => {
    const template = automationTemplates.find(t => t.id === templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const actions = template.actions.map((a: any) => ({
      ...a,
      config: { ...a.config, ...customizations[a.id] },
    }));

    const automation = await createAutomationFromParsed(
      customizations.name || template.name,
      actions,
      customizations.schedule
    );

    await refreshData();
    return automation;
  }, [refreshData]);

  const createCustomAutomation = useCallback(async (
    name: string,
    actions: AutomationAction[],
    schedule?: string
  ) => {
    const automation = await createAutomationFromParsed(name, actions, schedule);
    await refreshData();
    return automation;
  }, [refreshData]);

  const runAutomation = useCallback(async (automationId: string) => {
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const result = await executor.execute(automationId);
      await refreshData();
      return { success: true, result };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [refreshData]);

  const scheduleAutomation = useCallback(async (automationId: string, schedule: string) => {
    await scheduler.scheduleAutomation(automationId, schedule);
    await refreshData();
  }, [refreshData]);

  const cancelSchedule = useCallback(async (automationId: string) => {
    await scheduler.cancelSchedule(automationId);
    await refreshData();
  }, [refreshData]);

  const deleteAutomationById = useCallback(async (id: string) => {
    await deleteAutomation(id);
    await refreshData();
  }, [refreshData]);

  const connectWhatsApp = useCallback(async (phoneNumber: string, name?: string) => {
    const connection = await whatsAppManager.connect(phoneNumber, name);
    await refreshData();
    return connection;
  }, [refreshData]);

  const sendWhatsAppMessage = useCallback(async (phone: string, message: string) => {
    return whatsAppManager.sendMessage(phone, message);
  }, []);

  return {
    ...state,
    processCommand,
    createFromTemplate,
    createCustomAutomation,
    runAutomation,
    scheduleAutomation,
    cancelSchedule,
    deleteAutomation: deleteAutomationById,
    connectWhatsApp,
    sendWhatsAppMessage,
    refreshData,
    templates: automationTemplates,
    actions: availableActions,
  };
}
