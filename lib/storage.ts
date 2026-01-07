import { WebhookData } from './types';
import fs from 'fs';
import path from 'path';

// File-based storage for single conversation
// Persists data to /tmp directory (available in Vercel serverless)
class ConversationStorage {
  private filePath: string;

  constructor() {
    // Use /tmp directory which is writable in Vercel serverless
    this.filePath = path.join('/tmp', 'conversation.json');
  }

  // Set the latest conversation (replaces any existing one)
  setConversation(data: WebhookData): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data), 'utf8');
    } catch (error) {
      console.error('Error writing conversation to file:', error);
    }
  }

  // Get the current conversation
  getConversation(): WebhookData | null {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf8');
        return JSON.parse(data) as WebhookData;
      }
    } catch (error) {
      console.error('Error reading conversation from file:', error);
    }
    return null;
  }

  // Clear conversation (for testing)
  clear(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        fs.unlinkSync(this.filePath);
      }
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  }
}

// Singleton instance
export const storage = new ConversationStorage();
