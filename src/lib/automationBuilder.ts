import { saveAutomation, addNotification } from './db';

// Advanced Automation Builder with real working actions
export interface AutomationAction {
  id: string;
  type: string;
  label: string;
  description: string;
  config: Record<string, any>;
  icon?: string;
}

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  actions: AutomationAction[];
  icon: string;
}

// Available actions that actually work
export const availableActions: AutomationAction[] = [
  // Data & API Actions
  {
    id: 'fetch-url',
    type: 'fetch',
    label: 'Fetch URL',
    description: 'Make HTTP request to any URL',
    config: { url: '', method: 'GET', headers: {}, body: '' },
    icon: 'Globe',
  },
  {
    id: 'parse-json',
    type: 'transform',
    label: 'Parse JSON',
    description: 'Parse or stringify JSON data',
    config: { transform: 'json', source: '' },
    icon: 'FileJson',
  },
  {
    id: 'extract-data',
    type: 'transform',
    label: 'Extract Data',
    description: 'Extract specific field from data',
    config: { transform: 'extract', path: '' },
    icon: 'Search',
  },
  
  // Communication Actions
  {
    id: 'send-whatsapp',
    type: 'whatsapp',
    label: 'Send WhatsApp',
    description: 'Send WhatsApp message (opens WhatsApp Web)',
    config: { phone: '', message: '' },
    icon: 'MessageCircle',
  },
  {
    id: 'send-email',
    type: 'email',
    label: 'Send Email',
    description: 'Open email client with pre-filled message',
    config: { to: '', subject: '', body: '' },
    icon: 'Mail',
  },
  {
    id: 'show-notification',
    type: 'notify',
    label: 'Show Notification',
    description: 'Show browser notification',
    config: { title: '', body: '' },
    icon: 'Bell',
  },
  
  // File Actions
  {
    id: 'download-file',
    type: 'download',
    label: 'Download File',
    description: 'Download content as file',
    config: { filename: '', content: '', type: 'text/plain' },
    icon: 'Download',
  },
  {
    id: 'copy-clipboard',
    type: 'clipboard',
    label: 'Copy to Clipboard',
    description: 'Copy text to clipboard',
    config: { text: '' },
    icon: 'Copy',
  },
  
  // Logic Actions
  {
    id: 'condition',
    type: 'condition',
    label: 'Condition',
    description: 'If/else conditional logic',
    config: { condition: '', then: [], else: [] },
    icon: 'GitBranch',
  },
  {
    id: 'delay',
    type: 'delay',
    label: 'Delay',
    description: 'Wait for specified time',
    config: { ms: 1000 },
    icon: 'Clock',
  },
  
  // Data Transformations
  {
    id: 'uppercase',
    type: 'transform',
    label: 'To Uppercase',
    description: 'Convert text to uppercase',
    config: { transform: 'uppercase' },
    icon: 'Type',
  },
  {
    id: 'lowercase',
    type: 'transform',
    label: 'To Lowercase',
    description: 'Convert text to lowercase',
    config: { transform: 'lowercase' },
    icon: 'Type',
  },
  {
    id: 'filter-array',
    type: 'transform',
    label: 'Filter Array',
    description: 'Filter array items by condition',
    config: { transform: 'filter', condition: '' },
    icon: 'Filter',
  },
];

// Pre-built automation templates
export const automationTemplates: AutomationTemplate[] = [
  {
    id: 'daily-weather',
    name: 'Daily Weather Update',
    description: 'Get weather data and send notification',
    category: 'weather',
    icon: 'Cloud',
    actions: [
      {
        id: 'fetch-weather',
        type: 'fetch',
        label: 'Fetch Weather',
        description: 'Get weather from OpenWeatherMap',
        config: { 
          url: 'https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_API_KEY&units=metric',
          method: 'GET'
        },
      },
      {
        id: 'parse-weather',
        type: 'transform',
        label: 'Parse Response',
        description: 'Parse weather data',
        config: { transform: 'json' },
      },
      {
        id: 'notify-weather',
        type: 'notify',
        label: 'Show Weather',
        description: 'Display weather notification',
        config: { title: 'Weather Update', body: 'Temperature: {{temp}}°C' },
      },
    ],
  },
  {
    id: 'news-digest',
    name: 'News Digest',
    description: 'Fetch news and save to file',
    category: 'news',
    icon: 'Newspaper',
    actions: [
      {
        id: 'fetch-news',
        type: 'fetch',
        label: 'Fetch News',
        description: 'Get latest news headlines',
        config: { 
          url: 'https://newsapi.org/v2/top-headlines?country=us&apiKey=YOUR_API_KEY',
          method: 'GET'
        },
      },
      {
        id: 'parse-news',
        type: 'transform',
        label: 'Parse News',
        description: 'Parse news response',
        config: { transform: 'json' },
      },
      {
        id: 'download-news',
        type: 'download',
        label: 'Save News',
        description: 'Save news to file',
        config: { filename: 'news-digest.json', content: '{{data}}', type: 'application/json' },
      },
    ],
  },
  {
    id: 'whatsapp-reminder',
    name: 'WhatsApp Reminder',
    description: 'Send WhatsApp message reminder',
    category: 'communication',
    icon: 'MessageCircle',
    actions: [
      {
        id: 'send-wa',
        type: 'whatsapp',
        label: 'Send WhatsApp',
        description: 'Send reminder message',
        config: { phone: '', message: 'Hello! This is your automated reminder.' },
      },
    ],
  },
  {
    id: 'data-backup',
    name: 'Data Backup',
    description: 'Backup data to file',
    category: 'utility',
    icon: 'Database',
    actions: [
      {
        id: 'fetch-data',
        type: 'fetch',
        label: 'Fetch Data',
        description: 'Get data from source',
        config: { url: '', method: 'GET' },
      },
      {
        id: 'download-backup',
        type: 'download',
        label: 'Save Backup',
        description: 'Save as backup file',
        config: { filename: 'backup-{{date}}.json', content: '{{data}}', type: 'application/json' },
      },
    ],
  },
  {
    id: 'web-monitor',
    name: 'Website Monitor',
    description: 'Monitor website and notify on changes',
    category: 'monitoring',
    icon: 'Eye',
    actions: [
      {
        id: 'fetch-site',
        type: 'fetch',
        label: 'Fetch Website',
        description: 'Get website content',
        config: { url: '', method: 'GET' },
      },
      {
        id: 'check-change',
        type: 'condition',
        label: 'Check Changes',
        description: 'Check if content changed',
        config: { condition: 'context.previous !== context.current' },
      },
      {
        id: 'notify-change',
        type: 'notify',
        label: 'Notify Change',
        description: 'Send change notification',
        config: { title: 'Website Changed', body: 'The website has been updated!' },
      },
    ],
  },
];

