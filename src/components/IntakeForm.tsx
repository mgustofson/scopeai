"use client";

import { useState } from "react";
import { useScopeStore } from "@/lib/store";
import { ComplexityLevel } from "@/lib/constants";

export default function IntakeForm() {
  const { projectName, projectDescription, tasks, setProjectDetails, addTask, removeTask } = useScopeStore();
  
  const [isGenerating, setIsGenerating] = useState(false);

  // Still allow manual tasks for tweaking after generation
  const [taskName, setTaskName] = useState("");
  const [taskComplexity, setTaskComplexity] = useState<ComplexityLevel>("simple");

  const handleGenerateScope = () => {
    if (!projectDescription.trim()) return;
    
    setIsGenerating(true);
    
    // Clear existing tasks to simulate a fresh generation
    const currentTasks = [...tasks];
    currentTasks.forEach(t => removeTask(t.id));
    
    // Fake LLM delay
    setTimeout(() => {
      const generatedTasks = [
        { name: "Authentication & Authorization (Clerk)", complexity: "simple" as ComplexityLevel },
        { name: "Database Schema & ORM Setup", complexity: "medium" as ComplexityLevel },
        { name: "Core Business Logic & API Routes", complexity: "complex" as ComplexityLevel },
        { name: "User Dashboard UI", complexity: "medium" as ComplexityLevel },
        { name: "Payment Integration (Stripe)", complexity: "medium" as ComplexityLevel },
        { name: "Email Notifications & Webhooks", complexity: "simple" as ComplexityLevel }
      ];

      generatedTasks.forEach(task => {
        addTask({
          id: Math.random().toString(36).substring(7),
          ...task
        });
      });
      
      setIsGenerating(false);
    }, 2000); // 2 second fake delay
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;
    
    addTask({
      id: Math.random().toString(36).substring(7),
      name: taskName,
      complexity: taskComplexity
    });
    setTaskName("");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-semibold mb-2 text-slate-800">Project Scope Intake</h2>
      <p className="text-sm text-slate-500 mb-6">Describe your project and let our AI break down the features.</p>
      
      {/* AI Generation Form */}
      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
          <input 
            type="text" 
            value={projectName}
            onChange={(e) => setProjectDetails(e.target.value, projectDescription)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Scope.ai MVP"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">What are you building?</label>
          <textarea 
            value={projectDescription}
            onChange={(e) => setProjectDetails(projectName, e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the main features, users, and what makes it unique..."
            rows={4}
          />
        </div>
        
        <button 
          onClick={handleGenerateScope}
          disabled={!projectDescription.trim() || isGenerating}
          className="w-full py-3 px-4 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2 shadow-sm"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing Architecture...
            </>
          ) : (
            "✨ Generate Scope Magic"
          )}
        </button>
      </div>

      {/* Task List (Only show if tasks exist) */}
      {tasks.length > 0 && (
        <div className="pt-6 border-t border-slate-200">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-lg font-medium text-slate-800">Generated Features</h3>
              <p className="text-xs text-slate-500 mt-1">Review and tweak your AI-generated scope.</p>
            </div>
          </div>
          
          <ul className="space-y-2 mb-6">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-md border border-slate-100">
                <div>
                  <span className="font-medium text-slate-700">{task.name}</span>
                  <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 uppercase tracking-wide">
                    {task.complexity}
                  </span>
                </div>
                <button 
                  onClick={() => removeTask(task.id)}
                  className="text-slate-400 hover:text-red-500 text-sm font-medium transition-colors"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          {/* Add Manual Task Form (Keep for editing) */}
          <form onSubmit={handleAddTask} className="flex gap-2 items-end">
            <div className="flex-1">
              <input 
                type="text" 
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Missing a feature?"
              />
            </div>
            <div className="w-32">
              <select 
                value={taskComplexity}
                onChange={(e) => setTaskComplexity(e.target.value as ComplexityLevel)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              >
                <option value="simple">Simple</option>
                <option value="medium">Medium</option>
                <option value="complex">Complex</option>
              </select>
            </div>
            <button 
              type="submit"
              disabled={!taskName.trim()}
              className="px-3 py-2 bg-slate-100 text-slate-700 font-medium rounded-md hover:bg-slate-200 disabled:opacity-50 text-sm border border-slate-200"
            >
              Add
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
