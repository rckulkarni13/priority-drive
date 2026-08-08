import { useMemo } from "react";
import { format, isSameDay, isTomorrow } from "date-fns";
import { Task, Theme, StrategicPillar, Domain, Workspace } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, CalendarDays, CalendarClock, Layers, Target, Package } from "lucide-react";
import { categorizeOverviewTasks } from "@/lib/overview-tasks";
import { getEffectiveStartDate, getEffectiveEndDate } from "@/lib/task-dates";
import { resolveWorkspaceTerminology } from "@/lib/workspace-terminology";
import { cn } from "@/lib/utils";

interface OverviewViewProps {
  tasks: Task[];
  themes: Theme[];
  strategicPillars: StrategicPillar[];
  domains: Domain[];
  workspaces: Workspace[];
  onTaskOpen: (task: Task) => void;
  onTaskToggleStatus: (taskId: string) => void;
  onTaskDelete?: (taskId: string) => void;
}

const priorityClass: Record<string, string> = {
  critical: "bg-[hsl(var(--priority-critical)/0.1)] text-[hsl(var(--priority-critical))] border-[hsl(var(--priority-critical))]",
  high: "bg-[hsl(var(--priority-high)/0.1)] text-[hsl(var(--priority-high))] border-[hsl(var(--priority-high))]",
  medium: "bg-[hsl(var(--priority-medium)/0.1)] text-[hsl(var(--priority-medium))] border-[hsl(var(--priority-medium))]",
  low: "bg-[hsl(var(--priority-low)/0.1)] text-[hsl(var(--priority-low))] border-[hsl(var(--priority-low))]",
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

function getWorkspaceColor(tone: "overdue" | "today" | "upcoming"): string {
  switch (tone) {
    case "overdue":
      return "hsl(var(--destructive))";
    case "today":
      return "hsl(var(--primary))";
    case "upcoming":
      return "hsl(var(--muted-foreground))";
  }
}

function TaskCard({
  task,
  workspace,
  themes,
  strategicPillars,
  domains,
  onTaskOpen,
  onTaskToggleStatus,
  onTaskDelete,
}: {
  task: Task;
  workspace?: Workspace;
  themes: Theme[];
  strategicPillars: StrategicPillar[];
  domains: Domain[];
  onTaskOpen: (task: Task) => void;
  onTaskToggleStatus: (taskId: string) => void;
  onTaskDelete?: (taskId: string) => void;
}) {
  const terminology = workspace
    ? resolveWorkspaceTerminology(workspace.type, workspace.tierLabels)
    : resolveWorkspaceTerminology('work');
  const taskThemes = themes.filter(t => task.themeIds.includes(t.id));
  const relatedPillars = strategicPillars.filter(pillar =>
    taskThemes.some(theme => theme.strategicPillarIds.includes(pillar.id))
  );
  const relatedDomains = domains.filter(domain =>
    relatedPillars.some(pillar => pillar.domainIds.includes(domain.id))
  );

  const leftAccent = workspace?.color || "hsl(var(--border))";

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
      className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 cursor-pointer hover:ring-1 hover:ring-ring/30 transition-all shadow-sm"
      style={{ borderLeftWidth: 4, borderLeftColor: leftAccent }}
    >
      <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={task.status === "completed"}
          onCheckedChange={() => onTaskToggleStatus(task.id)}
          aria-label={`Mark ${task.title} complete`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium leading-snug break-words text-sm">{task.title}</p>
          {workspace && (
            <span className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-1">
              <span>{workspace.icon}</span>
              {workspace.name}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {relatedDomains.length > 0 ? (
            relatedDomains.map(domain => (
              <Badge
                key={domain.id}
                variant="outline"
                className="text-[10px] h-5 px-1.5 border-2"
                style={{
                  borderColor: domain.color,
                  backgroundColor: `${domain.color}15`,
                  color: domain.color,
                }}
              >
                <Package className="w-3 h-3 mr-1" />
                {domain.title}
              </Badge>
            ))
          ) : (
            <Badge variant="outline" className="text-[10px] h-5 px-1.5 text-muted-foreground">
              No {terminology.domain.singular}
            </Badge>
          )}

          {relatedPillars.length > 0 ? (
            relatedPillars.map(pillar => (
              <Badge
                key={pillar.id}
                variant="outline"
                className="text-[10px] h-5 px-1.5 border-2"
                style={{
                  borderColor: pillar.color,
                  backgroundColor: `${pillar.color}15`,
                  color: pillar.color,
                }}
              >
                <Target className="w-3 h-3 mr-1" />
                {pillar.title}
              </Badge>
            ))
          ) : (
            <Badge variant="outline" className="text-[10px] h-5 px-1.5 text-muted-foreground">
              No {terminology.pillar.singular}
            </Badge>
          )}

          {taskThemes.length > 0 ? (
            taskThemes.map(theme => (
              <Badge
                key={theme.id}
                variant="outline"
                className="text-[10px] h-5 px-1.5 border-2"
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
            <Badge variant="outline" className="text-[10px] h-5 px-1.5 text-muted-foreground">
              No {terminology.theme.singular}
            </Badge>
          )}

          <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5 capitalize border-2", priorityClass[task.priority])}>
            {task.priority}
          </Badge>

          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
            {formatWhen(task)}
          </Badge>

          {task.status === "hold" && (
            <Badge variant="outline" className="text-[10px] h-5 px-1.5">On hold</Badge>
          )}
        </div>
      </div>
    </div>
  );
}

function Column({
  title,
  description,
  icon: Icon,
  tone,
  tasks,
  workspaces,
  themes,
  strategicPillars,
  domains,
  onTaskOpen,
  onTaskToggleStatus,
  emptyMessage,
  groupByDate = false,
}: {
  title: string;
  description: string;
  icon: typeof AlertTriangle;
  tone: "overdue" | "today" | "upcoming";
  tasks: Task[];
  workspaces: Workspace[];
  themes: Theme[];
  strategicPillars: StrategicPillar[];
  domains: Domain[];
  onTaskOpen: (task: Task) => void;
  onTaskToggleStatus: (taskId: string) => void;
  emptyMessage: string;
  groupByDate?: boolean;
}) {
  const toneColor = getWorkspaceColor(tone);

  return (
    <div className="flex flex-col bg-muted/50 rounded-2xl border border-border overflow-hidden h-full">
      <div className="p-4 bg-card border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" style={{ color: toneColor }} />
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: toneColor }}>
            {title}
          </h2>
          <Badge variant="secondary" className="text-xs h-5 px-2">{tasks.length}</Badge>
        </div>
        <span className="text-xs text-muted-foreground hidden 2xl:inline">{description}</span>
      </div>

      {tasks.length === 0 ? (
        <div className="flex-1 overflow-y-auto p-4">
          <Card className="h-full flex items-center justify-center p-6 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </Card>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {groupByDate ? (
            <UpcomingGroups
              tasks={tasks}
              workspaces={workspaces}
              themes={themes}
              strategicPillars={strategicPillars}
              domains={domains}
              onTaskOpen={onTaskOpen}
              onTaskToggleStatus={onTaskToggleStatus}
            />
          ) : (
            tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                workspace={workspaces.find(w => w.id === task.workspaceId)}
                themes={themes}
                strategicPillars={strategicPillars}
                domains={domains}
                onTaskOpen={onTaskOpen}
                onTaskToggleStatus={onTaskToggleStatus}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function UpcomingGroups({
  tasks,
  workspaces,
  themes,
  strategicPillars,
  domains,
  onTaskOpen,
  onTaskToggleStatus,
}: {
  tasks: Task[];
  workspaces: Workspace[];
  themes: Theme[];
  strategicPillars: StrategicPillar[];
  domains: Domain[];
  onTaskOpen: (task: Task) => void;
  onTaskToggleStatus: (taskId: string) => void;
}) {
  const today = new Date();
  const groups = useMemo(() => {
    const map: Record<string, { label: string; tasks: Task[] }> = {};
    for (const task of tasks) {
      const end = getEffectiveEndDate(task);
      if (!end) continue;
      let label: string;
      if (isTomorrow(end)) label = "Tomorrow";
      else label = format(end, "EEEE");
      if (!map[label]) map[label] = { label, tasks: [] };
      map[label].tasks.push(task);
    }
    return Object.values(map);
  }, [tasks]);

  return (
    <div className="space-y-4">
      {groups.map(group => (
        <div key={group.label} className="space-y-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
            {group.label}
          </p>
          <div className="space-y-3">
            {group.tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                workspace={workspaces.find(w => w.id === task.workspaceId)}
                themes={themes}
                strategicPillars={strategicPillars}
                domains={domains}
                onTaskOpen={onTaskOpen}
                onTaskToggleStatus={onTaskToggleStatus}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function OverviewView({
  tasks,
  themes,
  strategicPillars,
  domains,
  workspaces,
  onTaskOpen,
  onTaskToggleStatus,
}: OverviewViewProps) {
  const buckets = useMemo(() => categorizeOverviewTasks(tasks), [tasks]);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Everything time-sensitive across all your workspaces.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 flex-1 min-h-[500px] md:h-[calc(100vh-14rem)]">
        <Column
          title="Overdue"
          description="Past their due or end date"
          icon={AlertTriangle}
          tone="overdue"
          tasks={buckets.overdue}
          workspaces={workspaces}
          themes={themes}
          strategicPillars={strategicPillars}
          domains={domains}
          onTaskOpen={onTaskOpen}
          onTaskToggleStatus={onTaskToggleStatus}
          emptyMessage="Nothing overdue."
        />

        <Column
          title="Today"
          description="Due today or in an active date range"
          icon={CalendarDays}
          tone="today"
          tasks={buckets.today}
          workspaces={workspaces}
          themes={themes}
          strategicPillars={strategicPillars}
          domains={domains}
          onTaskOpen={onTaskOpen}
          onTaskToggleStatus={onTaskToggleStatus}
          emptyMessage="Nothing due today."
        />

        <Column
          title="Upcoming"
          description="Tomorrow through 7 days out"
          icon={CalendarClock}
          tone="upcoming"
          tasks={buckets.upcoming}
          workspaces={workspaces}
          themes={themes}
          strategicPillars={strategicPillars}
          domains={domains}
          onTaskOpen={onTaskOpen}
          onTaskToggleStatus={onTaskToggleStatus}
          emptyMessage="Nothing coming up — add a task to get started."
          groupByDate
        />
      </div>
    </div>
  );
}
