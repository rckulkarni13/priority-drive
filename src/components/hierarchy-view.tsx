import { useState } from "react";
import { Domain, StrategicPillar, Theme, Task } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ChevronRight, 
  FolderTree, 
  Target, 
  Lightbulb, 
  CheckSquare, 
  Trash2, 
  Plus,
  Building2,
  Circle
} from "lucide-react";
import { PriorityTaskRow } from "./priority-task-row";

interface HierarchyViewProps {
  domains: Domain[];
  strategicPillars: StrategicPillar[];
  themes: Theme[];
  tasks: Task[];
  onTaskView?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskToggleStatus?: (taskId: string) => void;
  onTaskReopen?: (taskId: string) => void;
  onCreateSubtask?: (parentTaskId: string) => void;
  onCreateTask?: (themeId?: string) => void;
  onCreateTheme?: (pillarId?: string) => void;
  onCreatePillar?: (domainId?: string) => void;
  onDomainDelete?: (domainId: string) => void;
  onPillarDelete?: (pillarId: string) => void;
  onThemeDelete?: (themeId: string) => void;
}

export function HierarchyView({ 
  domains, 
  strategicPillars, 
  themes, 
  tasks, 
  onTaskView,
  onTaskEdit, 
  onTaskToggleStatus, 
  onTaskReopen,
  onCreateSubtask,
  onCreateTask,
  onCreateTheme,
  onCreatePillar,
  onDomainDelete,
  onPillarDelete,
  onThemeDelete,
}: HierarchyViewProps) {
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());
  const [expandedPillars, setExpandedPillars] = useState<Set<string>>(new Set());
  const [expandedThemes, setExpandedThemes] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string, type: 'domain' | 'pillar' | 'theme') => {
    const setters = {
      domain: setExpandedDomains,
      pillar: setExpandedPillars,
      theme: setExpandedThemes
    };
    
    setters[type](prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getTasksForTheme = (themeId: string) => {
    return tasks.filter(task => 
      task.themeIds.includes(themeId) && 
      task.type === 'task'
    );
  };

  const getSubtasksForTask = (taskId: string) => {
    return tasks.filter(task => 
      task.parentTaskId === taskId && 
      task.type === 'subtask'
    );
  };

  const getThemesForPillar = (pillarId: string) => {
    return themes.filter(theme => theme.strategicPillarIds.includes(pillarId));
  };

  const getPillarsForDomain = (domainId: string) => {
    return strategicPillars.filter(pillar => pillar.domainIds.includes(domainId));
  };

  if (domains.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <FolderTree className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No domains found. Create your first domain to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <FolderTree className="w-5 h-5" />
        Hierarchy View
      </h2>

      <div className="space-y-4">
        {domains.map(domain => {
          const domainPillars = getPillarsForDomain(domain.id);
          const isDomainExpanded = expandedDomains.has(domain.id);

          return (
            <div key={domain.id} className="space-y-3">
              {/* Domain Level */}
              <Collapsible
                open={isDomainExpanded}
                onOpenChange={() => toggleExpanded(domain.id, 'domain')}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg hover:from-primary/15 hover:to-primary/10 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      {isDomainExpanded ? (
                        <ChevronDown className="w-5 h-5 text-primary" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-primary" />
                      )}
                      <Building2 className="w-5 h-5 text-primary" />
                      <div>
                        <h3 className="font-semibold text-lg">{domain.title}</h3>
                        {domain.description && (
                          <p className="text-sm text-muted-foreground">{domain.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreatePillar?.(domain.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Pillar
                      </Button>
                      <Badge variant="secondary">
                        {domainPillars.length} pillars
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDomainDelete?.(domain.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="ml-8 mt-3 space-y-3">
                    {domainPillars.map(pillar => {
                      const pillarThemes = getThemesForPillar(pillar.id);
                      const isPillarExpanded = expandedPillars.has(pillar.id);

                      return (
                        <div key={pillar.id} className="space-y-2">
                          {/* Pillar Level */}
                          <Collapsible
                            open={isPillarExpanded}
                            onOpenChange={() => toggleExpanded(pillar.id, 'pillar')}
                          >
                            <CollapsibleTrigger asChild>
                              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-25 rounded-lg hover:from-blue-100 hover:to-blue-50 transition-all cursor-pointer group border-l-4 border-blue-200">
                                <div className="flex items-center gap-3">
                                  {isPillarExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-blue-600" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-blue-600" />
                                  )}
                                  <Target className="w-4 h-4 text-blue-600" />
                                  <div>
                                    <h4 className="font-medium">{pillar.title}</h4>
                                    {pillar.description && (
                                      <p className="text-sm text-muted-foreground">{pillar.description}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onCreateTheme?.(pillar.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Theme
                                  </Button>
                                  <Badge variant="outline">
                                    {pillarThemes.length} themes
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onPillarDelete?.(pillar.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <div className="ml-6 mt-2 space-y-2">
                                {pillarThemes.map(theme => {
                                  const themeTasks = getTasksForTheme(theme.id);
                                  const isThemeExpanded = expandedThemes.has(theme.id);

                                  return (
                                    <div key={theme.id} className="space-y-2">
                                      {/* Theme Level */}
                                      <Collapsible
                                        open={isThemeExpanded}
                                        onOpenChange={() => toggleExpanded(theme.id, 'theme')}
                                      >
                                        <CollapsibleTrigger asChild>
                                          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-25 rounded-lg hover:from-green-100 hover:to-green-50 transition-all cursor-pointer group border-l-4 border-green-200">
                                            <div className="flex items-center gap-3">
                                              {isThemeExpanded ? (
                                                <ChevronDown className="w-4 h-4 text-green-600" />
                                              ) : (
                                                <ChevronRight className="w-4 h-4 text-green-600" />
                                              )}
                                              <Lightbulb className="w-4 h-4 text-green-600" />
                                              <div>
                                                <h5 className="font-medium">{theme.title}</h5>
                                                {theme.description && (
                                                  <p className="text-sm text-muted-foreground">{theme.description}</p>
                                                )}
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  onCreateTask?.(theme.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                              >
                                                <Plus className="w-3 h-3 mr-1" />
                                                Add Task
                                              </Button>
                                              <Badge variant="outline">
                                                {themeTasks.length} tasks
                                              </Badge>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  onThemeDelete?.(theme.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </Button>
                                            </div>
                                          </div>
                                        </CollapsibleTrigger>

                                        <CollapsibleContent>
                                          <div className="ml-6 mt-2 space-y-2">
                                            {/* Tasks Level */}
                                            {themeTasks.map(task => {
                                              const subtasks = getSubtasksForTask(task.id);
                                              
                                              return (
                                                <div key={task.id} className="space-y-2">
                                                  <div className="flex items-center gap-2">
                                                    <Circle className="w-2 h-2 text-muted-foreground" />
                                                    <div className="flex-1">
                                                       <PriorityTaskRow
                                                         task={task}
                                                         allTasks={tasks}
                                                         themes={themes}
                                                         strategicPillars={strategicPillars}
                                                         domains={domains}
                                                         onTaskView={onTaskView}
                                                         onTaskEdit={onTaskEdit}
                                                         onTaskToggleStatus={onTaskToggleStatus}
                                                         onTaskReopen={onTaskReopen}
                                                         onCreateSubtask={onCreateSubtask}
                                                       />
                                                    </div>
                                                  </div>
                                                  
                                                  {/* Subtasks */}
                                                  {subtasks.length > 0 && (
                                                    <div className="ml-6 space-y-2">
                                                      {subtasks.map(subtask => (
                                                        <div key={subtask.id} className="flex items-center gap-2">
                                                          <Circle className="w-1.5 h-1.5 text-muted-foreground" />
                                                          <div className="flex-1">
                                                             <PriorityTaskRow
                                                               task={subtask}
                                                               allTasks={tasks}
                                                               themes={themes}
                                                               strategicPillars={strategicPillars}
                                                               domains={domains}
                                                               onTaskView={onTaskView}
                                                               onTaskEdit={onTaskEdit}
                                                               onTaskToggleStatus={onTaskToggleStatus}
                                                               onTaskReopen={onTaskReopen}
                                                               onCreateSubtask={onCreateSubtask}
                                                             />
                                                          </div>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })}
                                            
                                            {themeTasks.length === 0 && (
                                              <div className="text-sm text-muted-foreground italic p-3 bg-muted/30 rounded-lg flex items-center justify-between">
                                                <span>No tasks in this theme</span>
                                                <Button 
                                                  variant="ghost" 
                                                  size="sm"
                                                  onClick={() => onCreateTask?.(theme.id)}
                                                  className="h-7 px-2 text-xs"
                                                >
                                                  <Plus className="w-3 h-3 mr-1" />
                                                  Add Task
                                                </Button>
                                              </div>
                                            )}
                                          </div>
                                        </CollapsibleContent>
                                      </Collapsible>
                                    </div>
                                  );
                                })}
                                
                                {pillarThemes.length === 0 && (
                                  <div className="text-sm text-muted-foreground italic p-3 bg-muted/30 rounded-lg flex items-center justify-between">
                                    <span>No themes in this pillar</span>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => onCreateTheme?.(pillar.id)}
                                      className="h-7 px-2 text-xs"
                                    >
                                      <Plus className="w-3 h-3 mr-1" />
                                      Add Theme
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      );
                    })}
                    
                    {domainPillars.length === 0 && (
                      <div className="text-sm text-muted-foreground italic p-3 bg-muted/30 rounded-lg flex items-center justify-between">
                        <span>No pillars in this domain</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onCreatePillar?.(domain.id)}
                          className="h-7 px-2 text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Pillar
                        </Button>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          );
        })}
      </div>
    </div>
  );
}