import React, { useState } from 'react';
import { Task, Subtask } from '../types';
import { Check, AlertCircle, Trash2, Edit2, Clock, Crosshair, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import { format, isPast, isSameDay } from 'date-fns';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onUpdate: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, onEdit, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubtaskContent, setNewSubtaskContent] = useState('');

  const isOverdue = !task.isCompleted && isPast(new Date(task.deadline));
  
  const start = new Date(task.executionStart);
  const end = new Date(task.executionEnd);
  const deadline = new Date(task.deadline);
  
  const isSameDayExecution = isSameDay(start, end);
  
  const timeDisplay = isSameDayExecution 
    ? `${format(start, 'HH:mm')} > ${format(end, 'HH:mm')}`
    : `${format(start, 'MM/dd HH:mm')} > ${format(end, 'MM/dd HH:mm')}`;

  const dateDisplay = format(start, 'MMM d').toUpperCase();

  // Subtask Handlers
  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newSubtaskContent.trim()) return;

    const newSubtask: Subtask = {
      id: crypto.randomUUID(),
      content: newSubtaskContent.trim(),
      isCompleted: false
    };

    const updatedTask = {
      ...task,
      subtasks: [...(task.subtasks || []), newSubtask]
    };

    onUpdate(updatedTask);
    setNewSubtaskContent('');
  };

  const toggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = (task.subtasks || []).map(st => 
      st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
    );
    onUpdate({ ...task, subtasks: updatedSubtasks });
  };

  const deleteSubtask = (subtaskId: string) => {
    const updatedSubtasks = (task.subtasks || []).filter(st => st.id !== subtaskId);
    onUpdate({ ...task, subtasks: updatedSubtasks });
  };

  const completedSubtasks = (task.subtasks || []).filter(st => st.isCompleted).length;
  const totalSubtasks = (task.subtasks || []).length;
  const progress = totalSubtasks === 0 ? 0 : (completedSubtasks / totalSubtasks) * 100;

  return (
    <div className={`
      relative mb-4 group transition-all duration-300
      ${task.isCompleted ? 'opacity-50 grayscale' : 'opacity-100'}
    `}>
      {/* Connection Line decoration */}
      <div className="absolute -left-3 top-0 bottom-0 w-0.5 bg-slate-800">
        <div className={`absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${task.isCompleted ? 'bg-slate-600' : 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]'}`} />
      </div>

      <div className={`
        holo-card p-0 rounded-none overflow-hidden
        border-l-4 ${task.isCompleted ? 'border-l-slate-600' : isOverdue ? 'border-l-red-500' : 'border-l-cyan-500'}
      `}>
        {/* Header Bar */}
        <div className="bg-black/40 px-3 py-1 flex justify-between items-center border-b border-white/5">
            <div className="flex items-center gap-2 text-[10px] font-tech tracking-widest text-cyan-400/80">
                <Crosshair size={10} />
                <span>MISSION ID: {task.id.slice(0, 4).toUpperCase()}</span>
            </div>
            <div className="text-[10px] font-bold text-slate-500">
                {isOverdue ? 'STATUS: CRITICAL' : task.isCompleted ? 'STATUS: COMPLETE' : 'STATUS: ACTIVE'}
            </div>
        </div>

        {/* Main Content (Click to Expand) */}
        <div 
            className="p-4 flex gap-4 cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
        >
            {/* Action Checkbox */}
            <button
            onClick={(e) => {
                e.stopPropagation();
                onToggle(task.id);
            }}
            className={`
                mt-1 w-8 h-8 shrink-0 border border-slate-600 bg-black/50 flex items-center justify-center transition-all hover:border-cyan-400
                ${task.isCompleted 
                ? 'bg-cyan-900/50 border-cyan-500 text-cyan-400 shadow-[inset_0_0_10px_rgba(6,182,212,0.3)]' 
                : ''}
            `}
            >
            {task.isCompleted && <Check size={18} />}
            </button>

            {/* Content Text */}
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h3 className={`text-lg font-bold font-tech tracking-wide mb-2 ${task.isCompleted ? 'text-slate-500 line-through decoration-slate-600' : 'text-slate-100 shadow-black drop-shadow-md'}`}>
                        {task.content}
                    </h3>
                    <div className="text-slate-500">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                </div>
            
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {/* Time Window */}
                    <div className="flex items-center gap-2 text-cyan-200 bg-cyan-950/40 px-2 py-1 border border-cyan-900/50 w-fit">
                        <Clock size={12} className="text-cyan-400" />
                        <span className="font-bold text-cyan-500">{dateDisplay}</span>
                        <span className="text-slate-400">|</span>
                        <span className="font-mono">{timeDisplay}</span>
                    </div>

                    {/* Deadline */}
                    <div className={`flex items-center gap-2 px-2 py-1 w-fit border border-transparent ${isOverdue ? 'text-red-400 bg-red-950/30 border-red-900/50' : 'text-slate-400'}`}>
                        <AlertCircle size={12} />
                        <span className="uppercase tracking-wider">TIMEOUT: {format(deadline, 'MM/dd HH:mm')}</span>
                    </div>
                </div>

                {/* Subtask Mini Progress Indicator (when collapsed) */}
                {!isExpanded && totalSubtasks > 0 && (
                     <div className="mt-3 flex items-center gap-2">
                        <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden max-w-[100px]">
                            <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                        <span className="text-[9px] font-mono text-cyan-600">{completedSubtasks}/{totalSubtasks} STEPS</span>
                     </div>
                )}
            </div>
        </div>

        {/* Expanded Subtask Area */}
        {isExpanded && (
            <div className="border-t border-cyan-900/30 bg-black/20 p-4 animate-in slide-in-from-top-2 duration-200">
                <div className="mb-3 space-y-2">
                    {(task.subtasks || []).map(subtask => (
                        <div key={subtask.id} className="flex items-center gap-3 group">
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleSubtask(subtask.id); }}
                                className={`w-4 h-4 border border-slate-600 flex items-center justify-center transition-colors ${subtask.isCompleted ? 'bg-cyan-600 border-cyan-500' : 'hover:border-cyan-400'}`}
                            >
                                {subtask.isCompleted && <Check size={10} className="text-white" />}
                            </button>
                            <span className={`text-sm font-mono flex-1 ${subtask.isCompleted ? 'text-slate-600 line-through' : 'text-cyan-100'}`}>
                                {subtask.content}
                            </span>
                            <button 
                                onClick={(e) => { e.stopPropagation(); deleteSubtask(subtask.id); }}
                                className="text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleAddSubtask} className="flex gap-2 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-cyan-900/50 -translate-x-4"></div>
                    <input 
                        type="text" 
                        value={newSubtaskContent}
                        onChange={(e) => setNewSubtaskContent(e.target.value)}
                        placeholder="Add tactical step..."
                        className="flex-1 bg-black/40 border border-slate-700 text-xs px-2 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono placeholder-slate-600"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button 
                        type="submit"
                        className="bg-cyan-900/30 border border-cyan-700 text-cyan-400 px-2 hover:bg-cyan-800/30 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Plus size={14} />
                    </button>
                </form>
            </div>
        )}

        {/* Action Bar */}
        <div className="flex justify-end gap-0 border-t border-white/5 bg-black/20">
            <button 
                onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                className="px-4 py-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/30 flex items-center gap-1 text-xs font-bold transition-colors"
            >
                <Edit2 size={12} /> CONFIGURE
            </button>
            <div className="w-px bg-white/10"></div>
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                className="px-4 py-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 flex items-center gap-1 text-xs font-bold transition-colors"
            >
                <Trash2 size={12} /> TERMINATE
            </button>
        </div>
      </div>
    </div>
  );
};
