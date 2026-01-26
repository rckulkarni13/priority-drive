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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Theme, StrategicPillar } from "@/types";

const themeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  strategicPillarIds: z.array(z.string()).min(1, "Please select at least one strategic pillar"),
  color: z.string().min(1, "Color is required"),
});

type ThemeFormData = z.infer<typeof themeSchema>;

interface EditThemeDialogProps {
  theme: Theme | null;
  strategicPillars: StrategicPillar[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onThemeUpdate: (themeId: string, updates: Partial<Theme>) => void;
}

export function EditThemeDialog({ theme, strategicPillars, open, onOpenChange, onThemeUpdate }: EditThemeDialogProps) {
  const form = useForm<ThemeFormData>({
    resolver: zodResolver(themeSchema),
    defaultValues: {
      title: "",
      description: "",
      strategicPillarIds: [],
      color: "#06b6d4",
    },
  });

  useEffect(() => {
    if (theme && open) {
      form.reset({
        title: theme.title,
        description: theme.description || "",
        strategicPillarIds: theme.strategicPillarIds,
        color: theme.color || "#06b6d4",
      });
    }
  }, [theme, open, form]);

  const onSubmit = (data: ThemeFormData) => {
    if (!theme) return;
    
    onThemeUpdate(theme.id, {
      title: data.title,
      description: data.description || "",
      strategicPillarIds: data.strategicPillarIds,
      color: data.color
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Theme</DialogTitle>
          <DialogDescription>
            Update the theme details.
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
                  <FormLabel>Description (Optional)</FormLabel>
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
                          id={`edit-pillar-${pillar.id}`}
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
                          htmlFor={`edit-pillar-${pillar.id}`}
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
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
