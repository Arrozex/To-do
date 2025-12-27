import React, { useState } from 'react';
import { Task } from '../types';
import { 
  format, 
  endOfMonth, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  endOfDay
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onDateSelect, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const onNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const onPrevMonth = () => setCurrentMonth(addMonths(currentMonth, -1));

  // Native implementation of startOfMonth
  const monthStart = new Date(currentMonth);
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const monthEnd = endOfMonth(monthStart);

  // Native implementation of startOfWeek (defaults to Sunday start)
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  startDate.setHours(0, 0, 0, 0);

  const endDate = endOfWeek(monthEnd);

  const dayList = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="holo-card p-4 mb-4 backdrop-blur-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-cyan-900/50 pb-2">
        <button onClick={onPrevMonth} className="p-1 hover:text-cyan-400 text-slate-400 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <span className="text-xl font-tech font-bold text-cyan-400 tracking-widest uppercase">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <button onClick={onNextMonth} className="p-1 hover:text-cyan-400 text-slate-400 transition-colors">
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 mb-2 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {dayList.map((d, i) => {
          // Native implementation of startOfDay
          const dayStart = new Date(d);
          dayStart.setHours(0, 0, 0, 0);
          
          const dayEnd = endOfDay(d);

          // Check for tasks overlapping with this day
          const dayTasks = tasks.filter(t => {
            const tStart = new Date(t.executionStart);
            const tEnd = new Date(t.executionEnd);
            return tStart <= dayEnd && tEnd >= dayStart;
          });

          const hasTasks = dayTasks.length > 0;
          const isSelected = isSameDay(d, selectedDate);
          const isCurrentMonth = isSameMonth(d, monthStart);
          const isToday = isSameDay(d, new Date());

          return (
            <div
              key={i}
              className={`
                aspect-square flex flex-col items-center justify-center relative cursor-pointer border transition-all duration-200
                ${!isCurrentMonth ? 'opacity-20' : 'opacity-100'}
                ${isSelected 
                  ? 'bg-cyan-900/40 border-cyan-400 text-cyan-100 shadow-[0_0_10px_rgba(6,182,212,0.4)]' 
                  : 'bg-black/20 border-white/5 text-slate-400 hover:bg-cyan-900/20 hover:border-cyan-700'}
                ${isToday && !isSelected ? 'border-cyan-800 text-cyan-400' : ''}
              `}
              onClick={() => onDateSelect(d)}
            >
              <span className="text-sm font-mono">{format(d, "d")}</span>
              
              {/* Task Indicators */}
              <div className="flex gap-0.5 mt-1">
                 {/* Just simple glowing dots */}
                {hasTasks && (
                    <div className={`w-1 h-1 rounded-sm ${isSelected ? 'bg-cyan-200 shadow-[0_0_5px_cyan]' : 'bg-cyan-600'}`} />
                )}
                 {dayTasks.some(t => t.isCompleted) && (
                    <div className={`w-1 h-1 rounded-sm bg-green-500`} />
                )}
              </div>

              {/* Corner accent for tech feel */}
              {isSelected && (
                <>
                  <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-cyan-400"></span>
                  <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-cyan-400"></span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
