import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Edit, 
  Save, 
  X, 
  Tag,
  Target,
  Calendar as CalendarIcon,
  ArrowLeft,
  Package
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Theme, StrategicPillar, Task } from "@/types";

const themeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  associatedProject: z.string().optional(),
  strategicPillarIds: z.array(z.string()).min(0, "Strategic pillar selection is optional"),
});

type ThemeFormData = z.infer<typeof themeSchema>;

interface ThemeDetailDialogProps {
  theme: Theme | null;
  strategicPillars: StrategicPillar[];
  tasks: Task[];
  onThemeUpdate?: (themeId: string, updates: Partial<Theme>) => void;
  onClose: () => void;
  onBack?: () => void;
  onTaskView?: (task: Task) => void;
  onPillarView?: (pillar: StrategicPillar) => void;
}

export function ThemeDetailDialog({ 
  theme, 
  strategicPillars, 
  tasks,
  onThemeUpdate,
  onClose,
  onBack,
  onTaskView,
  onPillarView
}: ThemeDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  const form = useForm<ThemeFormData>({
    resolver: zodResolver(themeSchema),
    defaultValues: {
      title: "",
      description: "",
      associatedProject: "",
      strategicPillarIds: [],
    },
  });

  useEffect(() => {
    if (theme) {
      form.reset({
        title: theme.title,
        description: theme.description || "",
        associatedProject: theme.associatedProject || "",
        strategicPillarIds: theme.strategicPillarIds,
      });
    }
  }, [theme, form]);

  const onSubmit = async (data: ThemeFormData) => {
    if (!theme || !onThemeUpdate) return;
    
    const updates: Partial<Theme> = {
      title: data.title,
      description: data.description || "",
      associatedProject: data.associatedProject || "",
      strategicPillarIds: data.strategicPillarIds,
    };
    
    onThemeUpdate(theme.id, updates);
    setIsEditing(false);
  };

  if (!theme) return null;

  const associatedPillars = strategicPillars.filter(pillar => theme.strategicPillarIds.includes(pillar.id));
  const themeTasks = tasks.filter(task => task.themeIds.includes(theme.id));

  return (
    <Dialog open={!!theme} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[95vh] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Theme Details</DialogTitle>
        </DialogHeader>
        <div className="p-6 border-b bg-background/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              {/* Back button and type */}
              <div className="flex items-center gap-3">
                {onBack && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    className="h-8 w-8 p-0"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                )}
                <Badge variant="default" className="text-xs">
                  <Tag className="w-3 h-3 mr-1" />
                  Theme
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Created {format(theme.createdDate, 'MMM d, yyyy')}
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
                            placeholder="Enter theme title..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Form>
              ) : (
                <h1 className="text-xl font-semibold leading-tight">{theme.title}</h1>
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
                    disabled={!onThemeUpdate}
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
                  disabled={!onThemeUpdate}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Description */}
          {isEditing ? (
            <Form {...form}>
              <div className="space-y-4">
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

                <FormField
                  control={form.control}
                  name="associatedProject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Associated Project</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter associated project name..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="strategicPillarIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Strategic Pillars</FormLabel>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {strategicPillars.map((pillar) => (
                          <div key={pillar.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`pillar-${pillar.id}`}
                              checked={field.value.includes(pillar.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  field.onChange([...field.value, pillar.id]);
                                } else {
                                  field.onChange(field.value.filter(id => id !== pillar.id));
                                }
                              }}
                              className="rounded border-border"
                            />
                            <label
                              htmlFor={`pillar-${pillar.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {pillar.title}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          ) : (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Description
                </h3>
                {theme.description ? (
                  <div className="prose prose-sm max-w-none text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 rounded-lg p-4">
                    {theme.description}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic bg-muted/30 rounded-lg p-4">
                    No description provided
                  </div>
                )}
              </div>

              {/* Associated Project */}
              {theme.associatedProject && (
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Associated Project
                  </h3>
                  <div className="text-sm font-medium bg-muted/30 rounded-lg p-4">
                    {theme.associatedProject}
                  </div>
                </div>
              )}

              {/* Strategic Pillars */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Strategic Pillars
                </h3>
                {associatedPillars.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {associatedPillars.map((pillar) => (
                      <button
                        key={pillar.id}
                        onClick={() => onPillarView?.(pillar)}
                        className="text-left"
                      >
                        <Badge variant="outline" className="text-xs hover:bg-muted cursor-pointer">
                          {pillar.title}
                        </Badge>
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground italic">No pillars assigned</span>
                )}
              </div>

              <Separator />

              {/* Associated Tasks */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Tasks ({themeTasks.length})
                </h3>
                {themeTasks.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {themeTasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => onTaskView?.(task)}
                        className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{task.title}</div>
                            <div className="text-xs text-muted-foreground">
                              Due: {format(task.dueDate, 'MMM d, yyyy')}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={task.type === 'subtask' ? 'secondary' : 'default'} className="text-xs">
                              {task.type === 'subtask' ? 'Subtask' : 'Task'}
                            </Badge>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic bg-muted/30 rounded-lg p-4">
                    No tasks associated with this theme yet
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}