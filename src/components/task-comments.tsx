import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Comment } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface TaskCommentsProps {
  taskId: string;
  onCommentAdded?: () => void;
}

export function TaskComments({ taskId, onCommentAdded }: TaskCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_date', { ascending: true });

      if (error) throw error;

      const formattedComments: Comment[] = data.map(comment => ({
        id: comment.id,
        taskId: comment.task_id,
        userId: comment.user_id,
        content: comment.content,
        createdDate: new Date(comment.created_date),
        updatedDate: new Date(comment.updated_date)
      }));

      setComments(formattedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('comments')
        .insert({
          task_id: taskId,
          user_id: user.user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      await fetchComments();
      onCommentAdded?.();
      
      toast({
        title: "Success",
        description: "Comment added successfully"
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4" />
        <h4 className="font-medium">Comments ({comments.length})</h4>
      </div>

      {/* Comments List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading comments...</div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <Card key={comment.id} className="p-3">
              <div className="flex gap-3">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {comment.userId.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(comment.createdDate, { addSuffix: true })}
                  </div>
                  <div className="text-sm">{comment.content}</div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>

      {/* Add Comment Form */}
      <div className="space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px]"
        />
        <Button 
          onClick={handleSubmitComment}
          disabled={!newComment.trim() || isSubmitting}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Adding...' : 'Add Comment'}
        </Button>
      </div>
    </div>
  );
}