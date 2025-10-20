import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Workspace, WorkspaceType } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_date', { ascending: true });

      if (error) throw error;

      const formattedWorkspaces: Workspace[] = data.map(ws => ({
        id: ws.id,
        name: ws.name,
        type: ws.type as WorkspaceType,
        icon: ws.icon,
        color: ws.color,
        createdDate: new Date(ws.created_date)
      }));

      setWorkspaces(formattedWorkspaces);
      
      // Set first workspace as default if none selected
      if (!currentWorkspace && formattedWorkspaces.length > 0) {
        setCurrentWorkspace(formattedWorkspaces[0]);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      toast({
        title: "Error",
        description: "Failed to load workspaces",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchWorkspace = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
  };

  return {
    workspaces,
    currentWorkspace,
    isLoading,
    switchWorkspace,
    fetchWorkspaces
  };
}
