import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  CalendarDays,
  FolderTree,
  CheckSquare,
  Target,
  CalendarX2,
  Settings,
  MoreHorizontal,
  LayoutDashboard,
  Tags,
  ListChecks
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Workspace } from "@/types";

type View = 'overview' | 'today' | 'calendar' | 'hierarchy' | 'completed' | 'all-tasks' | 'manage';

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  onWorkspaceChange: (workspace: Workspace) => void;
  onRenameLabels: () => void;
  onOpenChecklists?: () => void;
  todayTasksCount: number;
  completedTasksCount: number;
  allTasksCount: number;
  domainsCount: number;
  pillarsCount: number;
  themesCount: number;
  overviewAlertCount: number;
}

export function Navigation({
  currentView,
  onViewChange,
  workspaces,
  currentWorkspace,
  onWorkspaceChange,
  onRenameLabels,
  onOpenChecklists,
  todayTasksCount,
  completedTasksCount,
  allTasksCount,
  domainsCount,
  pillarsCount,
  themesCount,
  overviewAlertCount
}: NavigationProps) {
  // Time-based views shown directly
  const timeBasedViews = [
    {
      id: 'today' as View,
      label: 'Today',
      icon: CalendarDays,
      count: todayTasksCount,
      color: 'text-blue-600',
    },
    {
      id: 'calendar' as View,
      label: 'Calendar',
      icon: CalendarX2,
      count: allTasksCount,
      color: 'text-pink-600',
    },
  ];

  // Other views in More dropdown
  const moreViews = [
    {
      id: 'hierarchy' as View,
      label: 'Hierarchy View',
      icon: FolderTree,
      count: allTasksCount,
      color: 'text-purple-600',
    },
    {
      id: 'all-tasks' as View,
      label: 'All Tasks',
      icon: Target,
      count: allTasksCount,
      color: 'text-green-600',
    },
    {
      id: 'manage' as View,
      label: 'Manage Items',
      icon: Settings,
      count: domainsCount + pillarsCount + themesCount,
      color: 'text-orange-600',
    },
    {
      id: 'completed' as View,
      label: 'Completed',
      icon: CheckSquare,
      count: completedTasksCount,
      color: 'text-gray-600',
    },
  ];

  const isMoreViewActive = moreViews.some(view => view.id === currentView);

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {/* Global cross-workspace section */}
      <div className="flex items-center">
        <Button
          variant={currentView === 'overview' ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewChange('overview')}
          className={cn(
            "relative flex items-center gap-1.5 sm:gap-2 transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3",
            currentView === 'overview' && "shadow-md",
            currentView !== 'overview' && "hover:bg-background/80"
          )}
        >
          <LayoutDashboard className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", currentView !== 'overview' && "text-indigo-600")} />
          <span className="font-medium">Overview</span>
          {overviewAlertCount > 0 && (
            <Badge
              variant="destructive"
              className="text-[10px] sm:text-xs ml-0.5 sm:ml-1 h-4 sm:h-5 px-1 sm:px-1.5"
            >
              {overviewAlertCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Visual divider between global and workspace-scoped navigation */}
      <div className="hidden sm:block h-6 w-px bg-border mx-1" />

      {/* Workspace-scoped container: Workspace → Views */}
      <div className="flex flex-wrap items-center gap-1 pl-1 pr-1 py-1 bg-muted/50 rounded-xl border border-border/50">
        {currentWorkspace && (
          <>
            <WorkspaceSwitcher
              workspaces={workspaces}
              currentWorkspace={currentWorkspace}
              onWorkspaceChange={onWorkspaceChange}
            />

            <span className="hidden sm:inline text-muted-foreground/60 text-xs px-0.5 select-none">/</span>
          </>
        )}

        {/* Time-based views */}
        {timeBasedViews.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex items-center gap-1.5 sm:gap-2 transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3",
                isActive && "shadow-sm",
                !isActive && "hover:bg-background/80"
              )}
            >
              <Icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", !isActive && item.color)} />
              <span className="font-medium">{item.label}</span>
              {item.count > 0 && (
                <Badge
                  variant={isActive ? "secondary" : "outline"}
                  className="text-[10px] sm:text-xs ml-0.5 sm:ml-1 h-4 sm:h-5 px-1 sm:px-1.5"
                >
                  {item.count}
                </Badge>
              )}
            </Button>
          );
        })}

        {/* More dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={isMoreViewActive ? "default" : "ghost"}
              size="sm"
              className={cn(
                "flex items-center gap-1.5 sm:gap-2 transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3",
                isMoreViewActive && "shadow-sm"
              )}
            >
              <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="font-medium">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 sm:w-56 bg-background z-50">
            <DropdownMenuLabel>Other Views</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {moreViews.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer text-sm",
                    isActive && "bg-accent"
                  )}
                >
                  <Icon className={cn("w-4 h-4", item.color)} />
                  <span className="flex-1">{item.label}</span>
                  {item.count > 0 && (
                    <Badge variant="outline" className="text-[10px] sm:text-xs h-4 sm:h-5 px-1 sm:px-1.5">
                      {item.count}
                    </Badge>
                  )}
                </DropdownMenuItem>
              );
            })}
            {currentWorkspace && onOpenChecklists && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Workspace Tools</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={onOpenChecklists}
                  className="flex items-center gap-2 cursor-pointer text-sm"
                >
                  <ListChecks className="w-4 h-4 text-teal-600" />
                  <span className="flex-1">Checklists</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Trailing config action, demoted to an icon */}
        {currentWorkspace && (
          <>
            <div className="h-5 w-px bg-border/60 mx-0.5" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  aria-label="Rename workspace labels"
                  onClick={onRenameLabels}
                >
                  <Tags className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Rename this workspace's tier labels</TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </nav>
  );
}