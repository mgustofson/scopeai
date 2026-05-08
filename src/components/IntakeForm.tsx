"use client";

import { useState } from "react";
import { useScopeStore } from "@/lib/store";
import { ComplexityLevel } from "@/lib/constants";
import { AppWindow, PanelTop, Smartphone, Server, Terminal } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function IntakeForm() {
  const { projectName, projectDescription, projectType, tasks, setProjectDetails, addTask, removeTask, setSelectedStrategy } = useScopeStore();
  
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateScope = async () => {
    if (!projectDescription.trim()) return;
    
    setIsGenerating(true);
    
    // Clear existing tasks
    const currentTasks = [...tasks];
    currentTasks.forEach(t => removeTask(t.id));
    
    try {
      const response = await fetch('/api/generate-scope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectType, description: projectDescription })
      });

      if (!response.ok) {
        throw new Error('Failed to generate scope');
      }

      const data = await response.json();
      const generatedTasks: {name: string, complexity: ComplexityLevel}[] = data.tasks || [];

      // Fallback if LLM failed to return array
      if (generatedTasks.length === 0) {
        generatedTasks.push({ name: "Core Business Logic", complexity: "medium" });
        generatedTasks.push({ name: "Primary User Interface", complexity: "medium" });
      }

      generatedTasks.forEach(task => {
        addTask({
          id: Math.random().toString(36).substring(7),
          ...task
        });
      });
      
      // Auto-select Strategy based on project type and complexity
      const text = (projectName + " " + projectDescription).toLowerCase();
      let suggested: "cost" | "balanced" | "quality" = 'balanced';
      
      if (text.match(/(enterprise|quality|secure|scale|critical|reliable|mission|best|perfect|accurate|production)/)) {
        suggested = 'quality';
      } else if (text.match(/(cheap|startup|mvp|cost|budget|fast|prototype|hack|quick|personal|test)/)) {
        suggested = 'cost';
      } else if (projectType === 'Backend API' && generatedTasks.some(t => t.complexity === 'complex')) {
        suggested = 'quality';
      } else if (projectType === 'Scripting/CLI' || projectType === 'Landing Page') {
        suggested = 'cost';
      }
      
      setSelectedStrategy(suggested);

    } catch (error) {
      console.error(error);
      alert("Failed to generate scope. Please make sure OPENROUTER_API_KEY is set in your .env.local file.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="shadow-sm border-border bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold tracking-tight text-foreground">Project Scope Intake</CardTitle>
        <CardDescription className="text-[13px] text-muted-foreground">Describe your project and let our AI break down the features.</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-slate-600 dark:text-slate-400">Project Name</Label>
            <Input 
              type="text" 
              value={projectName}
              onChange={(e) => setProjectDetails(e.target.value, projectDescription, projectType)}
              className="h-9 font-medium shadow-none text-[13px]"
              placeholder="e.g. Scope.ai MVP"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-slate-600 dark:text-slate-400">Project Type</Label>
            <Select 
              value={projectType}
              onValueChange={(val: any) => setProjectDetails(projectName, projectDescription, val)}
            >
              <SelectTrigger className="h-9 font-medium shadow-none text-[13px]">
                <div className="flex items-center gap-2">
                  {projectType === 'Web App' && <AppWindow className="h-4 w-4 text-muted-foreground" />}
                  {projectType === 'Landing Page' && <PanelTop className="h-4 w-4 text-muted-foreground" />}
                  {projectType === 'Mobile App' && <Smartphone className="h-4 w-4 text-muted-foreground" />}
                  {projectType === 'Backend API' && <Server className="h-4 w-4 text-muted-foreground" />}
                  {projectType === 'Scripting/CLI' && <Terminal className="h-4 w-4 text-muted-foreground" />}
                  <SelectValue placeholder="Select type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Web App">
                  <div className="flex items-center gap-2">
                    <AppWindow className="h-4 w-4 text-muted-foreground" />
                    <span>Web App</span>
                  </div>
                </SelectItem>
                <SelectItem value="Landing Page">
                  <div className="flex items-center gap-2">
                    <PanelTop className="h-4 w-4 text-muted-foreground" />
                    <span>Landing Page</span>
                  </div>
                </SelectItem>
                <SelectItem value="Mobile App">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <span>Mobile App</span>
                  </div>
                </SelectItem>
                <SelectItem value="Backend API">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <span>Backend API</span>
                  </div>
                </SelectItem>
                <SelectItem value="Scripting/CLI">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-muted-foreground" />
                    <span>Scripting/CLI</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-slate-600 dark:text-slate-400">What are you building?</Label>
            <Textarea 
              value={projectDescription}
              onChange={(e) => setProjectDetails(projectName, e.target.value, projectType)}
              className="font-medium resize-none shadow-none text-[13px] min-h-[100px]"
              placeholder="Describe the main features, users, and what makes it unique..."
            />
          </div>
          
          <Button 
            onClick={handleGenerateScope}
            disabled={!projectDescription.trim() || isGenerating}
            className="w-full h-9 text-[13px] font-medium shadow-none transition-all mt-2"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              "Generate Scope"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
