import { useState } from "react";
import { Domain, StrategicPillar, Theme, WorkspaceType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Target, Lightbulb, Trash2, Settings, Pencil } from "lucide-react";
import { getWorkspaceTerminology } from "@/lib/workspace-terminology";
import { EditDomainDialog } from "./edit-domain-dialog";
import { EditPillarDialog } from "./edit-pillar-dialog";
import { EditThemeDialog } from "./edit-theme-dialog";

interface ManageViewProps {
  domains: Domain[];
  strategicPillars: StrategicPillar[];
  themes: Theme[];
  workspaceType: WorkspaceType;
  onDomainDelete?: (domainId: string) => void;
  onPillarDelete?: (pillarId: string) => void;
  onThemeDelete?: (themeId: string) => void;
  onDomainUpdate?: (domainId: string, updates: Partial<Domain>) => void;
  onPillarUpdate?: (pillarId: string, updates: Partial<StrategicPillar>) => void;
  onThemeUpdate?: (themeId: string, updates: Partial<Theme>) => void;
}

export function ManageView({ 
  domains, 
  strategicPillars, 
  themes, 
  workspaceType,
  onDomainDelete, 
  onPillarDelete, 
  onThemeDelete,
  onDomainUpdate,
  onPillarUpdate,
  onThemeUpdate
}: ManageViewProps) {
  const terminology = getWorkspaceTerminology(workspaceType);
  
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [editingPillar, setEditingPillar] = useState<StrategicPillar | null>(null);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Settings className="w-5 h-5" />
        Manage Items
      </h2>

      {/* Domains Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="w-5 h-5 text-primary" />
            {terminology.domain.plural}
            <Badge variant="outline">{domains.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {domains.length === 0 ? (
            <p className="text-muted-foreground">No {terminology.domain.plural.toLowerCase()} created yet.</p>
          ) : (
            <div className="space-y-3">
              {domains.map((domain) => (
                <div 
                  key={domain.id} 
                  className="flex items-center justify-between p-3 border rounded-lg"
                  style={{
                    borderLeftWidth: '4px',
                    borderLeftColor: domain.color
                  }}
                >
                  <div>
                    <h4 className="font-medium">{domain.title}</h4>
                    <p className="text-sm text-muted-foreground">{domain.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setEditingDomain(domain)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onDomainDelete?.(domain.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Strategic Pillars Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-blue-600" />
            {terminology.pillar.plural}
            <Badge variant="outline">{strategicPillars.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {strategicPillars.length === 0 ? (
            <p className="text-muted-foreground">No {terminology.pillar.plural.toLowerCase()} created yet.</p>
          ) : (
            <div className="space-y-3">
              {strategicPillars.map((pillar) => (
                <div 
                  key={pillar.id} 
                  className="flex items-center justify-between p-3 border rounded-lg"
                  style={{
                    borderLeftWidth: '4px',
                    borderLeftColor: pillar.color
                  }}
                >
                  <div>
                    <h4 className="font-medium">{pillar.title}</h4>
                    <p className="text-sm text-muted-foreground">{pillar.description}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {pillar.targetTimeFrame}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {pillar.domainIds.length} {terminology.domain.plural.toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setEditingPillar(pillar)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onPillarDelete?.(pillar.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Themes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="w-5 h-5 text-green-600" />
            {terminology.theme.plural}
            <Badge variant="outline">{themes.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {themes.length === 0 ? (
            <p className="text-muted-foreground">No {terminology.theme.plural.toLowerCase()} created yet.</p>
          ) : (
            <div className="space-y-3">
              {themes.map((theme) => (
                <div 
                  key={theme.id} 
                  className="flex items-center justify-between p-3 border rounded-lg"
                  style={{
                    borderLeftWidth: '4px',
                    borderLeftColor: theme.color
                  }}
                >
                  <div>
                    <h4 className="font-medium">{theme.title}</h4>
                    <p className="text-sm text-muted-foreground">{theme.description}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {theme.strategicPillarIds.length} {terminology.pillar.plural.toLowerCase()}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setEditingTheme(theme)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onThemeDelete?.(theme.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialogs */}
      <EditDomainDialog
        domain={editingDomain}
        open={!!editingDomain}
        onOpenChange={(open) => !open && setEditingDomain(null)}
        onDomainUpdate={(id, updates) => {
          onDomainUpdate?.(id, updates);
          setEditingDomain(null);
        }}
      />

      <EditPillarDialog
        pillar={editingPillar}
        domains={domains}
        open={!!editingPillar}
        onOpenChange={(open) => !open && setEditingPillar(null)}
        onPillarUpdate={(id, updates) => {
          onPillarUpdate?.(id, updates);
          setEditingPillar(null);
        }}
      />

      <EditThemeDialog
        theme={editingTheme}
        strategicPillars={strategicPillars}
        open={!!editingTheme}
        onOpenChange={(open) => !open && setEditingTheme(null)}
        onThemeUpdate={(id, updates) => {
          onThemeUpdate?.(id, updates);
          setEditingTheme(null);
        }}
      />
    </div>
  );
}