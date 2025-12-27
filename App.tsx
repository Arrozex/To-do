import React, { useState, useEffect } from 'react';
import { Task, ViewMode, AIGeneratedTask } from './types';
import { TaskItem } from './components/TaskItem';
import { CalendarView } from './components/CalendarView';
import { StatsView } from './components/StatsView';
import { Button } from './components/Button';
import { suggestBreakdown } from './services/geminiService';
import { 
  Plus, 
  List, 
  Calendar as CalendarIcon, 
  PieChart, 
  X, 
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Cpu,
  Power,
  Layers
} from 'lucide-react';
import { format, addHours, endOfDay } from 'date-fns';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('droidplan_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.LIST);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Form State
  const [formContent, setFormContent] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formExecStart, setFormExecStart] = useState('');
  const [formExecEnd, setFormExecEnd] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AIGeneratedTask[]>([]);
  const [showAiInput, setShowAiInput] = useState(false);

  useEffect(() => {
    localStorage.setItem('droidplan_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const openModal = (task?: Task, initialDate?: Date) => {
    setAiSuggestions([]);
    setShowAiInput(false);
    setErrorMessage(null);

    if (task) {
      // Edit Mode
      setEditingTaskId(task.id);
      setFormContent(task.content);
      setFormDeadline(task.deadline);
      setFormExecStart(task.executionStart);
      setFormExecEnd(task.executionEnd);
    } else {
      // Add Mode
      setEditingTaskId(null);
      const baseDate = initialDate || new Date();
      const nowStr = format(baseDate, "yyyy-MM-dd'T'HH:mm");
      const oneHourLater = format(addHours(baseDate, 1), "yyyy-MM-dd'T'HH:mm");
      
      setFormContent('');
      setFormExecStart(nowStr);
      setFormExecEnd(oneHourLater);
      setFormDeadline(oneHourLater); 
    }
    
    setIsModalOpen(true);
  };

  const handleSaveTask = () => {
    setErrorMessage(null);

    if (!formContent || !formDeadline || !formExecStart || !formExecEnd) {
      setErrorMessage("COMMAND ERROR: EMPTY FIELDS DETECTED");
      return;
    }

    const start = new Date(formExecStart);
    const end = new Date(formExecEnd);
    const deadline = new Date(formDeadline);

    if (start >= end) {
      setErrorMessage("TIME PARADOX: START MUST PRECEDE END");
      return;
    }

    if (end > deadline) {
      setErrorMessage("CRITICAL: EXECUTION OVERRUNS DEADLINE");
      return;
    }

    if (editingTaskId) {
      setTasks(prev => prev.map(t => 
        t.id === editingTaskId 
        ? {
            ...t,
            content: formContent,
            deadline: formDeadline,
            executionStart: formExecStart,
            executionEnd: formExecEnd
          }
        : t
      ));
    } else {
      const newTask: Task = {
        id: crypto.randomUUID(),
        content: formContent,
        deadline: formDeadline,
        executionStart: formExecStart,
        executionEnd: formExecEnd,
        isCompleted: false,
        createdAt: Date.now()
      };
      setTasks(prev => [...prev, newTask]);
    }

    setIsModalOpen(false);
  };

  const handleAiBreakdown = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    const suggestions = await suggestBreakdown(aiPrompt);
    setAiSuggestions(suggestions);
    setIsAiLoading(false);
  };

  const acceptAiSuggestion = (suggestion: AIGeneratedTask) => {
    const start = new Date(formExecStart || new Date());
    const end = addHours(start, suggestion.estimatedDurationHours);
    
    const newTask: Task = {
      id: crypto.randomUUID(),
      content: suggestion.content,
      deadline: formDeadline, 
      executionStart: format(start, "yyyy-MM-dd'T'HH:mm"),
      executionEnd: format(end, "yyyy-MM-dd'T'HH:mm"),
      isCompleted: false,
      createdAt: Date.now()
    };
    
    setTasks(prev => [...prev, newTask]);
    setAiSuggestions(prev => prev.filter(p => p.content !== suggestion.content));
  };

  const filteredTasks = viewMode === ViewMode.CALENDAR 
    ? tasks.filter(t => {
        // Native implementation of startOfDay
        const dayStart = new Date(selectedDate);
        dayStart.setHours(0, 0, 0, 0);

        const dayEnd = endOfDay(selectedDate);
        const tStart = new Date(t.executionStart);
        const tEnd = new Date(t.executionEnd);
        return tStart <= dayEnd && tEnd >= dayStart;
      })
    : tasks; 

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const dateA = new Date(a.executionStart).getTime();
    const dateB = new Date(b.executionStart).getTime();
    return dateA - dateB;
  });

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto relative overflow-hidden bg-black/50 text-slate-200 font-sans scanline">
        {/* Dark Overlay for background image readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80 pointer-events-none z-0" />
        
        {/* HUD Header */}
        <div className="relative z-10 px-6 py-4 flex justify-between items-end border-b border-cyan-900/50 bg-black/60 backdrop-blur-md">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Cpu size={16} className="text-cyan-400" />
                    <h1 className="text-2xl font-tech font-bold text-white tracking-wider drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">
                        DROID<span className="text-cyan-400">PLAN</span>
                    </h1>
                </div>
                <p className="text-[10px] text-cyan-600 font-mono tracking-[0.2em] uppercase">System Online // {format(new Date(), 'HH:mm:ss')}</p>
            </div>
            
            <div className="flex flex-col items-end">
                 <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Mission Log</div>
                 <div className="bg-cyan-950/50 border border-cyan-800 text-cyan-300 px-3 py-1 text-xs font-mono">
                    PENDING: {tasks.filter(t => !t.isCompleted).length}
                 </div>
            </div>
        </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar p-4 pb-28">
        
        {viewMode === ViewMode.STATS && <StatsView tasks={tasks} />}
        
        {viewMode === ViewMode.CALENDAR && (
          <CalendarView 
            tasks={tasks} 
            selectedDate={selectedDate} 
            onDateSelect={setSelectedDate} 
          />
        )}

        {/* Task List Header */}
        {viewMode === ViewMode.CALENDAR && (
           <div className="mb-3 text-xs font-bold font-tech text-cyan-500/80 pl-1 uppercase tracking-widest flex items-center gap-2">
             <Layers size={12} />
             Operations for {format(selectedDate, 'MMM d, yyyy')}
           </div>
        )}

        {sortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 opacity-40">
            <div className="w-20 h-20 border-2 border-dashed border-cyan-700 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Power size={32} className="text-cyan-700" />
            </div>
            <p className="text-cyan-700 font-tech tracking-widest">NO ACTIVE OPERATIONS</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onToggle={toggleTask} 
                onDelete={deleteTask}
                onEdit={(t) => openModal(t)}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB - Add Task */}
      <div className="absolute bottom-24 right-5 z-20">
          <button 
            onClick={() => openModal(undefined, viewMode === ViewMode.CALENDAR ? selectedDate : undefined)}
            className="w-16 h-16 bg-cyan-600/20 backdrop-blur-md border border-cyan-400 flex items-center justify-center text-cyan-100 hover:bg-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:border-cyan-300 transition-all clip-path-polygon group active:scale-95"
            style={{ clipPath: "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)" }}
          >
            <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
      </div>

      {/* Bottom Nav - Dock Style */}
      <div className="relative z-10 bg-black/80 border-t border-white/10 p-2 pb-6 backdrop-blur-xl flex justify-around items-center">
        {[
          { mode: ViewMode.LIST, icon: List, label: 'MISSIONS' },
          { mode: ViewMode.CALENDAR, icon: CalendarIcon, label: 'TIMELINE' },
          { mode: ViewMode.STATS, icon: PieChart, label: 'ANALYTICS' }
        ].map(item => (
            <button 
            key={item.mode}
            onClick={() => setViewMode(item.mode)}
            className={`p-2 rounded flex flex-col items-center gap-1 transition-all duration-300 w-20 group relative overflow-hidden`}
            >
            {/* Active Background Glow */}
            {viewMode === item.mode && (
                <div className="absolute inset-0 bg-cyan-500/10 skew-x-12"></div>
            )}
            
            <item.icon size={20} className={`z-10 relative ${viewMode === item.mode ? 'text-cyan-400 drop-shadow-[0_0_5px_cyan]' : 'text-slate-500 group-hover:text-slate-300'}`} />
            <span className={`z-10 relative text-[9px] font-bold font-tech tracking-widest ${viewMode === item.mode ? 'text-cyan-200' : 'text-slate-600'}`}>
                {item.label}
            </span>
            
            {/* Active Indicator Line */}
            {viewMode === item.mode && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_8px_cyan]"></div>
            )}
            </button>
        ))}
      </div>

      {/* Add/Edit Task Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="holo-card w-full max-w-md p-6 animate-in slide-in-from-bottom duration-300 border-t border-cyan-500/50 sm:border sm:rounded-lg bg-black/90">
            {/* Decorative Corner Lines */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/50 -translate-x-1 -translate-y-1"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/50 translate-x-1 -translate-y-1"></div>
            
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-2">
              <div className="flex items-center gap-2 text-cyan-400">
                  <Cpu size={18} />
                  <h2 className="text-lg font-tech font-bold tracking-widest uppercase text-white shadow-cyan-500/50">
                    {editingTaskId ? 'Reconfigure Protocol' : 'Initialize Mission'}
                  </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-red-500 hover:rotate-90 transition-all">
                <X size={24} />
              </button>
            </div>

            {/* Error Message Console */}
            {errorMessage && (
              <div className="mb-4 bg-red-950/40 border-l-2 border-red-500 text-red-300 text-xs font-mono px-4 py-3 flex items-start gap-2 animate-pulse">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* AI Assistant Interface */}
            {!editingTaskId && (
              <div className="mb-6">
                 {!showAiInput ? (
                    <button 
                      onClick={() => setShowAiInput(true)}
                      className="w-full flex items-center justify-between gap-2 text-xs font-bold text-purple-300 bg-purple-900/20 border border-purple-500/30 hover:border-purple-400 hover:bg-purple-900/30 px-4 py-3 transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-purple-400 group-hover:animate-spin" />
                        <span className="font-tech tracking-wider">TACTICAL AI ASSIST</span>
                      </div>
                      <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </button>
                 ) : (
                   <div className="bg-purple-900/10 border border-purple-500/30 p-3 space-y-3 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
                      <label className="text-[10px] font-bold text-purple-400 font-tech uppercase tracking-widest">Target Objective</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder="Identify mission parameters..."
                          className="flex-1 bg-black/50 border border-purple-800 text-purple-100 text-sm px-3 py-2 focus:outline-none focus:border-purple-500 font-mono"
                        />
                        <Button variant="primary" onClick={handleAiBreakdown} isLoading={isAiLoading} className="!bg-purple-600/20 !border-purple-500 !text-purple-200 !py-2 !px-3">
                           <ArrowRight size={16} />
                        </Button>
                      </div>
                      {aiSuggestions.length > 0 && (
                        <div className="max-h-40 overflow-y-auto space-y-2 mt-2 pr-1 custom-scrollbar">
                          {aiSuggestions.map((s, i) => (
                            <div key={i} className="flex justify-between items-center bg-black/40 p-2 border border-purple-500/20 hover:border-purple-500/60 transition-colors">
                              <div className="text-xs">
                                <p className="font-bold text-purple-200">{s.content}</p>
                                <p className="text-purple-400 font-mono text-[10px]">{s.estimatedDurationHours}H • {s.priority.toUpperCase()}</p>
                              </div>
                              <button onClick={() => acceptAiSuggestion(s)} className="text-purple-400 hover:text-white hover:bg-purple-600 p-1 rounded-sm transition-colors">
                                <Plus size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                   </div>
                 )}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-cyan-600 font-tech uppercase tracking-widest mb-1">Mission Parameter</label>
                <input 
                  type="text" 
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Enter objective..." 
                  className="w-full bg-slate-900/50 border border-slate-700 text-white placeholder-slate-600 rounded-none px-4 py-3 focus:outline-none focus:border-cyan-500 focus:bg-slate-900 focus:shadow-[0_0_10px_rgba(6,182,212,0.2)] transition-all font-mono"
                />
              </div>

              {/* Execution Time Block */}
              <div className="bg-cyan-950/10 p-4 border border-cyan-900/50">
                <label className="block text-[10px] font-bold text-cyan-500 font-tech uppercase tracking-widest mb-3 flex items-center gap-2">
                  <CalendarIcon size={12} /> Execution Window
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">T-Minus Start</label>
                    <input 
                      type="datetime-local" 
                      value={formExecStart}
                      onChange={(e) => setFormExecStart(e.target.value)}
                      className="w-full bg-black/60 border border-slate-700 text-cyan-100 rounded-none px-2 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">T-Minus End</label>
                    <input 
                      type="datetime-local" 
                      value={formExecEnd}
                      onChange={(e) => setFormExecEnd(e.target.value)}
                      className="w-full bg-black/60 border border-slate-700 text-cyan-100 rounded-none px-2 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-red-400 font-tech uppercase tracking-widest mb-1">Critical Timeout (Deadline)</label>
                <input 
                  type="datetime-local" 
                  value={formDeadline}
                  onChange={(e) => setFormDeadline(e.target.value)}
                  className="w-full bg-red-950/10 border border-red-900/50 text-red-200 rounded-none px-4 py-3 focus:outline-none focus:border-red-500 focus:shadow-[0_0_10px_rgba(239,68,68,0.2)] font-mono"
                />
              </div>

              <div className="pt-2">
                <Button onClick={handleSaveTask} className="w-full py-4 text-sm shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                    {editingTaskId ? 'CONFIRM PROTOCOL UPDATE' : 'INITIATE MISSION'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;