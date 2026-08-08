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
import { Domain } from "@/types";
import { useWorkspaceTerms } from "@/hooks/use-workspace-terms";
import { useChecklists } from "@/hooks/use-checklists";
import { ListChecks } from "lucide-react";

const domainSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  color: z.string().min(1, "Color is required"),
  checklistId: z.string().optional(),
});

type DomainFormData = z.infer<typeof domainSchema>;

interface DomainFormDialogProps {
  children?: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDomainCreate: (domainData: Omit<Domain, "id" | "createdDate">) => Promise<string>;
  onApplyChecklist?: (domain: { id: string; workspaceId: string }, itemTitles: string[]) => void | Promise<void>;
  workspaceId: string;
}

export function DomainFormDialog({ children, defaultOpen = false, onOpenChange, onDomainCreate, onApplyChecklist, workspaceId }: DomainFormDialogProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (o: boolean) => {
    setOpen(o);
    onOpenChange?.(o);
  };
  const terms = useWorkspaceTerms(workspaceId);
  const label = terms.domain.singular;
  const { checklists } = useChecklists(workspaceId);
  const hasChecklists = checklists.length > 0;

  const form = useForm<DomainFormData>({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      title: "",
      description: "",
      color: "#3b82f6",
      checklistId: "none",
    },
  });

  const onSubmit = async (data: DomainFormData) => {
    setIsSubmitting(true);
    try {
      const domainId = await onDomainCreate({
        title: data.title,
        description: data.description || "",
        workspaceId,
        color: data.color
      });

      const selectedChecklist = data.checklistId && data.checklistId !== "none"
        ? checklists.find((c) => c.id === data.checklistId)
        : undefined;

      if (selectedChecklist && onApplyChecklist) {
        await onApplyChecklist(
          { id: domainId, workspaceId },
          selectedChecklist.items.map((item) => item.title)
        );
      }

      form.reset();
      handleOpenChange(false);
    } catch (error) {
      console.error("Error creating domain:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New {label}</DialogTitle>
          <DialogDescription>
            Add a new {label.toLowerCase()} to organize your work.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{label} Name</FormLabel>
                  <FormControl>
                    <Input placeholder={`Enter ${label.toLowerCase()} name...`} {...field} />
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
                          <SelectValue placeholder="Select a checklist to create its children..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
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

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
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