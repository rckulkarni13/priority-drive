import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckSquare2, Briefcase, GraduationCap, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const workspaceOptions = [
  {
    id: 'work',
    name: 'Work',
    icon: Briefcase,
    color: '#3b82f6',
    emoji: '💼',
    description: 'Manage professional tasks, projects, and career goals'
  },
  {
    id: 'school',
    name: 'School',
    icon: GraduationCap,
    color: '#8b5cf6',
    emoji: '📚',
    description: 'Track assignments, courses, study schedules, and academic goals'
  },
  {
    id: 'home',
    name: 'Home',
    icon: Home,
    color: '#10b981',
    emoji: '🏠',
    description: 'Organize personal tasks, household activities, and family planning'
  }
];

export default function Onboarding() {
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<string[]>(['work']);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const toggleWorkspace = (workspaceId: string) => {
    setSelectedWorkspaces(prev => 
      prev.includes(workspaceId)
        ? prev.filter(id => id !== workspaceId)
        : [...prev, workspaceId]
    );
  };

  const handleContinue = async () => {
    if (selectedWorkspaces.length === 0) {
      toast({
        title: "Select at least one workspace",
        description: "You need at least one workspace to get started.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create selected workspaces
      const workspacesToCreate = workspaceOptions
        .filter(ws => selectedWorkspaces.includes(ws.id))
        .map(ws => ({
          user_id: user.id,
          name: ws.name,
          type: ws.id as 'work' | 'school' | 'home',
          icon: ws.emoji,
          color: ws.color
        }));

      const { error } = await supabase
        .from('workspaces')
        .insert(workspacesToCreate);

      if (error) throw error;

      // Mark onboarding as complete
      localStorage.setItem('onboarding_completed', 'true');

      toast({
        title: "Welcome! 🎉",
        description: `Your ${selectedWorkspaces.length} workspace${selectedWorkspaces.length > 1 ? 's' : ''} ${selectedWorkspaces.length > 1 ? 'are' : 'is'} ready.`
      });

      // Redirect to main app
      navigate('/');
    } catch (error) {
      console.error('Error creating workspaces:', error);
      toast({
        title: "Error",
        description: "Failed to create workspaces. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CheckSquare2 className="w-12 h-12 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Welcome to Task Manager</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Organize your life into separate workspaces. Choose which areas you'd like to focus on:
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {workspaceOptions.map((workspace) => {
            const Icon = workspace.icon;
            const isSelected = selectedWorkspaces.includes(workspace.id);

            return (
              <Card 
                key={workspace.id}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'ring-2 ring-primary shadow-lg scale-105' 
                    : 'hover:shadow-md hover:scale-102'
                }`}
                onClick={() => toggleWorkspace(workspace.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: `${workspace.color}20` }}
                      >
                        <Icon className="w-6 h-6" style={{ color: workspace.color }} />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <span className="text-2xl">{workspace.emoji}</span>
                          {workspace.name}
                        </CardTitle>
                      </div>
                    </div>
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => toggleWorkspace(workspace.id)}
                      className="mt-1"
                    />
                  </div>
                  <CardDescription className="mt-3">
                    {workspace.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">✨ You can always add more workspaces later</p>
                <p>Selected: {selectedWorkspaces.length} workspace{selectedWorkspaces.length !== 1 ? 's' : ''}</p>
              </div>
              <Button 
                size="lg" 
                onClick={handleContinue}
                disabled={selectedWorkspaces.length === 0 || isCreating}
                className="w-full md:w-auto"
              >
                {isCreating ? 'Creating your workspaces...' : 'Continue to Task Manager'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Each workspace has its own domains, strategic pillars, themes, and tasks
        </p>
      </div>
    </div>
  );
}
