import { Domain, StrategicPillar, Theme } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Target, Lightbulb, Trash2, Settings } from "lucide-react";

interface ManageViewProps {
  domains: Domain[];
  strategicPillars: StrategicPillar[];
  themes: Theme[];
  onDomainDelete?: (domainId: string) => void;
  onPillarDelete?: (pillarId: string) => void;
  onThemeDelete?: (themeId: string) => void;
}

export function ManageView({ 
  domains, 
  strategicPillars, 
  themes, 
  onDomainDelete, 
  onPillarDelete, 
  onThemeDelete 
}: ManageViewProps) {
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
            Domains
            <Badge variant="outline">{domains.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {domains.length === 0 ? (
            <p className="text-muted-foreground">No domains created yet.</p>
          ) : (
            <div className="space-y-3">
              {domains.map((domain) => (
                <div key={domain.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{domain.title}</h4>
                    <p className="text-sm text-muted-foreground">{domain.description}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onDomainDelete?.(domain.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
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
            Strategic Pillars
            <Badge variant="outline">{strategicPillars.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {strategicPillars.length === 0 ? (
            <p className="text-muted-foreground">No strategic pillars created yet.</p>
          ) : (
            <div className="space-y-3">
              {strategicPillars.map((pillar) => (
                <div key={pillar.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{pillar.title}</h4>
                    <p className="text-sm text-muted-foreground">{pillar.description}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {pillar.targetTimeFrame}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {pillar.domainIds.length} domains
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onPillarDelete?.(pillar.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
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
            Themes
            <Badge variant="outline">{themes.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {themes.length === 0 ? (
            <p className="text-muted-foreground">No themes created yet.</p>
          ) : (
            <div className="space-y-3">
              {themes.map((theme) => (
                <div key={theme.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{theme.title}</h4>
                    <p className="text-sm text-muted-foreground">{theme.description}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {theme.strategicPillarIds.length} pillars
                    </Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onThemeDelete?.(theme.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}