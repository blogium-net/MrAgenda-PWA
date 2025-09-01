
export interface Note {
  id: string;
  title: string;
  content: string; // Content will now store rich text as HTML
  createdAt: string;
  updatedAt: string;
  isImportant: boolean;
  isSecret: boolean;
  reminder?: string;
}

export interface ChatMessage {
  text: string;
  isUser: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}


export enum Theme {
  Light = 'light',
  Dark = 'dark',
  System = 'system',
}

export enum NoteCategory {
  All = 'tümü',
  Upcoming = 'yaklaşan',
  Important = 'önemli',
  Secret = 'gizli',
}

export type View = 'welcome' | 'dashboard' | 'editor' | 'chat' | 'clock' | 'settings';