import { saveTask, addNotification, getAutomation, saveAutomation } from './db';

export class AutomationExecutor {
  private abortControllers: Map<string, AbortController> = new Map();

  async execute(automationId: string, params: any = {}) {
    const automation = await getAutomation(automationId);
    if (!automation) {
      throw new Error('Automation not found');
    }

    const taskId = `task-${Date.now()}`;
    const abortController = new AbortController();
    this.abortControllers.set(taskId, abortController);

    await saveTask({
      id: taskId,
      automationId,
      status: 'running',
      createdAt: new Date(),
      startedAt: new Date(),
    });

    const log = async (message: string) => {
      automation.logs.push(`[${new Date().toISOString()}] ${message}`);
      await saveAutomation(automation);
    };

    try {
      await log('Starting automation execution...');

      let result: any;

      if (automation.type === 'code' && automation.code) {
        result = await this.executeCode(automation.code, params, abortController.signal, log);
      } else if (automation.config?.actions) {
        result = await this.executeActions(automation.config.actions, params, abortController.signal, log);
      }

      await saveTask({
        id: taskId,
        automationId,
        status: 'completed',
        createdAt: new Date(),
        startedAt: new Date(),
        completedAt: new Date(),
        result,
      });

      automation.lastRun = new Date();
      automation.runCount++;
      await saveAutomation(automation);

      await addNotification({
        title: 'Automation Completed',
        body: `"${automation.name}" completed successfully`,
        type: 'success',
        read: false,
      });

      await log('Automation completed successfully');
      return { success: true, result, taskId };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await saveTask({
        id: taskId,
        automationId,
        status: 'failed',
        createdAt: new Date(),
        startedAt: new Date(),
        completedAt: new Date(),
        error: errorMessage,
      });

      await addNotification({
        title: 'Automation Failed',
        body: `"${automation.name}" failed: ${errorMessage}`,
        type: 'error',
        read: false,
      });

      await log(`Automation failed: ${errorMessage}`);
      throw error;
    } finally {
      this.abortControllers.delete(taskId);
    }
  }

  private async executeCode(code: string, _params: any, signal: AbortSignal, log: (msg: string) => Promise<void>) {
    const context = {
      console: {
        log: async (...args: any[]) => {
          await log(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        },
        error: async (...args: any[]) => {
          await log('ERROR: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        },
      },
      fetch: this.createSafeFetch(signal),
      setTimeout: (fn: Function, ms: number) => {
        if (signal.aborted) return;
        const id = setTimeout(fn, ms);
        signal.addEventListener('abort', () => clearTimeout(id));
        return id;
      },
      notify: async (title: string, body: string) => {
        await this.showNotification(title, body);
      },
      download: (filename: string, content: string, type = 'text/plain') => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      },
      localStorage: {
        get: (key: string) => localStorage.getItem(key),
        set: (key: string, value: string) => localStorage.setItem(key, value),
        remove: (key: string) => localStorage.removeItem(key),
      },
      now: () => new Date(),
      sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
    };

    const wrappedCode = `
      return (async () => {
        ${code}
      })();
    `;

    const fn = new Function(...Object.keys(context), wrappedCode);
    
    if (signal.aborted) {
      throw new Error('Automation was cancelled');
    }

    return fn(...Object.values(context));
  }

  private async executeActions(actions: any[], _params: any, signal: AbortSignal, log: (msg: string) => Promise<void>) {
    const results: any = {};

    for (const action of actions) {
      if (signal.aborted) {
        throw new Error('Automation was cancelled');
      }

      await log(`Executing action: ${action.type}`);
      const result = await this.executeAction(action, results, signal);
      results[action.type] = result;
    }

    return results;
  }

  private async executeAction(config: any, _context: any, signal: AbortSignal) {
    switch (config.type) {
      case 'fetch':
        const response = await fetch(config.url, {
          method: config.method || 'GET',
          headers: config.headers,
          body: config.body ? JSON.stringify(config.body) : undefined,
          signal,
        });
        return {
          status: response.status,
          data: await response.json().catch(() => null),
          text: await response.text().catch(() => null),
        };

      case 'notify':
        await this.showNotification(config.title, config.body);
        return { notified: true };

      case 'delay':
        await new Promise(resolve => setTimeout(resolve, config.ms || 1000));
        return { delayed: config.ms || 1000 };

      case 'whatsapp':
        return this.sendWhatsAppMessage(config.phone, config.message);

      case 'email':
        this.sendEmail(config.to, config.subject, config.body);
        return { sent: true };

      case 'download':
        this.downloadFile(config.filename, config.content, config.type);
        return { downloaded: true };

      case 'clipboard':
        await navigator.clipboard.writeText(config.text);
        return { copied: true };

      default:
        return { executed: true, type: config.type };
    }
  }

  private createSafeFetch(signal: AbortSignal) {
    return (url: string, options: RequestInit = {}) => {
      return fetch(url, { ...options, signal });
    };
  }

  private async showNotification(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icon-192x192.png' });
    }
  }

  private sendWhatsAppMessage(phone: string, message: string) {
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    return { opened: true };
  }

  private sendEmail(to: string, subject: string, body: string) {
    const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    return { opened: true };
  }

  private downloadFile(filename: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  cancel(taskId: string) {
    const controller = this.abortControllers.get(taskId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(taskId);
    }
  }
}

export const executor = new AutomationExecutor();
