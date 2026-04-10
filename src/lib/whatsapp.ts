// WhatsApp Web Integration

export interface WhatsAppConnection {
  id: string;
  phoneNumber: string;
  name?: string;
  status: 'connected' | 'disconnected' | 'connecting';
  qrCode?: string;
  lastConnected?: Date;
}

const connections: WhatsAppConnection[] = [];

class WhatsAppManager {
  async connect(phoneNumber: string, name?: string): Promise<WhatsAppConnection> {
    const id = `whatsapp-${Date.now()}`;
    
    const connection: WhatsAppConnection = {
      id,
      phoneNumber: this.formatPhone(phoneNumber),
      name,
      status: 'connecting',
    };

    connections.push(connection);
    
    // Generate QR code URL for WhatsApp Web
    const qrUrl = this.generateQRCode(connection.phoneNumber);
    connection.qrCode = qrUrl;
    
    return connection;
  }

  async sendMessage(phone: string, message: string): Promise<boolean> {
    const formattedPhone = this.formatPhone(phone);
    
    // Open WhatsApp Web with pre-filled message
    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    
    // Try to open in new tab
    const newWindow = window.open(waUrl, '_blank');
    
    return !!newWindow;
  }

  async sendBulkMessages(contacts: string[], message: string): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;
    
    for (const contact of contacts) {
      try {
        const success = await this.sendMessage(contact, message);
        if (success) {
          sent++;
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }
    
    return { sent, failed };
  }

  async disconnect(connectionId: string): Promise<void> {
    const index = connections.findIndex(c => c.id === connectionId);
    if (index > -1) {
      connections.splice(index, 1);
    }
  }

  getConnection(id: string): WhatsAppConnection | undefined {
    return connections.find(c => c.id === id);
  }

  getWhatsAppConnections(): WhatsAppConnection[] {
    return connections;
  }

  private formatPhone(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  private generateQRCode(phoneNumber: string): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://wa.me/${phoneNumber}`;
  }

  createTemplate(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
  }

  getTemplates() {
    return {
      greeting: 'Hello {{name}}! 👋',
      reminder: 'Hi {{name}}, this is a reminder about {{event}} on {{date}}.',
      followUp: 'Hi {{name}}, following up on our conversation about {{topic}}.',
      notification: '🔔 Notification: {{message}}',
      custom: '{{message}}',
    };
  }
}

export const whatsAppManager = new WhatsAppManager();
