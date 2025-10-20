import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Target, Lightbulb, CheckSquare, FolderTree, Info, ChevronRight } from "lucide-react";
import { TaskFormDialog } from "./task-form-dialog";
import { SubtaskFormDialog } from "./subtask-form-dialog";
import { ThemeFormDialog } from "./theme-form-dialog";
import { PillarFormDialog } from "./pillar-form-dialog";
import { DomainFormDialog } from "./domain-form-dialog";
import { Theme, Task, StrategicPillar, Domain, WorkspaceType } from "@/types";
import { getWorkspaceTerminology } from "@/lib/workspace-terminology";

interface QuickCreateMenuProps {
  themes: Theme[];
  tasks: Task[];
  strategicPillars: StrategicPillar[];
  domains: Domain[];
  onTaskCreate: (taskData: Omit<Task, 'id' | 'createdDate' | 'order' | 'status' | 'type'>) => void;
  onThemeCreate: (themeData: Omit<Theme, 'id' | 'createdDate'>) => void;
  onPillarCreate: (pillarData: Omit<StrategicPillar, 'id' | 'createdDate'>) => void;
  onDomainCreate: (domainData: Omit<Domain, 'id' | 'createdDate'>) => void;
  defaultParentTaskId?: string;
  defaultPillarId?: string;
  variant?: "default" | "compact";
  workspaceId: string;
  workspaceType: WorkspaceType;
}

