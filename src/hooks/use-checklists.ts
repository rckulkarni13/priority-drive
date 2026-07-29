import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Checklist, ChecklistItem } from '@/types';
import { useToast } from '@/hooks/use-toast';

function normalizeItems(raw: unknown): ChecklistItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item: any, index: number) => ({
      title: String(item?.title ?? ''),
      order: typeof item?.order === 'number' ? item.order : index,
    }))
    .filter((item) => item.title.trim().length > 0)
    .sort((a, b) => a.order - b.order);
}

export function useChecklists(workspaceId?: string) {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchChecklists = useCallback(async () => {
    if (!workspaceId) {
      setChecklists([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('checklists')
        .select('*, checklist_versions!checklists_current_version_fkey(id, version_number, items)')
        .eq('workspace_id', workspaceId)
        .order('title', { ascending: true });

      if (error) throw error;

      const formatted: Checklist[] = (data || []).map((row: any) => {
        const version = Array.isArray(row.checklist_versions)
          ? row.checklist_versions[0]
          : row.checklist_versions;
        return {
          id: row.id,
          title: row.title,
          description: row.description || '',
          workspaceId: row.workspace_id,
          versionNumber: version?.version_number ?? 1,
          items: normalizeItems(version?.items),
          createdDate: new Date(row.created_date),
        };
      });

      setChecklists(formatted);
    } catch (error) {
      console.error('Error fetching checklists:', error);
      toast({
        title: 'Error',
        description: 'Failed to load checklists',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, toast]);

  useEffect(() => {
    fetchChecklists();
  }, [fetchChecklists]);

  const createChecklist = useCallback(
    async (input: { title: string; description?: string; items: string[] }) => {
      if (!workspaceId) return;
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('User not authenticated');

        const { data: checklist, error } = await supabase
          .from('checklists')
          .insert({
            title: input.title,
            description: input.description || null,
            workspace_id: workspaceId,
            user_id: userData.user.id,
          })
          .select()
          .single();

        if (error) throw error;

        const { data: version, error: versionError } = await supabase
          .from('checklist_versions')
          .insert({
            checklist_id: checklist.id,
            version_number: 1,
            items: input.items
              .map((title, index) => ({ title: title.trim(), order: index }))
              .filter((item) => item.title.length > 0),
          })
          .select()
          .single();

        if (versionError) throw versionError;

        const { error: linkError } = await supabase
          .from('checklists')
          .update({ current_version_id: version.id })
          .eq('id', checklist.id);

        if (linkError) throw linkError;

        await fetchChecklists();
        toast({ title: 'Success', description: 'Checklist created' });
      } catch (error) {
        console.error('Error creating checklist:', error);
        toast({
          title: 'Error',
          description: 'Failed to create checklist',
          variant: 'destructive',
        });
      }
    },
    [workspaceId, fetchChecklists, toast]
  );

  // Editing a checklist never mutates an existing version — it writes a brand new
  // version and repoints the checklist at it, so tasks that already applied an
  // earlier version keep their subtasks unchanged.
  const updateChecklist = useCallback(
    async (
      checklistId: string,
      input: { title: string; description?: string; items: string[] }
    ) => {
      try {
        const { data: latest, error: latestError } = await supabase
          .from('checklist_versions')
          .select('version_number')
          .eq('checklist_id', checklistId)
          .order('version_number', { ascending: false })
          .limit(1);

        if (latestError) throw latestError;

        const nextVersion = (latest?.[0]?.version_number ?? 0) + 1;

        const { data: version, error: versionError } = await supabase
          .from('checklist_versions')
          .insert({
            checklist_id: checklistId,
            version_number: nextVersion,
            items: input.items
              .map((title, index) => ({ title: title.trim(), order: index }))
              .filter((item) => item.title.length > 0),
          })
          .select()
          .single();

        if (versionError) throw versionError;

        const { error } = await supabase
          .from('checklists')
          .update({
            title: input.title,
            description: input.description || null,
            current_version_id: version.id,
          })
          .eq('id', checklistId);

        if (error) throw error;

        await fetchChecklists();
        toast({
          title: 'Success',
          description: `Checklist saved as v${nextVersion}. Existing subtasks are unchanged.`,
        });
      } catch (error) {
        console.error('Error updating checklist:', error);
        toast({
          title: 'Error',
          description: 'Failed to update checklist',
          variant: 'destructive',
        });
      }
    },
    [fetchChecklists, toast]
  );

  const deleteChecklist = useCallback(
    async (checklistId: string) => {
      try {
        const { error: unlinkError } = await supabase
          .from('checklists')
          .update({ current_version_id: null })
          .eq('id', checklistId);

        if (unlinkError) throw unlinkError;

        const { error } = await supabase.from('checklists').delete().eq('id', checklistId);
        if (error) throw error;

        await fetchChecklists();
        toast({ title: 'Success', description: 'Checklist deleted' });
      } catch (error) {
        console.error('Error deleting checklist:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete checklist',
          variant: 'destructive',
        });
      }
    },
    [fetchChecklists, toast]
  );

  return {
    checklists,
    isLoading,
    fetchChecklists,
    createChecklist,
    updateChecklist,
    deleteChecklist,
  };
}