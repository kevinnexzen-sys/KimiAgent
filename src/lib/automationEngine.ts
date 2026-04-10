import type { AgentDecision, WorkflowNode, APIIntegration } from '@/types';
import { freeAPIs } from './apiIntegrations';

class AutomationEngine {
  private apis: Map<string, APIIntegration> = new Map();

  constructor() {
    freeAPIs.forEach(api => this.apis.set(api.id, api));
  }

  async analyzeRequest(description: string): Promise<AgentDecision> {
    const lowerDesc = description.toLowerCase();
    
    // Analyze complexity and requirements
    const complexity = this.assessComplexity(lowerDesc);
    const requiredAPIs = this.identifyAPIs(lowerDesc);
    
    // Decide approach based on complexity and APIs available
    const approach = this.decideApproach(lowerDesc, complexity, requiredAPIs);
    
    const steps = this.generateSteps(lowerDesc, approach, requiredAPIs);

    return {
      approach,
      reasoning: this.generateReasoning(approach, complexity, requiredAPIs),
      recommendedAPIs: requiredAPIs,
      estimatedComplexity: complexity,
      steps,
    };
  }

  private assessComplexity(description: string): 'low' | 'medium' | 'high' {
    const complexKeywords = ['database', 'authentication', 'real-time', 'machine learning', 'ai model', 'complex logic'];
    const mediumKeywords = ['webhook', 'schedule', 'filter', 'transform', 'multiple steps', 'condition'];
    
    if (complexKeywords.some(k => description.includes(k))) return 'high';
    if (mediumKeywords.some(k => description.includes(k))) return 'medium';
    return 'low';
  }

  private identifyAPIs(description: string): string[] {
    const apis: string[] = [];
    
    // Check for social media
    if (description.includes('tweet') || description.includes('twitter') || description.includes('post to')) {
      apis.push('twitter-api');
    }
    if (description.includes('discord') || description.includes('message')) {
      apis.push('discord-webhook');
    }
    
    // Check for data/weather
    if (description.includes('weather') || description.includes('forecast')) {
      apis.push('openweather');
    }
    if (description.includes('news') || description.includes('headlines')) {
      apis.push('newsapi');
    }
    
    // Check for productivity
    if (description.includes('email') || description.includes('send mail')) {
      apis.push('sendgrid');
    }
    if (description.includes('translate') || description.includes('translation')) {
      apis.push('libretranslate');
    }
    
    // Check for utility
    if (description.includes('qr') || description.includes('barcode')) {
      apis.push('qrserver');
    }
    if (description.includes('url') || description.includes('shorten')) {
      apis.push('cleanuri');
    }
    
    // Default to some useful APIs if none identified
    if (apis.length === 0) {
      if (description.includes('data') || description.includes('fetch')) {
        apis.push('jsonplaceholder');
      }
    }
    
    return apis;
  }

  private decideApproach(description: string, complexity: string, _apis: string[]): 'code' | 'no-code' {
    // Prefer no-code for simple workflows with visual components
    if (complexity === 'low' && _apis.length <= 2) {
      return 'no-code';
    }
    
    // Use code for complex logic or when custom processing needed
    if (complexity === 'high' || description.includes('custom') || description.includes('code')) {
      return 'code';
    }
    
    // Default to no-code for medium complexity
    return 'no-code';
  }

  private generateReasoning(approach: string, complexity: string, apis: string[]): string {
    if (approach === 'no-code') {
      return `I've chosen a no-code approach because this is a ${complexity} complexity task that can be efficiently handled with visual workflow blocks. I'll use ${apis.length > 0 ? apis.join(', ') : 'built-in integrations'} to create your automation without requiring any programming.`;
    } else {
      return `I've chosen a code-based approach because this ${complexity} complexity task requires custom logic and flexibility. I'll generate clean, well-documented code using ${apis.length > 0 ? apis.join(', ') : 'appropriate libraries'} that you can easily modify later.`;
    }
  }