export function QuickCreateMenu({
  themes,
  tasks,
  strategicPillars,
  domains,
  onTaskCreate,
  onThemeCreate,
  onPillarCreate,
  onDomainCreate,
  defaultParentTaskId,
  defaultPillarId,
  variant = "default",
  workspaceId,
  workspaceType
}: QuickCreateMenuProps) {
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const terminology = getWorkspaceTerminology(workspaceType);

  useEffect(() => {
    if (openDialog && triggerRef.current) {
      triggerRef.current.click();
    }
  }, [openDialog]);

  // Organize options by hierarchy level
  const hierarchyOptions = [
    {
      id: 'domain',
      label: terminology.domain.singular,
      icon: FolderTree,
      description: workspaceType === 'work' ? 'Top-level area of focus' : workspaceType === 'school' ? 'Academic subject or course' : 'Life area or category',
      level: 1
    },
    {
      id: 'pillar',
      label: terminology.pillar.singular,
      icon: Target,
      description: workspaceType === 'work' ? 'Key initiative within a domain' : workspaceType === 'school' ? 'Learning objective or goal' : 'Personal goal or objective',
      level: 2
    },
    {
      id: 'theme',
      label: terminology.theme.singular,
      icon: Lightbulb,
      description: workspaceType === 'work' ? 'Project or group of related tasks' : workspaceType === 'school' ? 'Study topic or unit' : 'Home project or activity',
      level: 3
    }
  ];

  const taskOptions = [
    {
      id: 'task',
      label: 'Task',
      icon: CheckSquare,
      description: 'Individual work item'
    },
    ...(defaultParentTaskId ? [{
      id: 'subtask',
      label: 'Subtask',
      icon: CheckSquare,
      description: 'Break down a larger task'
    }] : [])
  ];

  const handleCreateClick = (type: string) => {
    setOpenDialog(type);
  };

  const renderDialog = () => {
    switch (openDialog) {
      case 'task':
        return (
          <TaskFormDialog
            themes={themes}
            tasks={tasks}
            onTaskCreate={(data) => {
              onTaskCreate(data);
              setOpenDialog(null);
            }}
            workspaceId={workspaceId}
          >
            <button ref={triggerRef} style={{ display: 'none' }} />
          </TaskFormDialog>
        );
      case 'subtask':
        return defaultParentTaskId ? (
          <SubtaskFormDialog
            themes={themes}
            tasks={tasks}
            parentTaskId={defaultParentTaskId}
            onTaskCreate={(data) => {
              onTaskCreate(data);
              setOpenDialog(null);
            }}
            workspaceId={workspaceId}
          >
            <button ref={triggerRef} style={{ display: 'none' }} />
          </SubtaskFormDialog>
        ) : null;
      case 'theme':
        return (
          <ThemeFormDialog
            strategicPillars={strategicPillars}
            onThemeCreate={(data) => {
              onThemeCreate(data);
              setOpenDialog(null);
            }}
            workspaceId={workspaceId}
          >
            <button ref={triggerRef} style={{ display: 'none' }} />
          </ThemeFormDialog>
        );
      case 'pillar':
        return (
          <PillarFormDialog
            domains={domains}
            onPillarCreate={(data) => {
              onPillarCreate(data);
              setOpenDialog(null);
            }}
            workspaceId={workspaceId}
          >
            <button ref={triggerRef} style={{ display: 'none' }} />
          </PillarFormDialog>
        );
      case 'domain':
        return (
          <DomainFormDialog
            onDomainCreate={(data) => {
              onDomainCreate(data);
              setOpenDialog(null);
            }}
            workspaceId={workspaceId}
          >
            <button ref={triggerRef} style={{ display: 'none' }} />
          </DomainFormDialog>
        );
      default:
        return null;
    }
  };

  if (variant === "compact") {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-6 w-6 p-0">
              <Plus className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="flex items-center gap-2">
              <span>Quick Create</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{terminology.domain.singular} → {terminology.pillar.singular} → {terminology.theme.singular} → Task</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Hierarchy section */}
            <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
              ORGANIZE STRUCTURE
            </DropdownMenuLabel>
            {hierarchyOptions.map((option) => {
              const Icon = option.icon;
              return (
                <DropdownMenuItem
                  key={option.id}
                  onClick={() => handleCreateClick(option.id)}
                  className="flex items-center gap-2"
                >
                  <div className="flex items-center" style={{ paddingLeft: `${(option.level - 1) * 8}px` }}>
                    {option.level > 1 && <ChevronRight className="w-3 h-3 text-muted-foreground mr-1" />}
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </DropdownMenuItem>
              );
            })}
            
            <DropdownMenuSeparator />
            
            {/* Tasks section */}
            <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
              CREATE WORK
            </DropdownMenuLabel>
            {taskOptions.map((option) => {
              const Icon = option.icon;
              return (
                <DropdownMenuItem
                  key={option.id}
                  onClick={() => handleCreateClick(option.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
        {renderDialog()}
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
            <Plus className="w-4 h-4" />
            Quick Create
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="flex items-center gap-2 text-base">
            <span>Quick Create</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <p className="font-medium mb-1">Hierarchy Structure:</p>
                    <p>{terminology.domain.singular} → {terminology.pillar.singular} → {terminology.theme.singular} → Task</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Hierarchy section */}
          <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
            ORGANIZE STRUCTURE
          </DropdownMenuLabel>
          {hierarchyOptions.map((option) => {
            const Icon = option.icon;
            return (
              <DropdownMenuItem
                key={option.id}
                onClick={() => handleCreateClick(option.id)}
                className="flex items-center gap-3 p-3"
              >
                <div className="flex items-center" style={{ paddingLeft: `${(option.level - 1) * 12}px` }}>
                  {option.level > 1 && <ChevronRight className="w-4 h-4 text-muted-foreground mr-2" />}
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-muted-foreground">{option.description}</div>
                </div>
              </DropdownMenuItem>
            );
          })}
          
          <DropdownMenuSeparator />
          
          {/* Tasks section */}
          <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
            CREATE WORK
          </DropdownMenuLabel>
          {taskOptions.map((option) => {
            const Icon = option.icon;
            return (
              <DropdownMenuItem
                key={option.id}
                onClick={() => handleCreateClick(option.id)}
                className="flex items-center gap-3 p-3"
              >
                <Icon className="w-5 h-5" />
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-muted-foreground">{option.description}</div>
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      {renderDialog()}
    </>
  );
}