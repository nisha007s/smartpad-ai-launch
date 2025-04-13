import React, { useState } from 'react';
import { useCollaboration } from '@/contexts/CollaborationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Users, X } from 'lucide-react';

export const CollaborationPanel: React.FC<{ noteId: string }> = ({ noteId }) => {
  const { activeUsers, comments, addComment, deleteComment, currentUser } = useCollaboration();
  const [newComment, setNewComment] = useState('');
  const [selectedTab, setSelectedTab] = useState<'users' | 'comments'>('users');

  const handleAddComment = () => {
    if (!newComment.trim() || !currentUser) return;

    addComment({
      noteId,
      userId: currentUser.id,
      userName: currentUser.name,
      content: newComment,
    });

    setNewComment('');
  };

  const noteComments = comments.filter(comment => comment.noteId === noteId);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex gap-4">
          <Button
            variant={selectedTab === 'users' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTab('users')}
          >
            <Users className="h-4 w-4 mr-2" />
            Users ({activeUsers.length})
          </Button>
          <Button
            variant={selectedTab === 'comments' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTab('comments')}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Comments ({noteComments.length})
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {selectedTab === 'users' ? (
          <div className="space-y-2">
            {activeUsers.map(user => (
              <div
                key={user.id}
                className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: user.color }}
                />
                <span className="text-sm font-medium">
                  {user.name} {user.id === currentUser?.id ? '(You)' : ''}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {noteComments.map(comment => (
              <div
                key={comment.id}
                className="relative group rounded-lg border p-4 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{comment.userName}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm">{comment.content}</p>
                {comment.userId === currentUser?.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteComment(comment.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {selectedTab === 'comments' && (
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="min-h-[80px]"
            />
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="self-end"
            >
              Post
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}; 