import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Edit, Save, X } from "lucide-react";
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
}

export function TaskDetailDialog({ 
  task, 
  themes, 
  tasks, 
  onTaskUpdate, 
  onClose 
}: TaskDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                {task.title}
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
              </DialogTitle>
              <DialogDescription>
                {task.type === 'subtask' ? 'Subtask' : 'Task'} • Created {format(task.createdDate, 'MMM d, yyyy')}
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <X className="w-4 h-4 mr-1" /> : <Edit className="w-4 h-4 mr-1" />}
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            {isEditing ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter task title..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the task..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
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
                            <FormLabel>Theme</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange([value])}
                              value={field.value[0] || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
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
                          <FormLabel>Parent Task</FormLabel>
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
                          <FormLabel>Due Date</FormLabel>
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
                                className={cn("p-3 pointer-events-auto")}
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
                          <FormLabel>Priority Start Date</FormLabel>
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
                                className={cn("p-3 pointer-events-auto")}
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
                          <FormLabel>Priority End Date</FormLabel>
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
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Save className="w-4 h-4 mr-1" />
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="space-y-6">
                {task.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {task.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Dates</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Due Date:</span>
                        <span>{format(task.dueDate, 'MMM d, yyyy')}</span>
                      </div>
                      {task.prioritizedDate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Priority Start:</span>
                          <span>{format(task.prioritizedDate, 'MMM d, yyyy')}</span>
                        </div>
                      )}
                      {task.prioritizedEndDate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Priority End:</span>
                          <span>{format(task.prioritizedEndDate, 'MMM d, yyyy')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Priority:</span>
                        <PriorityBadge priority={task.priority} />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status:</span>
                        <StatusBadge status={task.status} />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="capitalize">{task.type}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {(selectedThemes.length > 0 || parentTask) && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-3">Related</h4>
                      <div className="space-y-2 text-sm">
                        {parentTask && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Parent Task:</span>
                            <span>{parentTask.title}</span>
                          </div>
                        )}
                        {selectedThemes.length > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Themes:</span>
                            <div className="text-right">
                              {selectedThemes.map(theme => (
                                <div key={theme.id}>{theme.title}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            <TaskComments taskId={task.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}