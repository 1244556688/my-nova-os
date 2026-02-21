export interface User {
  id: number;
  username: string;
}

export interface OSFile {
  id: number;
  userId: number;
  name: string;
  content: string;
  type: 'file' | 'folder';
  parentId: number | null;
}

export interface WindowState {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  type: 'explorer' | 'editor' | 'settings' | 'browser';
  data?: any;
}
