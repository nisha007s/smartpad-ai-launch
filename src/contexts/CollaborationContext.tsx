import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { toast } from '@/components/ui/use-toast';

interface CollaborationContextType {
  activeUsers: ActiveUser[];
  comments: Comment[];
  addComment: (comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  deleteComment: (commentId: string) => void;
  isConnected: boolean;
  currentUser: ActiveUser | null;
  socket: ReturnType<typeof io> | null;
}

export interface ActiveUser {
  id: string;
  name: string;
  color: string;
  cursor?: { line: number; ch: number };
}

export interface Comment {
  id: string;
  noteId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
  selection?: {
    start: number;
    end: number;
  };
}

const CollaborationContext = createContext<CollaborationContextType | null>(null);

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB'
];

export const CollaborationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<ActiveUser | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket'],
      autoConnect: true
    });

    // Generate a random user
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const randomName = `User${Math.floor(Math.random() * 1000)}`;
    const user: ActiveUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: randomName,
      color: randomColor
    };

    setCurrentUser(user);

    // Socket event handlers
    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('user:join', user);
      toast({
        title: 'Connected to collaboration server',
        description: `You joined as ${user.name}`,
      });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      toast({
        title: 'Disconnected from server',
        description: 'Trying to reconnect...',
        variant: 'destructive',
      });
    });

    newSocket.on('users:update', (users: ActiveUser[]) => {
      setActiveUsers(users);
    });

    newSocket.on('comments:update', (updatedComments: Comment[]) => {
      setComments(updatedComments);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const addComment = (comment: Omit<Comment, 'id' | 'createdAt'>) => {
    if (!socket || !currentUser) return;

    const newComment: Comment = {
      ...comment,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };

    socket.emit('comment:add', newComment);
  };

  const deleteComment = (commentId: string) => {
    if (!socket) return;
    socket.emit('comment:delete', commentId);
  };

  return (
    <CollaborationContext.Provider
      value={{
        activeUsers,
        comments,
        addComment,
        deleteComment,
        isConnected,
        currentUser,
        socket
      }}
    >
      {children}
    </CollaborationContext.Provider>
  );
};

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
}; 