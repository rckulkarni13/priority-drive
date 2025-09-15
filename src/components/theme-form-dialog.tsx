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

const themeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  strategicPillarIds: z.array(z.string()).min(1, "Please select at least one strategic pillar"),
});

type ThemeFormData = z.infer<typeof themeSchema>;

interface ThemeFormDialogProps {
  children: React.ReactNode;
  strategicPillars: StrategicPillar[];
  defaultPillarId?: string;
  onThemeCreate: (themeData: Omit<Theme, "id" | "createdDate">) => void;
  onOpenChange?: (open: boolean) => void;
}

export function ThemeFormDialog({ children, strategicPillars, defaultPillarId, onThemeCreate, onOpenChange }: ThemeFormDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<ThemeFormData>({
    resolver: zodResolver(themeSchema),
    defaultValues: {
      title: "",
      description: "",
      strategicPillarIds: defaultPillarId ? [defaultPillarId] : [],
    },
  });

  const onSubmit = (data: ThemeFormData) => {
    onThemeCreate({
      title: data.title,
      description: data.description,
      strategicPillarIds: data.strategicPillarIds,
    });
    form.reset();
    setOpen(false);
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); onOpenChange?.(o); }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Theme</DialogTitle>
          <DialogDescription>
            Add a theme to group related tasks under a strategic pillar.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter theme title..." {...field} />
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
                      placeholder="Describe the theme..."
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
              name="strategicPillarIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Strategic Pillars</FormLabel>
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
              <Button type="submit">Create Theme</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}