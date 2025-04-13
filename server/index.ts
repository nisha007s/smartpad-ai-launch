import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: /^http:\/\/localhost:\d+$/,  // Allow any localhost port
    methods: ["GET", "POST"]
  }
});

interface ActiveUser {
  id: string;
  name: string;
  color: string;
  socketId: string;
}

interface Comment {
  id: string;
  noteId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

// Store active users and comments in memory
const activeUsers = new Map<string, ActiveUser>();
const comments = new Map<string, Comment[]>();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle user joining
  socket.on('user:join', (user: Omit<ActiveUser, 'socketId'>) => {
    const activeUser = { ...user, socketId: socket.id };
    activeUsers.set(socket.id, activeUser);
    
    // Broadcast updated user list
    io.emit('users:update', Array.from(activeUsers.values()));
  });

  // Handle note updates
  socket.on('note:update', (data: { noteId: string; content: string; updatedAt: Date }) => {
    // Broadcast to all clients except sender
    socket.broadcast.emit('note:update', data);
  });

  // Handle comments
  socket.on('comment:add', (comment: Comment) => {
    const noteComments = comments.get(comment.noteId) || [];
    noteComments.push(comment);
    comments.set(comment.noteId, noteComments);
    
    // Broadcast updated comments
    io.emit('comments:update', noteComments);
  });

  socket.on('comment:delete', (commentId: string) => {
    // Find and delete comment
    comments.forEach((noteComments, noteId) => {
      const updatedComments = noteComments.filter(c => c.id !== commentId);
      if (updatedComments.length !== noteComments.length) {
        comments.set(noteId, updatedComments);
        io.emit('comments:update', updatedComments);
      }
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    activeUsers.delete(socket.id);
    io.emit('users:update', Array.from(activeUsers.values()));
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 