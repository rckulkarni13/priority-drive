import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Theme, StrategicPillar } from "@/types";
import { useWorkspaceTerms } from "@/hooks/use-workspace-terms";
import { useChecklists } from "@/hooks/use-checklists";
import { ListChecks } from "lucide-react";

const themeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  strategicPillarIds: z.array(z.string()).min(1, "Please select at least one"),
  color: z.string().min(1, "Color is required"),
  checklistId: z.string().optional(),
});

type ThemeFormData = z.infer<typeof themeSchema>;

interface ThemeFormDialogProps {
  children: React.ReactNode;
  strategicPillars: StrategicPillar[];
  defaultPillarId?: string;
  onThemeCreate: (themeData: Omit<Theme, "id" | "createdDate">) => Promise<string>;
  onApplyChecklist?: (theme: { id: string; workspaceId: string }, itemTitles: string[]) => void | Promise<void>;
  onOpenChange?: (open: boolean) => void;
  workspaceId: string;
}

export function ThemeFormDialog({ children, strategicPillars, defaultPillarId, onThemeCreate, onApplyChecklist, onOpenChange, workspaceId }: ThemeFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const terms = useWorkspaceTerms(workspaceId);
  const label = terms.theme.singular;
  const pillarTerms = terms.pillar;
  const { checklists } = useChecklists(workspaceId);
  const hasChecklists = checklists.length > 0;

  const form = useForm<ThemeFormData>({
    resolver: zodResolver(themeSchema),
    defaultValues: {
      title: "",
      description: "",
      strategicPillarIds: defaultPillarId ? [defaultPillarId] : [],
      color: "#06b6d4",
      checklistId: "",
    },
  });

  const onSubmit = async (data: ThemeFormData) => {
    setIsSubmitting(true);
    try {
      const themeId = await onThemeCreate({
        title: data.title,
        description: data.description || "",
        strategicPillarIds: data.strategicPillarIds,
        workspaceId,
        color: data.color
      });

      const selectedChecklist = data.checklistId
        ? checklists.find((c) => c.id === data.checklistId)
        : undefined;

      if (selectedChecklist && onApplyChecklist) {
        await onApplyChecklist(
          themeId,
          selectedChecklist.items.map((item) => item.title)
        );
      }

      form.reset();
      setOpen(false);
      onOpenChange?.(false);
    } catch (error) {
      console.error("Error creating theme:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); onOpenChange?.(o); }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New {label}</DialogTitle>
          <DialogDescription>
            Add a {label.toLowerCase()} to group related tasks under a {pillarTerms.singular.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{label} Title</FormLabel>
                  <FormControl>
                    <Input placeholder={`Enter ${label.toLowerCase()} title...`} {...field} />
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`Describe the ${label.toLowerCase()}...`}
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Input 
                      type="color" 
                      {...field}
                      className="h-10 w-full cursor-pointer"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {hasChecklists && (
              <FormField
                control={form.control}
                name="checklistId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <ListChecks className="w-4 h-4" />
                      Apply Checklist (Optional)
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a checklist to create its tasks..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {checklists.map((checklist) => (
                          <SelectItem key={checklist.id} value={checklist.id}>
                            {checklist.title} ({checklist.items.length} steps)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="strategicPillarIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{pillarTerms.plural}</FormLabel>
                  <div className="space-y-2">
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

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setOpen(false); onOpenChange?.(false); }}
              >
                Cancel
              </Button
              >
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : `Create ${label}`}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}