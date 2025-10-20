import { Workspace } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  onWorkspaceChange: (workspace: Workspace) => void;
}

export function WorkspaceSwitcher({ 
  workspaces, 
  currentWorkspace, 
  onWorkspaceChange 
}: WorkspaceSwitcherProps) {
  if (!currentWorkspace) return null;

  return (
    <Select
      value={currentWorkspace.id}
      onValueChange={(id) => {
        const workspace = workspaces.find(w => w.id === id);
        if (workspace) onWorkspaceChange(workspace);
      }}
    >
      <SelectTrigger className="w-[200px] bg-background border-border">
        <SelectValue>
          <div className="flex items-center gap-2">
            <span className="text-xl">{currentWorkspace.icon}</span>
            <span className="font-medium">{currentWorkspace.name}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {workspaces.map((workspace) => (
          <SelectItem key={workspace.id} value={workspace.id}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{workspace.icon}</span>
              <span>{workspace.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
