"use client";
import { useState, useEffect, useRef } from "react";
import { X, Terminal as TerminalIcon } from "lucide-react";
// Import the component we want to render dynamically
import AgentGrid from "./droids/AgentGrid"; 

interface TerminalProps {
  type: string;
  onClose: () => void;
  onSend: () => void;
}

// Define type for log entries: can be simple text or a complex component
type LogEntry =
  | string
  | {
      type: "AgentGrid";
      componentProps: { mode?: "safe" | "caution" | "critical"; message?: string; actions?: string[] };
    };

const isAgentGridMode = (value: unknown): value is "safe" | "caution" | "critical" =>
  value === "safe" || value === "caution" || value === "critical";

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

export default function TerminalModal({ type, onClose, onSend }: TerminalProps) {
  // State updated to hold text OR components
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const focusAfterLoadRef = useRef(false);
  const submittingRef = useRef(false);

  // Auto-scroll to bottom on new logs
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [logs]);

  useEffect(() => {
    if (loading || !focusAfterLoadRef.current) return;
    focusAfterLoadRef.current = false;
    inputRef.current?.focus();
  }, [loading]);

  // Initial Boot Sequence
  useEffect(() => {
    setLogs([
      `> Initializing ${type} Protocol...`,
      "> Secure Uplink: ESTABLISHED.",
      "> AI Core: TAMBO_SDK [ONLINE]",
      "> Type 'status' to test Generative UI_",
    ]);
  }, [type]);

  const isAgentGridLogEntry = (entry: LogEntry): entry is Extract<LogEntry, { type: "AgentGrid" }> =>
    typeof entry !== "string" && entry.type === "AgentGrid";

  const submitCommand = async (rawInput?: string) => {
    if (loading || submittingRef.current) return;

    const command = (typeof rawInput === "string" ? rawInput : input).trim();
    if (!command) return;

    submittingRef.current = true;
    try {
      onSend();

      // Add user command to logs
      setLogs((prev) => [...prev, `user@nova:~$ ${command}`]);
      setInput("");

      // Handle Local Commands
      if (command.toLowerCase() === "clear") {
        setLogs([]);
        return;
      }
      if (command.toLowerCase() === "exit") {
        onClose();
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: command }),
        });
        
        const data = await res.json();
        
        // Add AI Text Response
        if (data.reply) {
           setLogs((prev) => [...prev, `> NOVA: ${data.reply}`]);
        }

        // GENERATIVE UI LOGIC:
        // If the backend signals a component, render it inside the terminal
        if (data.component === "AgentGrid") {
          const rawMode = data?.componentProps?.mode;
          const mode = isAgentGridMode(rawMode) ? rawMode : undefined;
          const message = typeof data?.componentProps?.message === "string" ? data.componentProps.message : undefined;
          const actions = isStringArray(data?.componentProps?.actions) ? data.componentProps.actions : undefined;

          setLogs((prev) => {
            const next = [...prev];
            let index = -1;
            for (let i = next.length - 1; i >= 0; i--) {
              if (isAgentGridLogEntry(next[i])) {
                index = i;
                break;
              }
            }
            const updated: LogEntry = {
              type: "AgentGrid",
              componentProps: { mode, message, actions },
            };

            if (index === -1) {
              next.push(updated);
              return next;
            }

            next[index] = updated;
            return next;
          });
        }
      } catch {
        setLogs((prev) => [...prev, `> ERROR: Uplink failed. Check network connection.`]);
      } finally {
        setLoading(false);
      }
    } finally {
      submittingRef.current = false;
    }
  };

  // Command Handler
  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return;
    if (loading || submittingRef.current) return;
    if (!input.trim()) return;

    void submitCommand(input);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#0a0a0a] border border-gray-700/50 rounded-lg shadow-2xl overflow-hidden flex flex-col h-[600px]">
        
        {/* Header Bar */}
        <div className="bg-gray-900/80 px-4 py-3 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${type === 'Security' ? 'bg-red-500' : 'bg-blue-500'} animate-pulse`} />
            <span className="text-xs font-mono text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <TerminalIcon size={14} /> {type}_CONSOLE // TAMBO_LINKED
            </span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-red-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Terminal Output Area */}
        <div className="flex-1 p-6 font-mono text-sm overflow-y-auto space-y-3 bg-black/50" onClick={() => document.getElementById("cmd-input")?.focus()}>
          {logs.map((log, index) => (
            <div key={index} className="break-words space-y-2">
              {typeof log === 'string' ? (
                // Render Standard Text
                <div className={log.startsWith("user") ? "text-blue-400" : "text-green-400/90"}>
                  {log}
                </div>
              ) : (
                // Render Generative UI Component
                <div className="my-6 border border-green-500/30 p-4 rounded bg-green-900/5 relative animate-in zoom-in-95 duration-300">
                  <div className="absolute -top-3 left-4 bg-[#0a0a0a] px-2 text-[10px] text-green-500 uppercase tracking-widest border border-green-500/30 rounded">
                    :: GENERATIVE_UI_MODULE ::
                  </div>
                  <AgentGrid
                    mode={log.componentProps.mode}
                    message={log.componentProps.message}
                    actions={log.componentProps.actions}
                    onActionSelect={(action) => {
                      setInput(action);
                      if (loading) {
                        focusAfterLoadRef.current = true;
                        return;
                      }
                      inputRef.current?.focus();
                    }}
                  />
                </div>
              )}
            </div>
          ))}
          
          {loading && (
            <div className="text-gray-500 animate-pulse">&gt; Processing data stream...</div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-900/30 border-t border-gray-800 flex items-center gap-3">
          <span className="text-blue-500 font-bold font-mono">➜</span>
          <input 
            id="cmd-input"
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleCommand}
            disabled={loading}
            placeholder={loading ? "NOVA is thinking..." : "Enter command..."}
            className="bg-transparent border-none outline-none text-white w-full font-mono focus:ring-0 placeholder-gray-600"
            autoFocus
            autoComplete="off"
            ref={inputRef}
          />
          <button
            type="button"
            onClick={() => void submitCommand(input)}
            disabled={loading || !input.trim()}
            className="rounded border border-cyan-500/40 px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-cyan-300 transition-colors hover:bg-cyan-500/10 disabled:opacity-40"
          >
            SEND
          </button>
        </div>

      </div>
    </div>
  );
}
