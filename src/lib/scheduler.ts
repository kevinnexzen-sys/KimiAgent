import { getAllAutomations, saveAutomation, addNotification } from './db';
import { executor } from './executor';

class TaskScheduler {
  private isRunning = false;

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Start the scheduler loop
    this.runSchedulerLoop();
  }

  stop() {
    this.isRunning = false;
  }

  private async runSchedulerLoop() {
    while (this.isRunning) {
      try {
        await this.checkAndRunScheduledTasks();
      } catch (error) {
        console.error('Scheduler error:', error);
      }
      // Check every minute
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
  }

  private async checkAndRunScheduledTasks() {
    const automations = await getAllAutomations();
    const now = new Date();

    for (const automation of automations) {
      if (automation.status !== 'active' || !automation.schedule) continue;

      const nextRun = automation.nextRun ? new Date(automation.nextRun) : null;
      
      if (nextRun && nextRun <= now) {
        this.runAutomation(automation.id);
        
        // Calculate next run time
        const nextRunTime = this.calculateNextRun(automation.schedule);
        automation.nextRun = nextRunTime;
        await saveAutomation(automation);
      }
    }
  }

  private async runAutomation(automationId: string) {
    try {
      await executor.execute(automationId);
    } catch (error) {
      console.error('Scheduled automation failed:', error);
    }
  }

  private calculateNextRun(schedule: string): Date {
    const now = new Date();
    const [value, unit] = schedule.split(' ');
    const numValue = parseInt(value);

    switch (unit) {
      case 'minute':
      case 'minutes':
        return new Date(now.getTime() + numValue * 60000);
      case 'hour':
      case 'hours':
        return new Date(now.getTime() + numValue * 3600000);
      case 'day':
      case 'days':
        return new Date(now.getTime() + numValue * 86400000);
      case 'week':
      case 'weeks':
        return new Date(now.getTime() + numValue * 604800000);
      default:
        return new Date(now.getTime() + 3600000);
    }
  }

  parseSchedule(schedule: string): { interval: number; description: string } {
    const schedules: Record<string, { interval: number; description: string }> = {
      '@minutely': { interval: 60000, description: 'Every minute' },
      '@hourly': { interval: 3600000, description: 'Every hour' },
      '@daily': { interval: 86400000, description: 'Every day' },
      '@weekly': { interval: 604800000, description: 'Every week' },
    };

    if (schedules[schedule]) {
      return schedules[schedule];
    }

    const match = schedule.match(/every\s+(\d+)\s+(\w+)/i);
    if (match) {
      const [, value, unit] = match;
      const numValue = parseInt(value);
      let interval = 3600000;

      switch (unit.toLowerCase()) {
        case 'minute':
        case 'minutes':
          interval = numValue * 60000;
          break;
        case 'hour':
        case 'hours':
          interval = numValue * 3600000;
          break;
        case 'day':
        case 'days':
          interval = numValue * 86400000;
          break;
      }

      return { interval, description: `Every ${value} ${unit}` };
    }

    return { interval: 3600000, description: 'Every hour' };
  }

  async scheduleAutomation(automationId: string, schedule: string): Promise<void> {
    const automations = await getAllAutomations();
    const automation = automations.find(a => a.id === automationId);
    
    if (!automation) {
      throw new Error('Automation not found');
    }

    const nextRun = this.calculateNextRun(schedule);
    automation.schedule = schedule;
    automation.nextRun = nextRun;
    automation.status = 'active';
    
    await saveAutomation(automation);

    await addNotification({
      title: 'Automation Scheduled',
      body: `"${automation.name}" will run ${this.parseSchedule(schedule).description}`,
      type: 'info',
      read: false,
    });
  }

  async cancelSchedule(automationId: string): Promise<void> {
    const automations = await getAllAutomations();
    const automation = automations.find(a => a.id === automationId);
    
    if (automation) {
      automation.schedule = undefined;
      automation.nextRun = undefined;
      automation.status = 'paused';
      await saveAutomation(automation);
    }
  }
}

export const scheduler = new TaskScheduler();
