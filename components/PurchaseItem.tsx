import React from 'react';
import { Purchase, PurchaseStages } from '../types';
import { Edit2, Trash2, ShoppingBag, CreditCard, Truck, Package, CheckCircle, Lock } from 'lucide-react';

interface PurchaseItemProps {
  purchase: Purchase;
  onUpdateStages: (id: string, stages: PurchaseStages) => void;
  onEdit: (purchase: Purchase) => void;
  onDelete: (id: string) => void;
}

const STAGES = [
  { key: 'ordered', label: '喊單', icon: ShoppingBag },
  { key: 'paid', label: '匯款', icon: CreditCard },
  { key: 'shipped', label: '出貨', icon: Truck },
  { key: 'arrived', label: '到貨', icon: Package },
  { key: 'completed', label: '完成', icon: CheckCircle },
] as const;

export const TAG_COLORS: Record<string, string> = {
  fuchsia: 'bg-fuchsia-900/30 border-fuchsia-500/30 text-fuchsia-300',
  emerald: 'bg-emerald-900/30 border-emerald-500/30 text-emerald-300',
  amber: 'bg-amber-900/30 border-amber-500/30 text-amber-300',
  rose: 'bg-rose-900/30 border-rose-500/30 text-rose-300',
  violet: 'bg-violet-900/30 border-violet-500/30 text-violet-300',
  blue: 'bg-blue-900/30 border-blue-500/30 text-blue-300',
  cyan: 'bg-cyan-900/30 border-cyan-500/30 text-cyan-300',
};

export const PurchaseItem: React.FC<PurchaseItemProps> = ({ purchase, onUpdateStages, onEdit, onDelete }) => {
  const isLocked = purchase.stages.completed;
  const tagColorClass = purchase.tagColor && TAG_COLORS[purchase.tagColor] ? TAG_COLORS[purchase.tagColor] : TAG_COLORS.fuchsia;

  const toggleStage = (stageKey: keyof PurchaseStages) => {
    // If locked, only allow toggling the 'completed' stage to unlock
    if (isLocked && stageKey !== 'completed') return;

    // Logic: Cannot mark as 'completed' if 'arrived' is not checked
    if (stageKey === 'completed' && !purchase.stages.completed && !purchase.stages.arrived) {
      alert('請先確認「到貨」後，才能按下「完成」喔！');
      return;
    }

    onUpdateStages(purchase.id, {
      ...purchase.stages,
      [stageKey]: !purchase.stages[stageKey]
    });
  };

  return (
    <div className={`holo-card rounded-2xl p-4 sm:p-5 mb-4 transition-all duration-300 ${isLocked ? 'opacity-75 border-cyan-900/50' : 'hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]'}`}>
      <div className="flex justify-between items-start mb-4 gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`text-base sm:text-lg font-bold tracking-wide break-words leading-tight ${isLocked ? 'text-cyan-600' : 'text-cyan-50'}`}>{purchase.name}</h3>
            {isLocked && <Lock size={16} className="text-cyan-600 flex-shrink-0" />}
          </div>
          <div className="text-xs sm:text-sm text-cyan-300/70 flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
            <span className="bg-cyan-950/50 border border-cyan-800/50 px-2 py-1 rounded font-tech text-[11px] sm:text-xs tracking-wider text-cyan-400 whitespace-nowrap">{purchase.date}</span>
            {purchase.tag && (
              <span className={`border px-2 py-1 rounded text-[11px] sm:text-xs font-medium whitespace-nowrap ${tagColorClass}`}>
                #{purchase.tag}
              </span>
            )}
            {purchase.note && (
              <div className="w-full mt-1.5 sm:mt-0 sm:w-auto">
                <span className="text-cyan-800 hidden sm:inline mr-2">•</span>
                <span className="truncate block sm:inline-block sm:max-w-[250px] text-xs sm:text-sm text-cyan-400/80">{purchase.note}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          <span className={`text-xl sm:text-2xl font-bold font-tech ${isLocked ? 'text-cyan-700' : 'text-cyan-400'}`}>${purchase.price.toLocaleString()}</span>
          <div className="flex gap-1 sm:gap-2">
            <button 
              onClick={() => onEdit(purchase)} 
              disabled={isLocked}
              className={`p-2 sm:p-1.5 rounded-xl transition-colors ${isLocked ? 'text-slate-700 cursor-not-allowed' : 'text-cyan-600/70 hover:text-cyan-300 hover:bg-cyan-950/50 active:bg-cyan-900/50'}`}
            >
              <Edit2 size={18} className="sm:w-4 sm:h-4" />
            </button>
            <button 
              onClick={() => onDelete(purchase.id)} 
              className="p-2 sm:p-1.5 text-rose-500/70 hover:text-rose-400 hover:bg-rose-950/30 active:bg-rose-900/30 rounded-xl transition-colors"
            >
              <Trash2 size={18} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-cyan-900/30">
        <div className="flex justify-between items-center relative px-1 sm:px-4">
          {/* Connecting line */}
          <div className="absolute left-5 right-5 sm:left-8 sm:right-8 top-5 sm:top-6 -translate-y-1/2 h-1 bg-slate-800/80 rounded-full z-0"></div>
          
          {STAGES.map((stage) => {
            const isCompleted = purchase.stages[stage.key];
            const Icon = stage.icon;
            const isDisabled = isLocked && stage.key !== 'completed';
            
            return (
              <div key={stage.key} className="relative z-10 flex flex-col items-center gap-2">
                <button
                  onClick={() => toggleStage(stage.key)}
                  disabled={isDisabled}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                    isCompleted 
                      ? (isLocked && stage.key !== 'completed' ? 'bg-cyan-900 border-cyan-800 text-cyan-600' : 'bg-cyan-500 border-cyan-400 text-black shadow-[0_0_12px_rgba(6,182,212,0.6)] scale-110')
                      : 'bg-[#0a111d] border-slate-700 text-slate-500 hover:border-cyan-700 hover:text-cyan-600'
                  } ${isDisabled ? 'cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                  title={stage.label}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={isCompleted ? 2.5 : 2} />
                </button>
                <span className={`text-[11px] sm:text-xs font-medium transition-colors tracking-wider sm:tracking-widest ${isCompleted ? (isLocked && stage.key !== 'completed' ? 'text-cyan-700' : 'text-cyan-400') : 'text-slate-500'}`}>
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