  private generateSteps(_description: string, approach: string, _apis: string[]): string[] {
    const steps: string[] = [];
    
    steps.push('Analyze requirements and identify integrations');
    
    if (approach === 'no-code') {
      steps.push('Design visual workflow with connected nodes');
      steps.push('Configure trigger and action blocks');
      steps.push('Set up API connections and authentication');
      steps.push('Test and validate the workflow');
    } else {
      steps.push('Generate code structure and dependencies');
      steps.push('Implement API integrations');
      steps.push('Add error handling and logging');
      steps.push('Create execution script');
    }
    
    steps.push('Deliver ready-to-use automation');
    
    return steps;
  }

  async execute(
    decision: AgentDecision, 
    description: string,
    onProgress: (progress: number, log: string) => void
  ): Promise<{ workflow?: WorkflowNode[]; code?: string }> {
    if (decision.approach === 'no-code') {
      return this.executeNoCode(decision, description, onProgress);
    } else {
      return this.executeCode(decision, description, onProgress);
    }
  }

  private async executeNoCode(
    decision: AgentDecision,
    description: string,
    onProgress: (progress: number, log: string) => void
  ): Promise<{ workflow: WorkflowNode[] }> {
    onProgress(10, 'Designing workflow nodes...');
    await this.delay(500);
    
    const workflow = this.generateWorkflow(description, decision);
    
    onProgress(40, 'Configuring API connections...');
    await this.delay(500);
    
    onProgress(60, 'Setting up triggers and actions...');
    await this.delay(500);
    
    onProgress(80, 'Validating workflow...');
    await this.delay(500);
    
    onProgress(100, 'Workflow ready!');
    
    return { workflow };
  }

  private async executeCode(
    decision: AgentDecision,
    description: string,
    onProgress: (progress: number, log: string) => void
  ): Promise<{ code: string }> {
    onProgress(10, 'Generating code structure...');
    await this.delay(500);
    
    onProgress(30, 'Implementing API integrations...');
    await this.delay(500);
    
    onProgress(50, 'Adding error handling...');
    await this.delay(500);
    
    onProgress(70, 'Creating execution logic...');
    await this.delay(500);
    
    onProgress(90, 'Adding documentation...');
    await this.delay(500);
    
    const code = this.generateCode(description, decision);
    
    onProgress(100, 'Code generated!');
    
    return { code };
  }

  private generateWorkflow(description: string, decision: AgentDecision): WorkflowNode[] {
    const nodes: WorkflowNode[] = [];
    const lowerDesc = description.toLowerCase();
    
    // Add trigger node
    let triggerType = 'manual';
    if (lowerDesc.includes('schedule') || lowerDesc.includes('every') || lowerDesc.includes('daily')) {
      triggerType = 'schedule';
    } else if (lowerDesc.includes('webhook') || lowerDesc.includes('when')) {
      triggerType = 'webhook';
    }
    
    nodes.push({
      id: 'trigger-1',
      type: 'trigger',
      label: triggerType === 'schedule' ? 'Scheduled Trigger' : triggerType === 'webhook' ? 'Webhook Trigger' : 'Manual Trigger',
      description: `Triggers automation ${triggerType === 'schedule' ? 'on schedule' : triggerType === 'webhook' ? 'via webhook' : 'manually'}`,
      config: { triggerType },
      position: { x: 50, y: 50 },
      connections: ['action-1'],
    });
    
    // Add action nodes based on APIs
    let currentY = 150;
    let actionId = 1;
    
    decision.recommendedAPIs.forEach((apiId, index) => {
      const api = this.apis.get(apiId);
      if (api) {
        nodes.push({
          id: `action-${actionId}`,
          type: 'action',
          label: api.name,
          description: api.description,
          config: { apiId, endpoints: api.endpoints.slice(0, 2) },
          position: { x: 50, y: currentY },
          connections: index < decision.recommendedAPIs.length - 1 ? [`action-${actionId + 1}`] : ['output-1'],
        });
        currentY += 100;
        actionId++;
      }
    });
    
    // Add transform node if needed
    if (lowerDesc.includes('transform') || lowerDesc.includes('filter') || lowerDesc.includes('format')) {
      nodes.push({
        id: `action-${actionId}`,
        type: 'transform',
        label: 'Data Transform',
        description: 'Transform and format data',
        config: { transformType: 'json' },
        position: { x: 50, y: currentY },
        connections: ['output-1'],
      });
      currentY += 100;
      actionId++;
    }
    
    // Update last action to connect to output
    const lastAction = nodes.find(n => n.id.startsWith('action-') && !nodes.some(other => other.connections.includes(n.id)));
    if (lastAction) {
      lastAction.connections = ['output-1'];
    }
    
    // Add output node
    nodes.push({
      id: 'output-1',
      type: 'output',
      label: 'Output',
      description: 'Automation result',
      config: { outputType: 'json' },
      position: { x: 50, y: currentY },
      connections: [],
    });
    
    return nodes;
  }

