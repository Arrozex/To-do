import React from 'react';
import { Task } from '../types';
import { Check, AlertCircle, Trash2, Edit2, Clock, Crosshair } from 'lucide-react';
import { format, isPast, isSameDay } from 'date-fns';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, onEdit }) => {
  const isOverdue = !task.isCompleted && isPast(new Date(task.deadline));
  
  const start = new Date(task.executionStart);
  const end = new Date(task.executionEnd);
  const deadline = new Date(task.deadline);
  
  const isSameDayExecution = isSameDay(start, end);
  
  const timeDisplay = isSameDayExecution 
    ? `${format(start, 'HH:mm')} > ${format(end, 'HH:mm')}`
    : `${format(start, 'MM/dd HH:mm')} > ${format(end, 'MM/dd HH:mm')}`;

  const dateDisplay = format(start, 'MMM d').toUpperCase();

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

        <div className="p-4 flex gap-4">
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

            {/* Main Content */}
            <div 
            className="flex-1 cursor-pointer"
            onClick={() => onEdit(task)}
            >
            <h3 className={`text-lg font-bold font-tech tracking-wide mb-2 ${task.isCompleted ? 'text-slate-500 line-through decoration-slate-600' : 'text-slate-100 shadow-black drop-shadow-md'}`}>
                {task.content}
            </h3>
            
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
                    <span className="uppercase tracking-wider">TIMEOUT: {format(deadline, 'HH:mm')}</span>
                </div>
            </div>
            </div>
        </div>

        {/* Action Bar (Slide out or static bottom) */}
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