import { useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { Task, Theme, Workspace } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, CalendarDays, CalendarClock, Layers } from "lucide-react";
import { categorizeOverviewTasks } from "@/lib/overview-tasks";
import { getEffectiveStartDate, getEffectiveEndDate } from "@/lib/task-dates";
import { getWorkspaceTerminology } from "@/lib/workspace-terminology";
import { cn } from "@/lib/utils";

interface OverviewViewProps {
  tasks: Task[];
  themes: Theme[];
  workspaces: Workspace[];
  onTaskOpen: (task: Task) => void;
  onTaskToggleStatus: (taskId: string) => void;
}

const priorityClass: Record<string, string> = {
  critical: "border-destructive text-destructive",
  high: "border-orange-500 text-orange-600",
  medium: "border-blue-500 text-blue-600",
  low: "border-muted-foreground text-muted-foreground",
};

function formatWhen(task: Task): string {
  const start = getEffectiveStartDate(task);
  const end = getEffectiveEndDate(task);
  if (!end) return "";
  if (start && !isSameDay(start, end)) {
    return `${format(start, "MMM d")} – ${format(end, "MMM d")}`;
  }
  return format(end, "MMM d, yyyy");
}

function TaskRow({
  task,
  workspace,
  themes,
  onTaskOpen,
  onTaskToggleStatus,
}: {
  task: Task;
  workspace?: Workspace;
  themes: Theme[];
  onTaskOpen: (task: Task) => void;
  onTaskToggleStatus: (taskId: string) => void;
}) {
  const themeLabel = workspace
    ? getWorkspaceTerminology(workspace.type).theme.singular
    : "Theme";
  const taskThemes = themes.filter(t => task.themeIds.includes(t.id));

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onTaskOpen(task)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTaskOpen(task);
        }
      }}
      className="flex items-start gap-3 rounded-md border border-border bg-card p-3 cursor-pointer hover:bg-muted/40 transition-colors"
    >
      <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={task.status === "completed"}
          onCheckedChange={() => onTaskToggleStatus(task.id)}
          aria-label={`Mark ${task.title} complete`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium leading-snug break-words">{task.title}</p>

        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {workspace && (
            <Badge
              variant="outline"
              className="text-xs border-2"
              style={{ borderColor: workspace.color, color: workspace.color }}
            >
              <span className="mr-1">{workspace.icon}</span>
              {workspace.name}
            </Badge>
          )}

          {taskThemes.length > 0 ? (
            taskThemes.map(theme => (
              <Badge
                key={theme.id}
                variant="outline"
                className="text-xs border-2"
                style={{
                  borderColor: theme.color,
                  backgroundColor: `${theme.color}15`,
                  color: theme.color,
                }}
              >
                <Layers className="w-3 h-3 mr-1" />
                {theme.title}
              </Badge>
            ))
          ) : (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              No {themeLabel}
            </Badge>
          )}

          <Badge variant="outline" className={cn("text-xs capitalize border-2", priorityClass[task.priority])}>
            {task.priority}
          </Badge>

          <Badge variant="secondary" className="text-xs">
            {formatWhen(task)}
          </Badge>

          {task.status === "hold" && (
            <Badge variant="outline" className="text-xs">On hold</Badge>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  icon: Icon,
  tone,
  tasks,
  workspaces,
  themes,
  onTaskOpen,
  onTaskToggleStatus,
  emptyMessage,
}: {
  title: string;
  description: string;
  icon: typeof AlertTriangle;
  tone: string;
  tasks: Task[];
  workspaces: Workspace[];
  themes: Theme[];
  onTaskOpen: (task: Task) => void;
  onTaskToggleStatus: (taskId: string) => void;
  emptyMessage: string;
}) {
  // Group by workspace, preserving workspace order
  const groups = workspaces
    .map(ws => ({ workspace: ws, items: tasks.filter(t => t.workspaceId === ws.id) }))
    .filter(g => g.items.length > 0);

  const orphans = tasks.filter(t => !workspaces.some(w => w.id === t.workspaceId));
  if (orphans.length > 0) {
    groups.push({ workspace: undefined as unknown as Workspace, items: orphans });
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className={cn("w-5 h-5", tone)} />
        <h2 className="text-lg font-semibold">{title}</h2>
        <Badge variant="secondary" className="text-xs">{tasks.length}</Badge>
        <span className="text-xs text-muted-foreground hidden sm:inline">{description}</span>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.map((group, i) => (
            <div key={group.workspace?.id ?? `orphan-${i}`} className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {group.workspace ? `${group.workspace.icon} ${group.workspace.name}` : "Other"}
                </h3>
                <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                  {group.items.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {group.items.map(task => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    workspace={group.workspace}
                    themes={themes}
                    onTaskOpen={onTaskOpen}
                    onTaskToggleStatus={onTaskToggleStatus}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function OverviewView({
  tasks,
  themes,
  workspaces,
  onTaskOpen,
  onTaskToggleStatus,
}: OverviewViewProps) {
  const buckets = useMemo(() => categorizeOverviewTasks(tasks), [tasks]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Everything time-sensitive across all your workspaces.
        </p>
      </div>

      <Section
        title="Overdue"
        description="Past their due or end date"
        icon={AlertTriangle}
        tone="text-destructive"
        tasks={buckets.overdue}
        workspaces={workspaces}
        themes={themes}
        onTaskOpen={onTaskOpen}
        onTaskToggleStatus={onTaskToggleStatus}
        emptyMessage="Nothing overdue."
      />

      <Section
        title="Today"
        description="Due today or in an active date range"
        icon={CalendarDays}
        tone="text-blue-600"
        tasks={buckets.today}
        workspaces={workspaces}
        themes={themes}
        onTaskOpen={onTaskOpen}
        onTaskToggleStatus={onTaskToggleStatus}
        emptyMessage="Nothing due today."
      />

      <Section
        title="Upcoming (Next 7 Days)"
        description="Tomorrow through 7 days out"
        icon={CalendarClock}
        tone="text-emerald-600"
        tasks={buckets.upcoming}
        workspaces={workspaces}
        themes={themes}
        onTaskOpen={onTaskOpen}
        onTaskToggleStatus={onTaskToggleStatus}
        emptyMessage="Nothing coming up — add a task to get started."
      />
    </div>
  );
}