'use client';

import { useState, useEffect } from 'react';

function architectPrompt(raw: string): string {
  if (!raw.trim()) return '';
  return `<context>
The user is executing a targeted codebase modification or feature addition.
</context>

<objective>
${raw.trim()}
</objective>

<constraints>
- Write clean, modular, and self-documenting code
- Maintain existing architecture patterns
- Ensure strict type safety and defensive null-checks
- Do not remove unrelated comments or structure
- Keep diffs small, isolated, and highly reviewable
</constraints>`;
}

export default function PromptArchitectPanel() {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleReadClipboard = async () => {
    try {
      const { readText } = await import('@tauri-apps/plugin-clipboard-manager');
      const text = await readText();
      if (text) {
        setPrompt(text);
        setStatus('idle');
      } else {
        setStatus('error');
        setErrorMsg('Clipboard is empty');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg('Failed to read clipboard');
    }
  };

  const handleArchitect = async () => {
    if (!prompt.trim()) return;
    try {
      const optimized = architectPrompt(prompt);
      const { writeText } = await import('@tauri-apps/plugin-clipboard-manager');
      await writeText(optimized);
      setStatus('copied');
      setTimeout(() => setStatus('idle'), 2500);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg('Failed to write to clipboard');
    }
  };

  // Keyboard shortcut to trigger architect on Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && prompt.trim()) {
        e.preventDefault();
        handleArchitect();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prompt]);

  return (
    <div className="flex flex-col w-full h-full text-[#333333]">
      {/* Top Bar: Input */}
      <div className="flex items-center gap-3 px-5 py-4 flex-1">
        <div className="text-[#db6b4e] shrink-0">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        
        <input 
          type="text"
          value={prompt}
          onChange={e => { setPrompt(e.target.value); setStatus('idle'); }}
          placeholder="Paste a raw thought to architect..."
          className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-[17px] text-[#333333] placeholder:text-[#a0a0a0] font-medium truncate"
          autoFocus
        />

        <button 
          onClick={handleArchitect}
          disabled={!prompt.trim()}
          className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-all shadow-sm ${
            !prompt.trim() ? 'bg-[#e0e0e0] text-[#a0a0a0]' :
            status === 'copied' ? 'bg-[#137333] hover:bg-[#0f5c29] text-white' : 
            'bg-[#db6b4e] hover:bg-[#c95a3a] text-white'
          }`}
        >
          {status === 'copied' ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          )}
        </button>
      </div>

      <div className="h-px bg-[#e0e0e0] w-full" />

      {/* Bottom Bar: Status/Actions */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#ebebeb]/50 h-16">
        {status === 'copied' ? (
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-[#137333]">Prompt Architected & Copied!</span>
            <span className="text-[12px] text-[#888888] ml-1">Ready to paste into Claude</span>
          </div>
        ) : (
          <div className="flex flex-col justify-center">
            <span className="text-[14px] text-[#333333] font-medium">Instantly structure agentic prompts</span>
            <span className="text-[11px] text-[#db6b4e]">{status === 'error' ? errorMsg : ''}</span>
          </div>
        )}
        
        {status !== 'copied' && (
          <button 
            onClick={handleReadClipboard}
            className="px-3 py-1.5 border border-[#d0d0d0] bg-[#ffffff]/60 hover:bg-[#ffffff] rounded-md text-[12px] font-medium text-[#555555] transition-colors shadow-sm"
          >
            Read Clipboard
          </button>
        )}
      </div>
    </div>
  );
}