  private generateCode(description: string, decision: AgentDecision): string {
    const apiImports = decision.recommendedAPIs.map(apiId => {
      const api = this.apis.get(apiId);
      return api ? `// ${api.name}: ${api.baseUrl}` : '';
    }).join('\n');
    
    const apiSetup = decision.recommendedAPIs.map(apiId => {
      const api = this.apis.get(apiId);
      if (!api) return '';
      
      if (api.authType === 'apiKey') {
        return `const ${api.id.replace('-', '_').toUpperCase()}_API_KEY = process.env.${api.id.replace('-', '_').toUpperCase()}_API_KEY;`;
      }
      return '';
    }).join('\n');
    
    return `/**
 * Automation: ${description}
 * Generated by AI Automation Agent
 * Approach: Code-based
 * Complexity: ${decision.estimatedComplexity}
 */

${apiImports}

// Configuration
${apiSetup}

async function runAutomation() {
  console.log('Starting automation...');
  
  try {
    ${this.generateCodeBody(description, decision)}
    
    console.log('Automation completed successfully!');
  } catch (error) {
    console.error('Automation failed:', error);
    throw error;
  }
}

// Run the automation
runAutomation();
`;
  }

  private generateCodeBody(description: string, decision: AgentDecision): string {
    const lowerDesc = description.toLowerCase();
    let body = '';
    
    // Add fetch calls for each API
    decision.recommendedAPIs.forEach(apiId => {
      const api = this.apis.get(apiId);
      if (!api || api.endpoints.length === 0) return;
      
      const endpoint = api.endpoints[0];
      body += `
    // Call ${api.name}
    const ${api.id.replace('-', '_')}Response = await fetch('${api.baseUrl}${endpoint.path}', {
      method: '${endpoint.method}',
      headers: {
        'Content-Type': 'application/json',
        ${api.authType === 'apiKey' ? `'Authorization': \`Bearer \${${api.id.replace('-', '_').toUpperCase()}_API_KEY}\`,` : ''}
      },
    });
    
    const ${api.id.replace('-', '_')}Data = await ${api.id.replace('-', '_')}Response.json();
    console.log('${api.name} response:', ${api.id.replace('-', '_')}Data);
`;
    });
    
    // Add data processing
    if (lowerDesc.includes('save') || lowerDesc.includes('store')) {
      body += `
    // Save results
    const fs = require('fs');
    fs.writeFileSync('automation_result.json', JSON.stringify({
      timestamp: new Date().toISOString(),
      ${decision.recommendedAPIs.map(apiId => `${apiId.replace('-', '_')}: ${apiId.replace('-', '_')}Data`).join(',\n      ')}
    }, null, 2));
    console.log('Results saved to automation_result.json');
`;
    }
    
    return body || '    // TODO: Implement automation logic\n    console.log("Automation logic goes here");';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const automationEngine = new AutomationEngine();
