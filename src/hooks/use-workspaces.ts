import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Workspace, WorkspaceType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { registerWorkspaceTypes } from '@/hooks/use-workspace-terms';

const LAST_WORKSPACE_KEY = 'lastVisitedWorkspaceId';

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
      registerWorkspaceTypes(formattedWorkspaces.map(w => ({ id: w.id, type: w.type })));
      
      // Land on the last-visited workspace, falling back to the first one
      if (!currentWorkspace && formattedWorkspaces.length > 0) {
        const lastId = localStorage.getItem(LAST_WORKSPACE_KEY);
        const last = lastId ? formattedWorkspaces.find(w => w.id === lastId) : undefined;
        setCurrentWorkspace(last ?? formattedWorkspaces[0]);
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
    try {
      localStorage.setItem(LAST_WORKSPACE_KEY, workspace.id);
    } catch {
      // ignore storage failures (private mode, etc.)
    }
  };

  return {
    workspaces,
    currentWorkspace,
    isLoading,
    switchWorkspace,
    fetchWorkspaces
  };
}
