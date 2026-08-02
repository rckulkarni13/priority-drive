import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Workspace, WorkspaceType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { registerWorkspaceTypes } from '@/hooks/use-workspace-terms';
import { parseTierLabels, TierLabelOverrides } from '@/lib/workspace-terminology';

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
        createdDate: new Date(ws.created_date),
        tierLabels: parseTierLabels((ws as { tier_labels?: unknown }).tier_labels)
      }));

      setWorkspaces(formattedWorkspaces);
      registerWorkspaceTypes(
        formattedWorkspaces.map(w => ({ id: w.id, type: w.type, tierLabels: w.tierLabels }))
      );
      
      // Land on the last-visited workspace, falling back to the first one
      if (formattedWorkspaces.length > 0) {
        setCurrentWorkspace(prev =>
          prev ? formattedWorkspaces.find(w => w.id === prev.id) ?? prev : prev
        );
      }

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

  const updateWorkspaceLabels = async (
    workspaceId: string,
    tierLabels: TierLabelOverrides | null
  ) => {
    const { error } = await supabase
      .from('workspaces')
      .update({ tier_labels: tierLabels } as never)
      .eq('id', workspaceId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save labels",
        variant: "destructive"
      });
      return false;
    }

    // Prime the shared terminology cache so every open dialog re-renders immediately
    const type = workspaces.find(w => w.id === workspaceId)?.type;
    if (type) {
      registerWorkspaceTypes([{ id: workspaceId, type, tierLabels: tierLabels ?? undefined }]);
    }
    await fetchWorkspaces();
    toast({ title: "Labels updated", description: "Your custom labels have been saved." });
    return true;
  };

  return {
    workspaces,
    currentWorkspace,
    isLoading,
    switchWorkspace,
    fetchWorkspaces,
    updateWorkspaceLabels
  };
}
