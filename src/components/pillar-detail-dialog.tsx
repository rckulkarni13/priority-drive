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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Edit, 
  Save, 
  X, 
  Target,
  Globe,
  Tag,
  ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import { StrategicPillar, Domain, Theme } from "@/types";

const pillarSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  targetTimeFrame: z.string().min(1, "Target timeframe is required"),
  domainIds: z.array(z.string()).min(0, "Domain selection is optional"),
});

type PillarFormData = z.infer<typeof pillarSchema>;

interface PillarDetailDialogProps {
  pillar: StrategicPillar | null;
  domains: Domain[];
  themes: Theme[];
  onPillarUpdate?: (pillarId: string, updates: Partial<StrategicPillar>) => void;
  onClose: () => void;
  onBack?: () => void;
  onThemeView?: (theme: Theme) => void;
  onDomainView?: (domain: Domain) => void;
}

export function PillarDetailDialog({ 
  pillar, 
  domains, 
  themes,
  onPillarUpdate,
  onClose,
  onBack,
  onThemeView,
  onDomainView
}: PillarDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  const form = useForm<PillarFormData>({
    resolver: zodResolver(pillarSchema),
    defaultValues: {
      title: "",
      description: "",
      targetTimeFrame: "",
      domainIds: [],
    },
  });

  useEffect(() => {
    if (pillar) {
      form.reset({
        title: pillar.title,
        description: pillar.description || "",
        targetTimeFrame: pillar.targetTimeFrame,
        domainIds: pillar.domainIds,
      });
    }
  }, [pillar, form]);

  const onSubmit = async (data: PillarFormData) => {
    if (!pillar || !onPillarUpdate) return;
    
    const updates: Partial<StrategicPillar> = {
      title: data.title,
      description: data.description || "",
      targetTimeFrame: data.targetTimeFrame,
      domainIds: data.domainIds,
    };
    
    onPillarUpdate(pillar.id, updates);
    setIsEditing(false);
  };

  if (!pillar) return null;

  const associatedDomains = domains.filter(domain => pillar.domainIds.includes(domain.id));
  const pillarThemes = themes.filter(theme => theme.strategicPillarIds.includes(pillar.id));

  return (
    <Dialog open={!!pillar} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[95vh] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Strategic Pillar Details</DialogTitle>
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
                  <Target className="w-3 h-3 mr-1" />
                  Strategic Pillar
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Created {format(pillar.createdDate, 'MMM d, yyyy')}
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
                            placeholder="Enter pillar title..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Form>
              ) : (
                <h1 className="text-xl font-semibold leading-tight">{pillar.title}</h1>
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
                    disabled={!onPillarUpdate}
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
                  disabled={!onPillarUpdate}
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
          {/* Target Timeframe */}
          <div>
            <h3 className="text-sm font-medium mb-2">Target Timeframe</h3>
            {isEditing ? (
              <Form {...form}>
                <FormField
                  control={form.control}
                  name="targetTimeFrame"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Q1 2024, 6 months, etc."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Form>
            ) : (
              <div className="text-sm font-medium bg-muted/30 rounded-lg p-3">
                {pillar.targetTimeFrame}
              </div>
            )}
          </div>

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
                  name="domainIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Domains</FormLabel>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {domains.map((domain) => (
                          <div key={domain.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`domain-${domain.id}`}
                              checked={field.value.includes(domain.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  field.onChange([...field.value, domain.id]);
                                } else {
                                  field.onChange(field.value.filter(id => id !== domain.id));
                                }
                              }}
                              className="rounded border-border"
                            />
                            <label
                              htmlFor={`domain-${domain.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {domain.title}
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
                {pillar.description ? (
                  <div className="prose prose-sm max-w-none text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 rounded-lg p-4">
                    {pillar.description}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic bg-muted/30 rounded-lg p-4">
                    No description provided
                  </div>
                )}
              </div>

              {/* Domains */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Domains
                </h3>
                {associatedDomains.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {associatedDomains.map((domain) => (
                      <button
                        key={domain.id}
                        onClick={() => onDomainView?.(domain)}
                        className="text-left"
                      >
                        <Badge variant="outline" className="text-xs hover:bg-muted cursor-pointer">
                          {domain.title}
                        </Badge>
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground italic">No domains assigned</span>
                )}
              </div>

              <Separator />

              {/* Associated Themes */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Themes ({pillarThemes.length})
                </h3>
                {pillarThemes.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {pillarThemes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => onThemeView?.(theme)}
                        className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{theme.title}</div>
                            {theme.description && (
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {theme.description}
                              </div>
                            )}
                          </div>
                          {theme.associatedProject && (
                            <Badge variant="secondary" className="text-xs">
                              {theme.associatedProject}
                            </Badge>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic bg-muted/30 rounded-lg p-4">
                    No themes associated with this pillar yet
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