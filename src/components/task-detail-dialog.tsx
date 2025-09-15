import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CalendarIcon, 
  Edit, 
  Save, 
  X, 
  Clock, 
  Flag, 
  User, 
  Tag,
  CheckCircle2,
  Circle,
  ArrowUpRight,
  MessageSquare,
  Calendar as CalendarDays
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Task, Theme } from "@/types";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { TaskComments } from "@/components/task-comments";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  prioritizedDate: z.date().optional(),
  prioritizedEndDate: z.date().optional(),
  priority: z.enum(["critical", "high", "medium", "low"]),
  themeIds: z.array(z.string()).min(0, "Theme selection is optional"),
  parentTaskId: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskDetailDialogProps {
  task: Task | null;
  themes: Theme[];
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onClose: () => void;
  onTaskView?: (task: Task) => void;
}

export function TaskDetailDialog({ 
  task, 
  themes, 
  tasks, 
  onTaskUpdate, 
  onClose,
  onTaskView 
}: TaskDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'comments'>('overview');
  
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      themeIds: [],
      parentTaskId: undefined,
    },
  });

  useEffect(() => {
    if (task) {
      const parentTask = task.parentTaskId ? tasks.find(t => t.id === task.parentTaskId) : null;
      const defaultThemeIds = task.type === 'subtask' && parentTask ? parentTask.themeIds : task.themeIds;
      
      form.reset({
        title: task.title,
        description: task.description || "",
        dueDate: task.dueDate,
        prioritizedDate: task.prioritizedDate,
        prioritizedEndDate: task.prioritizedEndDate,
        priority: task.priority,
        themeIds: defaultThemeIds,
        parentTaskId: task.parentTaskId || undefined,
      });
    }
  }, [task, form, tasks]);

  const onSubmit = async (data: TaskFormData) => {
    if (!task) return;
    
    const updates: Partial<Task> = {
      title: data.title,
      description: data.description || "",
      dueDate: data.dueDate,
      prioritizedDate: data.prioritizedDate,
      prioritizedEndDate: data.prioritizedEndDate,
      priority: data.priority,
      themeIds: data.themeIds,
      parentTaskId: data.parentTaskId === "none" ? undefined : data.parentTaskId,
    };
    
    onTaskUpdate(task.id, updates);
    setIsEditing(false);
  };

  if (!task) return null;

  const parentTask = task.parentTaskId ? tasks.find(t => t.id === task.parentTaskId) : null;
  const selectedThemes = themes.filter(theme => task.themeIds.includes(theme.id));

  return (
    <Dialog open={!!task} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[95vh] p-0 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-background/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              {/* Type badge and status */}
              <div className="flex items-center gap-2">
                <Badge variant={task.type === 'subtask' ? 'secondary' : 'default'} className="text-xs">
                  {task.type === 'subtask' ? 'Subtask' : 'Task'}
                </Badge>
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
                <span className="text-xs text-muted-foreground">
                  Created {format(task.createdDate, 'MMM d, yyyy')}
                </span>
              </div>

              {/* Title */}
              {isEditing ? (
                <Form {...form}>
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="text-xl font-semibold border-0 px-0 h-auto bg-transparent focus-visible:ring-0"
                            placeholder="Enter task title..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Form>
              ) : (
                <h1 className="text-xl font-semibold leading-tight">{task.title}</h1>
              )}

              {/* Parent task reference */}
              {parentTask && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Subtask of</span>
                  <button 
                    onClick={() => onTaskView?.(parentTask)}
                    className="text-primary hover:underline font-medium"
                  >
                    {parentTask.title}
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={form.handleSubmit(onSubmit)}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Tab Navigation */}
            <div className="flex items-center gap-6 mb-6 border-b">
              <button
                onClick={() => setActiveTab('overview')}
                className={cn(
                  "pb-3 text-sm font-medium border-b-2 transition-colors",
                  activeTab === 'overview' 
                    ? "border-primary text-foreground" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={cn(
                  "pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                  activeTab === 'comments' 
                    ? "border-primary text-foreground" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <MessageSquare className="w-4 h-4" />
                Comments
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Description */}
                {isEditing ? (
                  <Form {...form}>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Add a description..."
                              className="min-h-[120px] resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Form>
                ) : (
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Edit className="w-4 h-4" />
                      Description
                    </h3>
                    {task.description ? (
                      <div className="prose prose-sm max-w-none text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 rounded-lg p-4">
                        {task.description}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground italic bg-muted/30 rounded-lg p-4">
                        No description provided
                      </div>
                    )}
                  </div>
                )}

                {/* Quick properties grid */}
                {!isEditing && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Dates */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        Dates
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Due date</span>
                          <span className="font-medium">{format(task.dueDate, 'MMM d, yyyy')}</span>
                        </div>
                        {task.prioritizedDate && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Priority start</span>
                            <span className="font-medium">{format(task.prioritizedDate, 'MMM d, yyyy')}</span>
                          </div>
                        )}
                        {task.prioritizedEndDate && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Priority end</span>
                            <span className="font-medium">{format(task.prioritizedEndDate, 'MMM d, yyyy')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Themes */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Themes
                      </h3>
                      {selectedThemes.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedThemes.map((theme) => (
                            <Badge key={theme.id} variant="outline" className="text-xs">
                              {theme.title}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">No themes assigned</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Edit form fields */}
                {isEditing && (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium flex items-center gap-2">
                                <Flag className="w-4 h-4" />
                                Priority
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="critical">Critical</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {task.type !== 'subtask' && (
                          <FormField
                            control={form.control}
                            name="themeIds"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium flex items-center gap-2">
                                  <Tag className="w-4 h-4" />
                                  Theme
                                </FormLabel>
                                <Select
                                  onValueChange={(value) => field.onChange(value === "none" ? [] : [value])}
                                  value={field.value?.[0] || "none"}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select theme" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="none">No theme</SelectItem>
                                    {themes.map((theme) => (
                                      <SelectItem key={theme.id} value={theme.id}>
                                        {theme.title}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>

                      {task.type === 'subtask' && (
                        <FormField
                          control={form.control}
                          name="parentTaskId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Parent Task</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || "none"}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select parent task" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="none">None (Convert to Main Task)</SelectItem>
                                  {tasks.filter(t => t.type === 'task' && t.id !== task.id).map((parentTaskOption) => (
                                    <SelectItem key={parentTaskOption.id} value={parentTaskOption.id}>
                                      {parentTaskOption.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="dueDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-sm font-medium">Due Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "MMM d, yyyy")
                                      ) : (
                                        <span>Pick date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="prioritizedDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-sm font-medium">Priority Start</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "MMM d, yyyy")
                                      ) : (
                                        <span>Pick date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="prioritizedEndDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-sm font-medium">Priority End</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "MMM d, yyyy")
                                      ) : (
                                        <span>Pick date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </form>
                  </Form>
                )}
              </div>
            )}

            {activeTab === 'comments' && (
              <TaskComments taskId={task.id} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}