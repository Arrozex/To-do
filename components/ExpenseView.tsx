import React from 'react';
import { Expense, ExpenseCategory } from '../types';
import { format } from 'date-fns';
import { ShoppingCart, Coffee, ShieldAlert, Gamepad2, TrendingUp, DollarSign, Trash2 } from 'lucide-react';

interface ExpenseViewProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  monthlyLimit: number;
  onUpdateLimit: (limit: number) => void;
}

export const ExpenseView: React.FC<ExpenseViewProps> = ({ expenses, onDelete, monthlyLimit, onUpdateLimit }) => {
  
  // Calculate Totals
  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  
  // Group by Month
  const groupedExpenses = expenses.reduce((acc, expense) => {
    const monthKey = format(new Date(expense.date), 'yyyy-MM');
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);

  // Sort months descending
  const sortedMonths = Object.keys(groupedExpenses).sort((a, b) => b.localeCompare(a));

  const getCategoryIcon = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'FOOD': return <Coffee size={16} />;
      case 'ESSENTIAL': return <ShieldAlert size={16} />;
      case 'ENTERTAINMENT': return <Gamepad2 size={16} />;
      case 'SUPPLIES': return <ShoppingCart size={16} />;
      default: return <DollarSign size={16} />;
    }
  };

  const getCategoryColor = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'FOOD': return 'text-orange-400 border-orange-400/50 bg-orange-900/20';
      case 'ESSENTIAL': return 'text-blue-400 border-blue-400/50 bg-blue-900/20';
      case 'ENTERTAINMENT': return 'text-purple-400 border-purple-400/50 bg-purple-900/20';
      case 'SUPPLIES': return 'text-green-400 border-green-400/50 bg-green-900/20';
      default: return 'text-slate-400';
    }
  };

  const getCategoryLabel = (cat: ExpenseCategory) => {
    switch (cat) {
        case 'FOOD': return '飲食 (FOOD)';
        case 'ESSENTIAL': return '必要 (ESSENTIAL)';
        case 'ENTERTAINMENT': return '娛樂 (FUN)';
        case 'SUPPLIES': return '用品 (SUPPLIES)';
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Summary Card */}
      <div className="holo-card p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-20">
            <TrendingUp size={100} className="text-cyan-400" />
        </div>
        
        <div className="relative z-10 grid grid-cols-2 gap-4">
            <div>
                <p className="text-[10px] text-cyan-500 font-tech tracking-widest uppercase mb-1">Total Planned</p>
                <h2 className="text-3xl font-mono font-bold text-white shadow-cyan-500/50 drop-shadow-md">
                    ${totalSpent.toLocaleString()}
                </h2>
            </div>
            <div>
                 <p className="text-[10px] text-slate-500 font-tech tracking-widest uppercase mb-1">Monthly Limit</p>
                 <div className="flex items-center gap-1 border-b border-slate-700">
                    <span className="text-slate-500">$</span>
                    <input 
                        type="number" 
                        value={monthlyLimit}
                        onChange={(e) => onUpdateLimit(Number(e.target.value))}
                        className="bg-transparent w-full text-xl font-mono font-bold text-slate-300 focus:outline-none focus:text-cyan-400"
                    />
                 </div>
            </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 relative h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
                className={`absolute top-0 left-0 h-full transition-all duration-500 ${totalSpent > monthlyLimit ? 'bg-red-500' : 'bg-cyan-500'}`}
                style={{ width: `${Math.min((totalSpent / (monthlyLimit || 1)) * 100, 100)}%` }}
            ></div>
        </div>
        <div className="flex justify-between mt-1 text-[9px] font-mono text-slate-500">
            <span>0%</span>
            <span>{Math.round((totalSpent / (monthlyLimit || 1)) * 100)}% USED</span>
        </div>
      </div>

      {/* Monthly Lists */}
      <div className="space-y-6">
        {sortedMonths.map(month => {
            const monthTotal = groupedExpenses[month].reduce((sum, i) => sum + i.amount, 0);
            
            return (
                <div key={month} className="animate-in slide-in-from-bottom-2 duration-500">
                    <div className="flex justify-between items-end mb-2 border-b border-cyan-900/30 pb-1 px-1">
                        <h3 className="text-lg font-tech font-bold text-cyan-200 tracking-wider">
                            {format(new Date(month + '-01'), 'MMMM yyyy')}
                        </h3>
                        <span className="text-xs font-mono text-cyan-600">
                            MONTH TOTAL: ${monthTotal.toLocaleString()}
                        </span>
                    </div>

                    <div className="space-y-2">
                        {groupedExpenses[month].map(expense => (
                            <div key={expense.id} className="bg-black/40 border border-slate-800 p-3 flex justify-between items-center group hover:border-cyan-500/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 flex items-center justify-center border rounded-sm ${getCategoryColor(expense.category)}`}>
                                        {getCategoryIcon(expense.category)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-200">{expense.note}</p>
                                        <p className="text-[10px] text-slate-500 font-tech">{getCategoryLabel(expense.category)} • {format(new Date(expense.date), 'MM/dd')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-mono font-bold text-cyan-100">${expense.amount.toLocaleString()}</span>
                                    <button 
                                        onClick={() => onDelete(expense.id)}
                                        className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        })}
        
        {expenses.length === 0 && (
            <div className="text-center py-10 opacity-30">
                <DollarSign size={48} className="mx-auto mb-2 text-slate-500" />
                <p className="font-tech text-slate-500 tracking-widest">NO FINANCIAL RECORDS LOGGED</p>
            </div>
        )}
      </div>
    </div>
  );
};
