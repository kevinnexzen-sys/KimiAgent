import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';

interface AgentDB extends DBSchema {
  automations: {
    key: string;
    value: {
      id: string;
      name: string;
      description: string;
      type: 'code' | 'workflow' | 'scheduled';
      status: 'active' | 'paused' | 'completed' | 'failed';
      createdAt: Date;
      updatedAt: Date;
      lastRun?: Date;
      nextRun?: Date;
      schedule?: string;
      code?: string;
      workflow?: any[];
      config: Record<string, any>;
      logs: string[];
      runCount: number;
    };
    indexes: {
      'by-status': string;
      'by-schedule': string;
    };
  };
  tasks: {
    key: string;
    value: {
      id: string;
      automationId: string;
      status: 'pending' | 'running' | 'completed' | 'failed';
      createdAt: Date;
      startedAt?: Date;
      completedAt?: Date;
      result?: any;
      error?: string;
    };
    indexes: {
      'by-automation': string;
      'by-status': string;
    };
  };
  settings: {
    key: string;
    value: any;
  };
  whatsapp: {
    key: string;
    value: {
      id: string;
      phoneNumber: string;
      name?: string;
      status: 'connected' | 'disconnected' | 'connecting';
      lastConnected?: Date;
      qrCode?: string;
    };
  };
}

let db: IDBPDatabase<AgentDB> | null = null;

export async function initDB(): Promise<IDBPDatabase<AgentDB>> {
  if (db) return db;
  
  db = await openDB<AgentDB>('ai-agent-db', 1, {
    upgrade(database) {
      // Automations store
      if (!database.objectStoreNames.contains('automations')) {
        const automationStore = database.createObjectStore('automations', { keyPath: 'id' });
        automationStore.createIndex('by-status', 'status');
        automationStore.createIndex('by-schedule', 'schedule');
      }
      
      // Tasks store
      if (!database.objectStoreNames.contains('tasks')) {
        const taskStore = database.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('by-automation', 'automationId');
        taskStore.createIndex('by-status', 'status');
      }
      
      // Settings store
      if (!database.objectStoreNames.contains('settings')) {
        database.createObjectStore('settings', { keyPath: 'id' });
      }
      
      // WhatsApp store
      if (!database.objectStoreNames.contains('whatsapp')) {
        database.createObjectStore('whatsapp', { keyPath: 'id' });
      }
    },
  });
  
  return db;
}

// Automation CRUD
export async function saveAutomation(automation: AgentDB['automations']['value']) {
  const database = await initDB();
  await database.put('automations', automation);
}

export async function getAutomation(id: string) {
  const database = await initDB();
  return database.get('automations', id);
}

export async function getAllAutomations() {
  const database = await initDB();
  return database.getAll('automations');
}

export async function getActiveAutomations() {
  const database = await initDB();
  return database.getAllFromIndex('automations', 'by-status', 'active');
}

export async function deleteAutomation(id: string) {
  const database = await initDB();
  await database.delete('automations', id);
}

// Task CRUD
export async function saveTask(task: AgentDB['tasks']['value']) {
  const database = await initDB();
  await database.put('tasks', task);
}

export async function getTasksByAutomation(automationId: string) {
  const database = await initDB();
  return database.getAllFromIndex('tasks', 'by-automation', automationId);
}

export async function getPendingTasks() {
  const database = await initDB();
  return database.getAllFromIndex('tasks', 'by-status', 'pending');
}

// Settings
export async function getSetting(id: string) {
  const database = await initDB();
  return database.get('settings', id);
}

export async function setSetting(id: string, value: any) {
  const database = await initDB();
  await database.put('settings', { id, value });
}

// WhatsApp
export async function saveWhatsAppConnection(data: AgentDB['whatsapp']['value']) {
  const database = await initDB();
  await database.put('whatsapp', data);
}

export async function getWhatsAppConnections() {
  const database = await initDB();
  return database.getAll('whatsapp');
}

// Notifications - using in-memory for now
const notifications: any[] = [];

export async function addNotification(notification: Omit<any, 'id' | 'createdAt'>) {
  const notif = {
    ...notification,
    id: `notif-${Date.now()}`,
    createdAt: new Date(),
  };
  notifications.push(notif);
  return notif;
}

export async function getUnreadNotifications() {
  return notifications.filter(n => !n.read);
}

export async function markNotificationAsRead(id: string) {
  const notif = notifications.find(n => n.id === id);
  if (notif) {
    notif.read = true;
  }
}

export async function clearAllNotifications() {
  notifications.length = 0;
}

export { db };
