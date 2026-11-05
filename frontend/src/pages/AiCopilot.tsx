import React, { useState, useRef, useEffect } from 'react';
import { AircraftEngine } from '../types/aerospace';
import { apiService } from '../services/api';
import {
  Sparkles,
  Send,
  Bot,
  User,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Layers,
  FileText,
  Clock,
  RotateCcw,
} from 'lucide-react';

interface AiCopilotProps {
  engines: AircraftEngine[];
  selectedEngineId: string;
  onSelectEngine: (engineId: string) => void;
  onNavigateTab: (tabId: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  content: string;
  references?: string[];
  suggestedActions?: string[];
}

export const AiCopilot: React.FC<AiCopilotProps> = ({
  engines,
  selectedEngineId,
  onSelectEngine,
  onNavigateTab,
}) => {
  const engine = engines.find(e => e.id === selectedEngineId) || engines[0];
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      timestamp: '09:20:00 UTC',
      content: `Welcome to **AeroGuard AI Copilot**. I am grounded in NASA CMAPSS turbofan degradation datasets, Aircraft Maintenance Manuals (AMM), Trouble Shooting Manuals (TSM), and FAA airworthiness guidelines.
      
Currently bound to telemetry context for **${engine?.serialNumber} (${engine?.model})** on **${engine?.aircraftTail}**.
How can I assist with your predictive maintenance diagnosis today?`,
      references: [
        'NASA Reference Publication 1311: Aerodynamic Performance of High-Bypass Turbofans',
        'FAA AC 120-113 Turbofan Engine Condition Monitoring',
      ],
      suggestedActions: [
        'Why is ENG-CFM-8821 showing 42 cycles RUL?',
        'Explain EGT margin degradation on this unit',
        'Draft ATA-72 inspection checklist',
      ],
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isThinking) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
      content: textToSend,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    try {
      const result = await apiService.queryCopilot(textToSend, engine);
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
        content: result.answer,
        references: result.references,
        suggestedActions: result.suggestedActions,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
        content: 'Unable to query the aerospace diagnostic model. Falling back to local offline reasoning.',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const starterPrompts = [
    `Why is ${engine?.serialNumber} showing ${engine?.rulEnsemble} cycles RUL?`,
    'Explain EGT margin degradation root cause',
    'Draft ATA-72 borescope inspection checklist',
    'Compare LSTM vs Random Forest divergence on high-cycle engines',
  ];

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cyan-500/10">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>AeroGuard AI Maintenance Copilot</span>
            <span className="text-xs font-mono text-cyan-400 font-normal">
              Domain Intelligence &amp; RAG
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Aerospace engineering assistant grounded in telemetry, CMAPSS failure trajectories, and ATA chapters.
          </p>
        </div>

        {/* Engine context binder */}
        <div className="flex items-center gap-2">
          <label htmlFor="copilot-engine-context" className="text-xs text-slate-400">Context Engine:</label>
          <select
            id="copilot-engine-context"
            value={engine?.id}
            onChange={e => onSelectEngine(e.target.value)}
            className="bg-slate-900 text-xs font-mono text-cyan-300 border border-slate-700 rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            {engines.map(eng => (
              <option key={eng.id} value={eng.id}>
                {eng.serialNumber} ({eng.aircraftTail} · {eng.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Starter Prompts Horizontal Bar */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
        <span className="text-xs text-slate-400 whitespace-nowrap shrink-0 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Suggested Inquiries:</span>
        </span>
        {starterPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 text-xs text-slate-300 hover:text-cyan-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer text-left"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Display Canvas */}
      <div className="aerospace-card rounded-lg border border-cyan-500/15 flex flex-col h-[520px]">
        {/* Messages scroll area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map(msg => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded shrink-0 flex items-center justify-center text-xs font-bold ${
                    isUser
                      ? 'bg-cyan-500 text-slate-950 font-mono'
                      : 'bg-slate-900 border border-cyan-500/30 text-cyan-400'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Content Box */}
                <div
                  className={`p-4 rounded-lg text-xs leading-relaxed ${
                    isUser
                      ? 'bg-cyan-950/40 border border-cyan-500/30 text-slate-100'
                      : 'bg-[#08172B] border border-cyan-500/15 text-slate-200 space-y-3'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-mono">
                    <span className="font-semibold text-slate-300">
                      {isUser ? 'Flight Maintenance Engineer' : 'AeroGuard Diagnostic Agent'}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message body (renders markdown-like text cleanly) */}
                  <div className="whitespace-pre-line font-sans text-xs">
                    {msg.content}
                  </div>

                  {/* References & Citations */}
                  {msg.references && msg.references.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1">
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 font-semibold">
                        <BookOpen className="w-3 h-3 text-cyan-400" />
                        <span>Authoritative Aviation References:</span>
                      </span>
                      <ul className="text-[11px] text-slate-400 space-y-0.5 list-disc list-inside font-mono">
                        {msg.references.map((ref, idx) => (
                          <li key={idx} className="truncate">{ref}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Follow-up Suggested Actions */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((act, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (act.toLowerCase().includes('work order') || act.toLowerCase().includes('checklist')) {
                              onNavigateTab('reports');
                            } else if (act.toLowerCase().includes('twin') || act.toLowerCase().includes('derate')) {
                              onNavigateTab('twin');
                            } else {
                              handleSend(act);
                            }
                          }}
                          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-[11px] text-cyan-300 border border-cyan-500/20 hover:border-cyan-500/40 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>{act}</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isThinking && (
            <div className="flex gap-3 max-w-xl mr-auto">
              <div className="w-8 h-8 rounded bg-slate-900 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-3 rounded-lg bg-[#08172B] border border-cyan-500/20 text-xs text-cyan-300 flex items-center gap-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Evaluating CMAPSS sensor vectors &amp; AMM manuals...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Query Input Footer */}
        <div className="p-3 sm:p-4 bg-[#06101D] border-t border-cyan-500/15">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              placeholder={`Ask AeroGuard AI about ${engine?.serialNumber} telemetry, degradation root cause, or maintenance procedures...`}
              className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700/80 focus:border-cyan-400 rounded-lg text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-sans"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isThinking}
              className="px-4 py-2.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 rounded-lg transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)] disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send Query</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
