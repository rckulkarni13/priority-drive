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
  Globe,
  Target,
  ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import { Domain, StrategicPillar } from "@/types";

const domainSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

type DomainFormData = z.infer<typeof domainSchema>;

interface DomainDetailDialogProps {
  domain: Domain | null;
  strategicPillars: StrategicPillar[];
  onDomainUpdate?: (domainId: string, updates: Partial<Domain>) => void;
  onClose: () => void;
  onBack?: () => void;
  onPillarView?: (pillar: StrategicPillar) => void;
}

export function DomainDetailDialog({ 
  domain, 
  strategicPillars,
  onDomainUpdate,
  onClose,
  onBack,
  onPillarView
}: DomainDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  const form = useForm<DomainFormData>({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    if (domain) {
      form.reset({
        title: domain.title,
        description: domain.description || "",
      });
    }
  }, [domain, form]);

  const onSubmit = async (data: DomainFormData) => {
    if (!domain || !onDomainUpdate) return;
    
    const updates: Partial<Domain> = {
      title: data.title,
      description: data.description || "",
    };
    
    onDomainUpdate(domain.id, updates);
    setIsEditing(false);
  };

  if (!domain) return null;

  const domainPillars = strategicPillars.filter(pillar => pillar.domainIds.includes(domain.id));

  return (
    <Dialog open={!!domain} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[95vh] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Domain Details</DialogTitle>
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
                  <Globe className="w-3 h-3 mr-1" />
                  Domain
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Created {format(domain.createdDate, 'MMM d, yyyy')}
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
                            placeholder="Enter domain title..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Form>
              ) : (
                <h1 className="text-xl font-semibold leading-tight">{domain.title}</h1>
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
                    disabled={!onDomainUpdate}
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
                  disabled={!onDomainUpdate}
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
              {domain.description ? (
                <div className="prose prose-sm max-w-none text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 rounded-lg p-4">
                  {domain.description}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic bg-muted/30 rounded-lg p-4">
                  No description provided
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Associated Strategic Pillars */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Strategic Pillars ({domainPillars.length})
            </h3>
            {domainPillars.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {domainPillars.map((pillar) => (
                  <button
                    key={pillar.id}
                    onClick={() => onPillarView?.(pillar)}
                    className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{pillar.title}</div>
                        {pillar.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {pillar.description}
                          </div>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {pillar.targetTimeFrame}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic bg-muted/30 rounded-lg p-4">
                No strategic pillars associated with this domain yet
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}