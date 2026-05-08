"use client";

import { useState, useEffect, Fragment, useMemo } from "react";
import { useScopeStore } from "@/lib/store";
import { StrategyLevel, TierLevel, ComplexityLevel, STRATEGY_CONFIG } from "@/lib/constants";
import { generateScopeBrief, generateExecutionScript, downloadFile } from "@/lib/exporter";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Download, Terminal, Info, Zap, ChevronRight, Copy, Check, Target, Activity, Cpu, Coins, PiggyBank, Scale, Sparkles } from "lucide-react";

export default function EstimationBoard() {
  const { 
    projectName,
    projectDescription,
    projectType,
    tasks, 
    models, 
    fetchModels, 
    selectedStrategy, 
    setSelectedStrategy, 
    getEstimations, 
    providerFilter, 
    setProviderFilter, 
    userPlan, 
    setUserPlan, 
    addTask, 
    removeTask 
  } = useScopeStore();

  const handleDownloadBrief = () => {
    const activeEstimate = getEstimations()[selectedStrategy];
    const brief = generateScopeBrief(projectName, projectDescription, activeEstimate, models);
    const filename = `${projectName.toLowerCase().replace(/\s+/g, '-') || 'scope'}-brief.md`;
    downloadFile(filename, brief);
  };

  const handleDownloadScript = () => {
    const activeEstimate = getEstimations()[selectedStrategy];
    const script = generateExecutionScript(projectName, projectDescription, activeEstimate, models);
    const filename = `execute-${projectName.toLowerCase().replace(/\s+/g, '-') || 'scope'}.sh`;
    downloadFile(filename, script);
  };

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const [taskName, setTaskName] = useState("");
  const [taskComplexity, setTaskComplexity] = useState<ComplexityLevel | ''>('');
  
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const toggleTask = (id: string) => {
    const newSet = new Set(expandedTasks);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedTasks(newSet);
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    const name = taskName.toLowerCase();
    if (!name) {
      setTaskComplexity('');
      return;
    }
    
    if (name.includes('architecture') || name.includes('agent') || name.includes('refactor') || name.includes('planning') || name.includes('complex')) {
      setTaskComplexity('complex');
    } else if (name.includes('api') || name.includes('state') || name.includes('database') || name.includes('integration') || name.includes('logic')) {
      setTaskComplexity('medium');
    } else {
      setTaskComplexity('simple');
    }
  }, [taskName]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;
    
    addTask({
      id: Math.random().toString(36).substring(7),
      name: taskName,
      complexity: taskComplexity || 'simple'
    });
    setTaskName("");
    setTaskComplexity('');
  };

  const suggestedStrategy = useMemo(() => {
    const text = (projectName + " " + projectDescription).toLowerCase();
    if (text.match(/(enterprise|quality|secure|scale|critical|reliable|mission|best|perfect|accurate|production)/)) return 'quality';
    if (text.match(/(cheap|startup|mvp|cost|budget|fast|prototype|hack|quick|personal|test)/)) return 'cost';
    if (projectType === 'Backend API' && tasks.some(t => t.complexity === 'complex')) return 'quality';
    if (projectType === 'Scripting/CLI' || projectType === 'Landing Page') return 'cost';
    return 'balanced';
  }, [projectName, projectDescription, projectType, tasks]);

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] border border-dashed border-border rounded-lg bg-secondary/50 p-10 text-center">
        <h3 className="text-[14px] font-medium text-foreground mb-1">No tasks generated yet</h3>
        <p className="text-[13px] text-muted-foreground">Describe your project and generate a scope to get started.</p>
      </div>
    );
  }

  const estimations = getEstimations();

  const ComplexityVisual = ({ level }: { level: ComplexityLevel }) => {
    const config = {
      simple: { label: 'Low', color: 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
      medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
      complex: { label: 'High', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400' }
    }[level];
    
    return (
      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const MetricBadge = ({ label, value }: { label: string, value: string | number }) => (
    <div className="flex flex-col">
      <span className="text-[12px] text-muted-foreground mb-0.5">{label}</span>
      <span className="text-[14px] font-medium text-foreground">{value}</span>
    </div>
  );

  const strategies: StrategyLevel[] = ['cost', 'balanced', 'quality'];
  const strategyIndex = strategies.indexOf(selectedStrategy);

  const activeEstimate = estimations[selectedStrategy];

  return (
    <div className="space-y-6 animate-wipe-blur pt-4">
      {/* Header: Project Posture & Global Settings */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Optimization Engine</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">Rethink your architecture by model capability.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-medium text-muted-foreground">Usage Plan</span>
          <div className="flex bg-muted p-0.5 rounded-md border border-border/50">
            {(['free', 'pro', 'api'] as const).map(p => (
              <button
                key={p}
                onClick={() => setUserPlan(p)}
                className={`px-3 py-1 text-[12px] font-medium rounded-[4px] transition-all capitalize ${
                  userPlan === p 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 1. Optimization Strategies Slider */}
      <Card className="shadow-none border-border bg-card py-0">
        <CardContent className="p-6">
          <div className="space-y-8">
            <div>
              <div className="mb-6 flex justify-between items-center">
                <h3 className="text-[14px] font-semibold text-foreground">Optimization Strategy</h3>
                <span className="text-[12px] text-muted-foreground capitalize">{selectedStrategy} Mode</span>
              </div>
              <Slider 
                value={[strategyIndex]}
                max={2}
                step={1}
                onValueChange={(val) => setSelectedStrategy(strategies[val as number])}
                className="w-full cursor-pointer"
              />
              <div className="flex flex-wrap justify-between text-[12px] font-medium text-muted-foreground mt-4 relative gap-2">
                <div className="flex-1 flex justify-start min-w-0">
                  <button onClick={() => setSelectedStrategy('cost')} className={`transition-all duration-200 cursor-pointer px-2 md:px-3 py-1.5 -ml-2 md:-ml-3 rounded-md flex items-center gap-1 md:gap-1.5 active:scale-95 text-[11px] md:text-[12px] ${selectedStrategy === 'cost' ? 'text-foreground bg-muted' : 'hover:text-foreground hover:bg-muted/50'}`}>
                    <PiggyBank className="w-3.5 h-3.5 shrink-0" /> Cost
                    {suggestedStrategy === 'cost' && <span className="ml-1 text-[9px] font-semibold tracking-wider uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded hidden md:inline">Suggested</span>}
                  </button>
                </div>
                <div className="flex-1 flex justify-center min-w-0">
                  <button onClick={() => setSelectedStrategy('balanced')} className={`transition-all duration-200 cursor-pointer px-2 md:px-3 py-1.5 rounded-md flex items-center gap-1 md:gap-1.5 active:scale-95 text-[11px] md:text-[12px] ${selectedStrategy === 'balanced' ? 'text-foreground bg-muted' : 'hover:text-foreground hover:bg-muted/50'}`}>
                    <Scale className="w-3.5 h-3.5 shrink-0" /> Balanced
                    {suggestedStrategy === 'balanced' && <span className="ml-1 text-[9px] font-semibold tracking-wider uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded hidden md:inline">Suggested</span>}
                  </button>
                </div>
                <div className="flex-1 flex justify-end min-w-0">
                  <button onClick={() => setSelectedStrategy('quality')} className={`transition-all duration-200 cursor-pointer px-2 md:px-3 py-1.5 -mr-2 md:-mr-3 rounded-md flex items-center gap-1 md:gap-1.5 active:scale-95 text-[11px] md:text-[12px] ${selectedStrategy === 'quality' ? 'text-foreground bg-muted' : 'hover:text-foreground hover:bg-muted/50'}`}>
                    <Sparkles className="w-3.5 h-3.5 shrink-0" /> Quality
                    {suggestedStrategy === 'quality' && <span className="ml-1 text-[9px] font-semibold tracking-wider uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded hidden md:inline">Suggested</span>}
                  </button>
                </div>
              </div>
            </div>

            {/* Selected Strategy Metrics */}
            <div className="pt-6 border-t border-border flex flex-col md:flex-row gap-8 justify-between items-start md:items-end">
               <div>
                 <span className="text-[12px] text-muted-foreground mb-1 flex items-center gap-1.5"><Coins className="w-3.5 h-3.5" /> Estimated Cost</span>
                 <div className="text-3xl font-semibold tracking-tight text-foreground">${activeEstimate.totalCost.toFixed(2)}</div>
               </div>
               <div className="flex gap-8">
                 <MetricBadge 
                    label="Confidence" 
                    value={`${Math.round(activeEstimate.avgConfidence)}%`} 
                  />
                  <MetricBadge 
                    label="Velocity" 
                    value={activeEstimate.avgLatency < 2 ? "High" : activeEstimate.avgLatency < 4 ? "Medium" : "Low"} 
                  />
               </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Task Breakdown */}
      <Card className="shadow-none border-border bg-card overflow-hidden py-0">
        <div className="border-b border-border py-4 px-4 md:px-6 bg-muted/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-[14px] font-semibold text-foreground">
              Task Breakdown
            </h3>
            <span className="text-muted-foreground text-xs">•</span>
            <span className="text-[13px] text-muted-foreground">Est. Time: {activeEstimate.timeEstimates[userPlan]}</span>
          </div>
          
          <div className="flex bg-muted p-0.5 rounded-md border border-border/50">
            {(['All', 'Anthropic', 'OpenAI'] as const).map(p => (
              <button
                key={p}
                onClick={() => setProviderFilter(p)}
                className={`px-3 py-1 text-[12px] font-medium rounded-[4px] transition-all ${
                  providerFilter === p 
                    ? 'bg-background shadow-sm text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {p === 'OpenAI' ? 'ChatGPT' : p === 'Anthropic' ? 'Claude' : 'All Providers'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-0 overflow-x-auto">
          <Table className="table-fixed w-full min-w-[600px]">
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="w-[40%] text-[12px] font-medium text-muted-foreground h-12 pl-4 md:pl-6">
                  <div className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Task</div>
                </TableHead>
                <TableHead className="w-[15%] text-[12px] font-medium text-muted-foreground h-12">
                  <div className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Complexity</div>
                </TableHead>
                <TableHead className="w-[25%] text-[12px] font-medium text-muted-foreground h-12">
                  <div className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> Routing Model</div>
                </TableHead>
                <TableHead className="w-[15%] text-right text-[12px] font-medium text-muted-foreground h-12">
                  <div className="flex items-center justify-end gap-1.5"><Coins className="w-3.5 h-3.5" /> Cost</div>
                </TableHead>
                <TableHead className="w-[5%] h-12 pr-4 md:pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeEstimate.tasks.map((data) => {
                const promptText = `You are an expert ${projectType} developer. Implement the ${data.task.name.toLowerCase()}. Ensure the code is production-ready, typed, and handles edge cases appropriately. Return only the implementation code.`;
                const isExpanded = expandedTasks.has(data.task.id);
                
                return (
                <Fragment key={data.task.id}>
                  <TableRow className={`group hover:bg-muted/30 transition-colors ${isExpanded ? 'border-b-0' : 'border-b border-border'}`}>
                    <TableCell className="py-3 pl-4 md:pl-6">
                      <button onClick={() => toggleTask(data.task.id)} className="text-[13px] font-medium text-foreground cursor-pointer flex items-center gap-1.5 select-none hover:text-primary transition-colors text-left w-full">
                        <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                        <span className="truncate pr-4">{data.task.name}</span>
                      </button>
                    </TableCell>
                    <TableCell className="py-3">
                      <ComplexityVisual level={data.task.complexity} />
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] text-foreground">{models[data.appliedModel]?.name || data.appliedModel}</span>
                          {data.isOptimal && (
                            <span className="text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded-sm">
                              Optimal
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 font-mono text-[13px] text-foreground text-right">
                      ${data.cost.toFixed(2)}
                    </TableCell>
                    <TableCell className="py-3 pr-4 md:pr-6 text-right">
                      <button 
                        onClick={() => removeTask(data.task.id)}
                        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-muted"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow className="bg-muted/20 hover:bg-muted/20 border-b border-border">
                      <TableCell colSpan={5} className="py-4 px-4 md:px-6">
                        <div className="bg-background p-4 rounded-md border border-border text-[13px] text-muted-foreground font-mono leading-relaxed relative shadow-sm group/prompt">
                          <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 rounded-l-md"></div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-foreground font-medium font-sans">Prompt Preview:</span>
                            <button 
                              onClick={() => handleCopy(data.task.id, promptText)}
                              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors p-1 px-2 rounded hover:bg-muted"
                            >
                              {copiedId === data.task.id ? (
                                <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</>
                              ) : (
                                <><Copy className="w-3.5 h-3.5" /> Copy</>
                              )}
                            </button>
                          </div>
                          <div className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap break-words">
                            {promptText}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              )})}
            </TableBody>
          </Table>

          {/* Add Task Form */}
          <div className="py-4 px-4 md:px-6 bg-muted/10 border-t border-border">
            <form onSubmit={handleAddTask} className="flex flex-col md:flex-row gap-3 items-center">
              <div className="flex-grow w-full">
                <Input 
                  type="text" 
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="h-8 text-[13px] shadow-none bg-background"
                  placeholder="Add a new task..."
                />
              </div>
              <div className="w-full md:w-32">
                <Select value={taskComplexity} onValueChange={(val) => setTaskComplexity(val as ComplexityLevel)}>
                  <SelectTrigger className="h-8 text-[13px] shadow-none bg-background">
                    <SelectValue placeholder="Complexity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="complex">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="submit"
                disabled={!taskName.trim()}
                variant="secondary"
                className="w-full md:w-auto h-8 px-4 text-[12px] font-medium shadow-none"
              >
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
            </form>
          </div>
        </div>
      </Card>

      {/* 3. Strategy Insights & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 shadow-sm border-border py-0">
          <CardContent className="p-5 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5"><Info className="w-4 h-4 text-muted-foreground" /></div>
              <div>
                <h4 className="text-[13px] font-medium text-foreground">Confidence</h4>
                <p className="text-[13px] text-muted-foreground leading-relaxed mt-0.5">
                  {Math.round(activeEstimate.avgConfidence)}% reasoning confidence. 
                  {activeEstimate.avgConfidence > 80 
                    ? " Robust for autonomous agents." 
                    : " High-complexity tasks may require manual review."}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="mt-0.5"><Zap className="w-4 h-4 text-muted-foreground" /></div>
              <div>
                <h4 className="text-[13px] font-medium text-foreground">Velocity</h4>
                <p className="text-[13px] text-muted-foreground leading-relaxed mt-0.5">
                  {activeEstimate.avgLatency.toFixed(1)}/5.0 latency. 
                  {activeEstimate.avgLatency < 2.5 
                    ? " Pipeline will feel near-instant." 
                    : " Expect some processing delays in agentic loops."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border bg-muted/30 flex flex-col justify-center p-5">
          <div className="space-y-2">
            <Button 
              onClick={handleDownloadScript}
              className="w-full h-8 text-[12px] font-medium shadow-none"
            >
              <Terminal className="w-3 h-3 mr-2" /> Compile Script
            </Button>
            <Button 
              variant="outline"
              onClick={handleDownloadBrief}
              className="w-full h-8 text-[12px] font-medium shadow-none bg-background"
            >
              <Download className="w-3 h-3 mr-2" /> Download Brief
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
