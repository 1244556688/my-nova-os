/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { 
  Monitor, 
  Folder, 
  Settings, 
  FileText, 
  X, 
  Minus, 
  Square, 
  Maximize2, 
  Search, 
  User, 
  LogOut, 
  Plus, 
  Trash2, 
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  Globe,
  Save
} from 'lucide-react';
import { User as UserType, OSFile, WindowState } from './types';

// --- Components ---

const LoginScreen = ({ onLogin }: { onLogin: (user: UserType) => void }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        onLogin(data.user || { id: data.userId, username });
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Connection failed');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: 'url(https://picsum.photos/id/10/1920/1080?blur=5)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mica-effect p-8 rounded-2xl w-96 window-shadow"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <User className="text-white w-10 h-10" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">NovaOS</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md"
          >
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setIsRegister(!isRegister)} className="text-blue-600 font-semibold hover:underline">
            {isRegister ? 'Sign In' : 'Register'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

const Window = ({ 
  window: win, 
  onClose, 
  onMinimize, 
  onFocus, 
  children 
}: { 
  window: WindowState; 
  onClose: () => void; 
  onMinimize: () => void; 
  onFocus: () => void;
  children: React.ReactNode;
  key?: React.Key;
}) => {
  const dragControls = useDragControls();
  const [size, setSize] = useState({ w: 800, h: 500 });

  if (!win.isOpen || win.isMinimized) return null;

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      className={`fixed rounded-xl overflow-hidden mica-effect window-shadow flex flex-col pointer-events-auto ${win.isMaximized ? 'inset-0 !rounded-none' : ''}`}
      style={{ 
        width: win.isMaximized ? '100%' : size.w, 
        height: win.isMaximized ? 'calc(100% - 48px)' : size.h,
        zIndex: win.zIndex,
        x: 100 + (win.zIndex * 20),
        y: 50 + (win.zIndex * 20)
      }}
      onMouseDown={onFocus}
    >
      <div 
        className="window-header h-10 flex items-center justify-between px-4 bg-white/20 dark:bg-black/10 cursor-default select-none"
        onPointerDown={(e) => {
          onFocus();
          dragControls.start(e);
        }}
      >
        <div className="flex items-center gap-2">
          {win.type === 'explorer' && <Folder className="w-4 h-4 text-yellow-500" />}
          {win.type === 'editor' && <FileText className="w-4 h-4 text-blue-500" />}
          {win.type === 'settings' && <Settings className="w-4 h-4 text-gray-500" />}
          {win.type === 'browser' && <Globe className="w-4 h-4 text-emerald-500" />}
          <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{win.title}</span>
        </div>
        <div className="flex items-center">
          <button onClick={onMinimize} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <Square className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} className="p-2 hover:bg-red-500 hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-white/40 dark:bg-black/20">
        {children}
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<UserType | null>(null);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [files, setFiles] = useState<OSFile[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchFiles = useCallback(async (userId: number) => {
    const res = await fetch(`/api/files/${userId}`);
    const data = await res.json();
    setFiles(data);
  }, []);

  useEffect(() => {
    if (user) {
      fetchFiles(user.id);
    }
  }, [user, fetchFiles]);

  const openWindow = (type: WindowState['type'], title: string, data?: any) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newWindow: WindowState = {
      id,
      title,
      type,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: windows.length + 10,
      data
    };
    setWindows([...windows, newWindow]);
    setActiveWindowId(id);
    setIsStartOpen(false);
  };

  const closeWindow = (id: string) => {
    setWindows(windows.filter(w => w.id !== id));
    if (activeWindowId === id) setActiveWindowId(null);
  };

  const minimizeWindow = (id: string) => {
    setWindows(windows.map(w => w.id === id ? { ...w, isMinimized: true } : w));
    setActiveWindowId(null);
  };

  const focusWindow = (id: string) => {
    const maxZ = Math.max(0, ...windows.map(w => w.zIndex));
    setWindows(windows.map(w => w.id === id ? { ...w, zIndex: maxZ + 1, isMinimized: false } : w));
    setActiveWindowId(id);
  };

  const handleCreateFile = async (name: string, type: 'file' | 'folder', content: string = '') => {
    if (!user) return;
    const res = await fetch('/api/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, name, type, content, parentId: null }),
    });
    const data = await res.json();
    fetchFiles(user.id);
    if (type === 'file') {
      openWindow('editor', name, { id: data.id, content });
    }
  };

  const handleSaveFile = async (id: number, content: string, name: string) => {
    await fetch(`/api/files/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, name }),
    });
    if (user) fetchFiles(user.id);
  };

  const handleDeleteFile = async (id: number) => {
    await fetch(`/api/files/${id}`, { method: 'DELETE' });
    if (user) fetchFiles(user.id);
  };

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  return (
    <div className="h-screen w-screen bg-cover bg-center overflow-hidden flex flex-col" style={{ backgroundImage: 'url(https://picsum.photos/id/28/1920/1080)' }}>
      {/* Desktop Icons */}
      <div className="flex-1 p-4 flex flex-col flex-wrap gap-4 content-start">
        <DesktopIcon 
          icon={<Monitor className="text-blue-400 w-8 h-8" />} 
          label="This PC" 
          onDoubleClick={() => openWindow('explorer', 'File Explorer')} 
        />
        <DesktopIcon 
          icon={<Folder className="text-yellow-400 w-8 h-8" />} 
          label="Documents" 
          onDoubleClick={() => openWindow('explorer', 'Documents')} 
        />
        <DesktopIcon 
          icon={<Globe className="text-emerald-400 w-8 h-8" />} 
          label="Browser" 
          onDoubleClick={() => openWindow('browser', 'Nova Browser')} 
        />
        {files.filter(f => f.type === 'file').map(file => (
          <DesktopIcon 
            key={file.id}
            icon={<FileText className="text-blue-300 w-8 h-8" />} 
            label={file.name} 
            onDoubleClick={() => openWindow('editor', file.name, file)} 
          />
        ))}
      </div>

      {/* Windows Layer */}
      <div className="fixed inset-0 pointer-events-none z-[50]">
        {windows.map(win => (
          <Window 
            key={win.id} 
            window={win} 
            onClose={() => closeWindow(win.id)} 
            onMinimize={() => minimizeWindow(win.id)}
            onFocus={() => focusWindow(win.id)}
          >
            {win.type === 'explorer' && (
              <FileExplorer 
                files={files} 
                onOpenFile={(f) => openWindow('editor', f.name, f)} 
                onCreateFile={handleCreateFile}
                onDeleteFile={handleDeleteFile}
              />
            )}
            {win.type === 'editor' && (
              <CodeEditor 
                file={win.data} 
                onSave={(content) => handleSaveFile(win.data.id, content, win.data.name)} 
              />
            )}
            {win.type === 'browser' && <Browser />}
            {win.type === 'settings' && <SettingsApp user={user} onLogout={() => setUser(null)} />}
          </Window>
        ))}
      </div>

      {/* Start Menu */}
      <AnimatePresence>
        {isStartOpen && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-14 left-1/2 -translate-x-1/2 w-[540px] h-[600px] mica-effect rounded-xl window-shadow p-8 z-[9999]"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-semibold">Pinned</h2>
              <button className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30">All apps &gt;</button>
            </div>
            <div className="grid grid-cols-6 gap-6">
              <StartAppIcon icon={<Globe className="text-blue-500" />} label="Edge" onClick={() => openWindow('browser', 'Nova Browser')} />
              <StartAppIcon icon={<Folder className="text-yellow-500" />} label="Files" onClick={() => openWindow('explorer', 'File Explorer')} />
              <StartAppIcon icon={<Settings className="text-gray-500" />} label="Settings" onClick={() => openWindow('settings', 'Settings')} />
              <StartAppIcon icon={<FileText className="text-blue-400" />} label="Notepad" onClick={() => handleCreateFile('Untitled.html', 'file')} />
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-16 bg-black/5 dark:bg-white/5 rounded-b-xl flex items-center justify-between px-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user.username[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium">{user.username}</span>
              </div>
              <button onClick={() => setUser(null)} className="p-2 hover:bg-black/5 rounded">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Taskbar */}
      <div className="h-12 mica-effect flex items-center justify-between px-3 z-[10000] border-t border-white/10">
        <div className="flex-1"></div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsStartOpen(!isStartOpen)}
            className={`p-2 rounded-md transition-all hover:bg-white/20 ${isStartOpen ? 'bg-white/20' : ''}`}
          >
            <LayoutGrid className="w-6 h-6 text-blue-500" />
          </button>
          <div className="w-px h-6 bg-white/10 mx-1"></div>
          {windows.map(win => (
            <button
              key={win.id}
              onClick={() => focusWindow(win.id)}
              className={`p-2 rounded-md transition-all hover:bg-white/20 group relative ${activeWindowId === win.id ? 'bg-white/20' : ''}`}
            >
              {win.type === 'explorer' && <Folder className="w-5 h-5 text-yellow-500" />}
              {win.type === 'editor' && <FileText className="w-5 h-5 text-blue-500" />}
              {win.type === 'settings' && <Settings className="w-5 h-5 text-gray-500" />}
              {win.type === 'browser' && <Globe className="w-5 h-5 text-emerald-500" />}
              {activeWindowId === win.id && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1 bg-blue-500 rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 flex justify-end items-center gap-4 pr-2">
          <div className="flex flex-col items-end text-[11px] font-medium text-gray-700 dark:text-gray-300">
            <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>{currentTime.toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

const DesktopIcon = ({ icon, label, onDoubleClick }: { icon: React.ReactNode, label: string, onDoubleClick: () => void, key?: React.Key }) => (
  <div 
    className="w-24 h-24 flex flex-col items-center justify-center gap-1 rounded hover:bg-white/10 transition-colors cursor-default group"
    onDoubleClick={onDoubleClick}
  >
    <div className="group-active:scale-90 transition-transform">
      {icon}
    </div>
    <span className="text-xs text-white text-center drop-shadow-md px-1 line-clamp-2">{label}</span>
  </div>
);

const StartAppIcon = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors group">
    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
      {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
    </div>
    <span className="text-xs">{label}</span>
  </button>
);

const FileExplorer = ({ files, onOpenFile, onCreateFile, onDeleteFile }: { 
  files: OSFile[], 
  onOpenFile: (f: OSFile) => void,
  onCreateFile: (name: string, type: 'file' | 'folder') => void,
  onDeleteFile: (id: number) => void
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="h-12 border-b border-white/10 flex items-center px-4 gap-4">
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-white/10 rounded"><ChevronLeft className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-white/10 rounded"><ChevronRight className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 bg-white/10 rounded px-3 py-1 text-xs border border-white/10">
          This PC &gt; Documents
        </div>
        <div className="w-48 bg-white/10 rounded px-3 py-1 text-xs border border-white/10 flex items-center gap-2">
          <Search className="w-3 h-3 opacity-50" />
          <input type="text" placeholder="Search" className="bg-transparent outline-none w-full" />
        </div>
      </div>
      <div className="h-10 border-b border-white/10 flex items-center px-4 gap-2">
        <button onClick={() => onCreateFile('New File.html', 'file')} className="flex items-center gap-2 px-3 py-1 text-xs hover:bg-white/10 rounded">
          <Plus className="w-3 h-3" /> New
        </button>
      </div>
      <div className="flex-1 p-4 grid grid-cols-4 md:grid-cols-6 gap-4 content-start overflow-auto">
        {files.map(file => (
          <div 
            key={file.id} 
            className="flex flex-col items-center gap-1 p-2 rounded hover:bg-white/10 group relative"
            onDoubleClick={() => onOpenFile(file)}
          >
            <FileText className="w-10 h-10 text-blue-400" />
            <span className="text-xs text-center line-clamp-1">{file.name}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteFile(file.id); }}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const CodeEditor = ({ file, onSave }: { file: OSFile, onSave: (content: string) => void }) => {
  const [content, setContent] = useState(file.content || '');
  
  return (
    <div className="flex flex-col h-full">
      <div className="h-10 border-b border-white/10 flex items-center px-4 justify-between">
        <span className="text-xs opacity-60">HTML Editor</span>
        <button 
          onClick={() => onSave(content)}
          className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
        >
          <Save className="w-3 h-3" /> Save
        </button>
      </div>
      <textarea
        className="flex-1 p-4 bg-transparent outline-none font-mono text-sm resize-none"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your HTML here..."
      />
      <div className="h-64 border-t border-white/10 bg-white/5 p-4 overflow-auto">
        <p className="text-[10px] uppercase tracking-wider opacity-40 mb-2">Preview</p>
        <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
};

const Browser = () => {
  const [url, setUrl] = useState('https://www.google.com');
  const [inputUrl, setInputUrl] = useState(url);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="h-10 border-b border-gray-200 flex items-center px-4 gap-4 bg-gray-50">
        <div className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-1 text-xs flex items-center gap-2">
          <Globe className="w-3 h-3 text-gray-400" />
          <input 
            type="text" 
            value={inputUrl} 
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setUrl(inputUrl)}
            className="bg-transparent outline-none w-full text-gray-700" 
          />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center bg-gray-100 text-gray-400 flex-col gap-4">
        <Globe className="w-16 h-16 opacity-20" />
        <p className="text-sm">Browser preview is limited in sandbox.</p>
        <div className="p-8 bg-white rounded-xl shadow-sm max-w-md text-center">
          <h3 className="text-gray-800 font-medium mb-2">Welcome to Nova Browser</h3>
          <p className="text-xs text-gray-500">This is a simulated browser environment. You can use it to view your saved HTML files or browse the web (if allowed by CSP).</p>
        </div>
      </div>
    </div>
  );
};

const SettingsApp = ({ user, onLogout }: { user: UserType, onLogout: () => void }) => {
  return (
    <div className="flex h-full">
      <div className="w-64 border-r border-white/10 p-4 flex flex-col gap-2">
        <button className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-lg text-sm"><User className="w-4 h-4" /> Account</button>
        <button className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 rounded-lg text-sm"><Monitor className="w-4 h-4" /> Personalization</button>
        <button className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 rounded-lg text-sm"><Globe className="w-4 h-4" /> Network</button>
      </div>
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-semibold mb-8">Account Settings</h2>
        <div className="flex items-center gap-6 mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-3xl font-bold text-white">
            {user.username[0].toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-medium">{user.username}</h3>
            <p className="text-sm opacity-60">Administrator</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="px-6 py-2 bg-red-500/20 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};
