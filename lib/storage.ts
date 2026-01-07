import { WebhookData } from './types';

// In-memory storage for single conversation
// Stores only the latest conversation
class ConversationStorage {
  private conversation: WebhookData | null = null;
  private listeners: Set<(data: WebhookData) => void> = new Set();

  // Set the latest conversation (replaces any existing one)
  setConversation(data: WebhookData): void {
    this.conversation = data;
    // Notify all listeners about the new conversation
    this.notifyListeners(data);
  }

  // Get the current conversation
  getConversation(): WebhookData | null {
    return this.conversation;
  }

  // Subscribe to conversation updates
  subscribe(callback: (data: WebhookData) => void): () => void {
    this.listeners.add(callback);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Notify all listeners
  private notifyListeners(data: WebhookData): void {
    this.listeners.forEach(callback => callback(data));
  }

  // Clear conversation (for testing)
  clear(): void {
    this.conversation = null;
  }
}

// Singleton instance
export const storage = new ConversationStorage();