// Natural language to automation parser
export function parseNaturalLanguage(input: string): { name: string; actions: AutomationAction[]; schedule?: string } {
  const lower = input.toLowerCase();
  const actions: AutomationAction[] = [];
  let schedule: string | undefined;
  let name = 'Custom Automation';

  // Detect schedule patterns
  if (lower.includes('every day') || lower.includes('daily')) {
    schedule = '1 day';
    name = 'Daily Task';
  } else if (lower.includes('every hour') || lower.includes('hourly')) {
    schedule = '1 hour';
    name = 'Hourly Task';
  } else if (lower.includes('every week') || lower.includes('weekly')) {
    schedule = '1 week';
    name = 'Weekly Task';
  } else if (lower.match(/every\s+\d+\s+(minute|hour|day)/)) {
    const match = lower.match(/every\s+(\d+)\s+(minute|hour|day)s?/);
    if (match) {
      schedule = `${match[1]} ${match[2]}`;
      name = `Task every ${match[1]} ${match[2]}(s)`;
    }
  }

  // Detect action patterns
  if (lower.includes('weather')) {
    actions.push({
      id: 'fetch-weather',
      type: 'fetch',
      label: 'Fetch Weather',
      description: 'Get weather data',
      config: { url: 'https://wttr.in/?format=j1', method: 'GET' },
    });
    actions.push({
      id: 'notify-weather',
      type: 'notify',
      label: 'Show Weather',
      description: 'Display weather',
      config: { title: 'Weather Update', body: 'Check your weather data' },
    });
  }

  if (lower.includes('news')) {
    actions.push({
      id: 'fetch-news',
      type: 'fetch',
      label: 'Fetch News',
      description: 'Get news headlines',
      config: { url: 'https://www.reddit.com/r/news/top.json?limit=5&t=day', method: 'GET', headers: { 'User-Agent': 'AI-Agent' } },
    });
  }

  if (lower.includes('whatsapp') || lower.includes('message')) {
    const phoneMatch = input.match(/(\+?\d[\d\s-]{7,}\d)/);
    actions.push({
      id: 'send-whatsapp',
      type: 'whatsapp',
      label: 'Send WhatsApp',
      description: 'Send WhatsApp message',
      config: { 
        phone: phoneMatch ? phoneMatch[1].replace(/\s/g, '') : '',
        message: 'Hello from your AI Agent!' 
      },
    });
  }

  if (lower.includes('email') || lower.includes('mail')) {
    actions.push({
      id: 'send-email',
      type: 'email',
      label: 'Send Email',
      description: 'Send email',
      config: { to: '', subject: 'From AI Agent', body: 'Hello!' },
    });
  }

  if (lower.includes('download') || lower.includes('save')) {
    actions.push({
      id: 'download-file',
      type: 'download',
      label: 'Download File',
      description: 'Save to file',
      config: { filename: 'automation-output.txt', content: '{{data}}', type: 'text/plain' },
    });
  }

  if (lower.includes('notification') || lower.includes('notify') || lower.includes('alert')) {
    actions.push({
      id: 'show-notification',
      type: 'notify',
      label: 'Show Notification',
      description: 'Display notification',
      config: { title: 'AI Agent', body: 'Your automation ran successfully!' },
    });
  }

  // Default action if none detected
  if (actions.length === 0) {
    actions.push({
      id: 'show-notification',
      type: 'notify',
      label: 'Show Notification',
      description: 'Display notification',
      config: { title: 'AI Agent', body: input },
    });
  }

  return { name, actions, schedule };
}

// Create automation from parsed data
export async function createAutomationFromParsed(
  name: string, 
  actions: AutomationAction[], 
  schedule?: string
) {
  const id = `auto-${Date.now()}`;
  
  const automation = {
    id,
    name,
    description: `Created from natural language: "${name}"`,
    type: 'workflow' as const,
    status: 'active' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    config: { actions },
    logs: [],
    runCount: 0,
    schedule,
    nextRun: schedule ? calculateNextRun(schedule) : undefined,
  };

  await saveAutomation(automation);
  
  await addNotification({
    title: 'Automation Created',
    body: `"${name}" has been created with ${actions.length} action(s)`,
    type: 'success',
    read: false,
  });

  return automation;
}

function calculateNextRun(schedule: string): Date {
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

export { calculateNextRun };
