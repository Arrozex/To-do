import React, { useState, useEffect, useMemo } from 'react';
import { Purchase, PurchaseStages } from './types';
import { PurchaseItem } from './components/PurchaseItem';
import { Plus, ChevronLeft, ChevronRight, ShoppingBag, Settings, X, Tag, Filter } from 'lucide-react';
import { format, parseISO, isSameMonth, addMonths, subMonths } from 'date-fns';

const COLOR_PICKER_CLASSES: Record<string, string> = {
  fuchsia: 'bg-fuchsia-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  violet: 'bg-violet-500',
  blue: 'bg-blue-500',
  cyan: 'bg-cyan-500',
};
const AVAILABLE_COLORS = Object.keys(COLOR_PICKER_CLASSES);

const App: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const saved = localStorage.getItem('merch_purchases');
    return saved ? JSON.parse(saved) : [];
  });

  const [monthlyBudget, setMonthlyBudget] = useState<number>(() => {
    const saved = localStorage.getItem('merch_budget');
    return saved ? Number(saved) : 5000;
  });

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Filter State
  const [filterTag, setFilterTag] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Form State
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDate, setFormDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [formNote, setFormNote] = useState('');
  const [formTag, setFormTag] = useState('');
  const [formTagColor, setFormTagColor] = useState('fuchsia');

  useEffect(() => {
    localStorage.setItem('merch_purchases', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem('merch_budget', String(monthlyBudget));
  }, [monthlyBudget]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    purchases.forEach(p => { if (p.tag) tags.add(p.tag); });
    return Array.from(tags);
  }, [purchases]);

  const currentMonthPurchases = useMemo(() => {
    return purchases
      .filter(p => isSameMonth(parseISO(p.date), currentMonth))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [purchases, currentMonth]);

  const filteredPurchases = useMemo(() => {
    return currentMonthPurchases.filter(p => {
      // Tag filter
      if (filterTag !== 'ALL' && p.tag !== filterTag) return false;

      // Status filter
      if (filterStatus === 'COMPLETED' && !p.stages.completed) return false;
      if (filterStatus === 'INCOMPLETE' && p.stages.completed) return false;
      if (filterStatus === 'UNPAID' && (p.stages.paid || p.stages.completed)) return false;
      if (filterStatus === 'UNSHIPPED' && (!p.stages.paid || p.stages.shipped || p.stages.completed)) return false;
      if (filterStatus === 'UNARRIVED' && (!p.stages.shipped || p.stages.arrived || p.stages.completed)) return false;

      return true;
    });
  }, [currentMonthPurchases, filterTag, filterStatus]);

  const currentMonthTotal = useMemo(() => {
    return currentMonthPurchases.reduce((sum, p) => sum + p.price, 0);
  }, [currentMonthPurchases]);

  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  const openModal = (purchase?: Purchase) => {
    if (purchase) {
      setEditingId(purchase.id);
      setFormName(purchase.name);
      setFormPrice(String(purchase.price));
      setFormDate(purchase.date);
      setFormNote(purchase.note || '');
      setFormTag(purchase.tag || '');
      setFormTagColor(purchase.tagColor || 'fuchsia');
    } else {
      setEditingId(null);
      setFormName('');
      setFormPrice('');
      setFormDate(format(new Date(), 'yyyy-MM-dd'));
      setFormNote('');
      setFormTag('');
      setFormTagColor('fuchsia');
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formName || !formPrice || !formDate) return;

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum)) return;

    if (editingId) {
      setPurchases(prev => prev.map(p => 
        p.id === editingId 
          ? { ...p, name: formName, price: priceNum, date: formDate, note: formNote, tag: formTag, tagColor: formTagColor }
          : p
      ));
    } else {
      const newPurchase: Purchase = {
        id: crypto.randomUUID(),
        name: formName,
        price: priceNum,
        date: formDate,
        note: formNote,
        tag: formTag,
        tagColor: formTagColor,
        stages: {
          ordered: false,
          paid: false,
          shipped: false,
          arrived: false,
          completed: false
        }
      };
      setPurchases(prev => [...prev, newPurchase]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('確定要刪除這筆紀錄嗎？')) {
      setPurchases(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleUpdateStages = (id: string, stages: PurchaseStages) => {
    setPurchases(prev => prev.map(p => p.id === id ? { ...p, stages } : p));
  };

  return (
    <div className="min-h-screen text-slate-100 font-sans pb-24">
      {/* Header */}
      <header className="holo-card sticky top-0 z-30 border-b border-cyan-500/30">
        <div className="max-w-3xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400">
            <ShoppingBag size={20} className="text-cyan-400 sm:w-6 sm:h-6" />
            <h1 className="text-lg sm:text-xl font-bold tracking-widest font-tech">MERCH_TRACKER</h1>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-3 sm:p-2 text-cyan-600 hover:text-cyan-300 hover:bg-cyan-950/50 rounded-full transition-colors active:bg-cyan-900/50"
          >
            <Settings size={22} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Month Selector & Budget Overview */}
        <div className="holo-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <button onClick={handlePrevMonth} className="p-3 sm:p-2 hover:bg-cyan-950/50 rounded-full transition-colors active:bg-cyan-900/50">
              <ChevronLeft size={22} className="text-cyan-500 sm:w-5 sm:h-5" />
            </button>
            <h2 className="text-lg sm:text-xl font-bold text-cyan-50 tracking-widest font-tech">
              {format(currentMonth, 'yyyy / MM')}
            </h2>
            <button onClick={handleNextMonth} className="p-3 sm:p-2 hover:bg-cyan-950/50 rounded-full transition-colors active:bg-cyan-900/50">
              <ChevronRight size={22} className="text-cyan-500 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs sm:text-sm font-medium text-cyan-600 mb-1 tracking-widest">MONTHLY BUDGET</span>
            <div className="flex items-baseline gap-2 mb-4 font-tech">
              <span className={`text-3xl sm:text-4xl font-bold ${currentMonthTotal > monthlyBudget ? 'text-rose-500' : 'text-cyan-400'}`}>
                ${currentMonthTotal.toLocaleString()}
              </span>
              <span className="text-base sm:text-lg text-cyan-800">/ ${monthlyBudget.toLocaleString()}</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden border border-cyan-900/30">
              <div 
                className={`h-full rounded-full transition-all duration-500 shadow-[0_0_10px_currentColor] ${currentMonthTotal > monthlyBudget ? 'bg-rose-500 text-rose-500' : 'bg-cyan-500 text-cyan-500'}`}
                style={{ width: `${Math.min((currentMonthTotal / monthlyBudget) * 100, 100)}%` }}
              />
            </div>
            {currentMonthTotal > monthlyBudget && (
              <p className="text-xs sm:text-sm text-rose-400 mt-3 font-medium bg-rose-950/30 border border-rose-500/30 px-3 py-1 rounded-full flex items-center gap-2">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-500 animate-pulse"></span>
                BUDGET EXCEEDED
              </p>
            )}
          </div>
        </div>

        {/* Purchase List Header & Filters */}
        <div className="mb-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base sm:text-lg font-bold text-cyan-50 tracking-widest">PURCHASES</h2>
            <span className="text-xs sm:text-sm font-tech text-cyan-400 bg-cyan-950/50 border border-cyan-800/50 px-2.5 py-0.5 rounded-full">
              {filteredPurchases.length} ITEMS
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 px-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-2.5 sm:left-3 flex items-center pointer-events-none">
                <Tag size={14} className="text-cyan-600" />
              </div>
              <select 
                value={filterTag} 
                onChange={e => setFilterTag(e.target.value)}
                className="w-full pl-8 sm:pl-9 pr-6 sm:pr-8 py-3 sm:py-2.5 bg-[#0d1623] border border-cyan-900/50 text-cyan-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-cyan-500 appearance-none truncate"
              >
                <option value="ALL">所有標籤</option>
                {allTags.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-2.5 sm:left-3 flex items-center pointer-events-none">
                <Filter size={14} className="text-cyan-600" />
              </div>
              <select 
                value={filterStatus} 
                onChange={e => setFilterStatus(e.target.value)}
                className="w-full pl-8 sm:pl-9 pr-6 sm:pr-8 py-3 sm:py-2.5 bg-[#0d1623] border border-cyan-900/50 text-cyan-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-cyan-500 appearance-none truncate"
              >
                <option value="ALL">所有狀態</option>
                <option value="INCOMPLETE">未完成</option>
                <option value="COMPLETED">已完成</option>
                <option value="UNPAID">待匯款</option>
                <option value="UNSHIPPED">待出貨</option>
                <option value="UNARRIVED">待到貨</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredPurchases.length === 0 ? (
            <div className="text-center py-16 holo-card rounded-3xl border-dashed border-cyan-800/50">
              <div className="w-16 h-16 bg-cyan-950/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-800/30">
                <ShoppingBag size={32} className="text-cyan-700" />
              </div>
              <p className="text-cyan-400 font-medium tracking-widest">NO DATA FOUND</p>
              <p className="text-sm text-cyan-700 mt-1">
                {currentMonthPurchases.length > 0 ? '沒有符合篩選條件的紀錄' : 'Initialize new record to begin tracking'}
              </p>
            </div>
          ) : (
            filteredPurchases.map(purchase => (
              <PurchaseItem 
                key={purchase.id} 
                purchase={purchase} 
                onUpdateStages={handleUpdateStages}
                onEdit={openModal}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </main>

      {/* FAB */}
      <button
        onClick={() => openModal()}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 bg-cyan-500 text-black rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)] flex items-center justify-center hover:bg-cyan-400 hover:scale-105 transition-all z-40 active:scale-95 border border-cyan-300"
      >
        <Plus className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2.5} />
      </button>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#050b14]/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="holo-card bg-[#0d1623] rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-200 border border-cyan-500/30">
            <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-cyan-900/50 flex justify-between items-center bg-cyan-950/20 flex-shrink-0">
              <h3 className="text-lg sm:text-xl font-bold text-cyan-50 tracking-widest font-tech">{editingId ? 'EDIT_RECORD' : 'NEW_RECORD'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-3 sm:p-2 text-cyan-600 hover:text-cyan-300 hover:bg-cyan-900/50 rounded-full transition-colors active:bg-cyan-900/50">
                <X size={22} className="sm:w-5 sm:h-5" />
              </button>
            </div>
            <div className="p-5 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto no-scrollbar">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-cyan-400 mb-2 tracking-widest">商品名稱</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-4 py-3 sm:py-3.5 bg-slate-900/50 border border-cyan-800/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all text-cyan-50 placeholder-cyan-800 text-sm sm:text-base"
                  placeholder="例如：排球少年 壓克力立牌"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-cyan-400 mb-2 tracking-widest">金額</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600 font-tech">$</span>
                    <input 
                      type="number" 
                      value={formPrice}
                      onChange={e => setFormPrice(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 sm:py-3.5 bg-slate-900/50 border border-cyan-800/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all text-cyan-50 font-tech placeholder-cyan-800 text-sm sm:text-base"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-cyan-400 mb-2 tracking-widest">日期</label>
                  <input 
                    type="date" 
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full px-4 py-3 sm:py-3.5 bg-slate-900/50 border border-cyan-800/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all text-cyan-50 font-tech [color-scheme:dark] text-sm sm:text-base"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-cyan-400 mb-2 tracking-widest">作品 Tag (選填)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600">
                    <Tag size={18} className="sm:w-4 sm:h-4" />
                  </span>
                  <input 
                    type="text" 
                    value={formTag}
                    onChange={e => setFormTag(e.target.value)}
                    className="w-full pl-11 sm:pl-10 pr-4 py-3 sm:py-3.5 bg-slate-900/50 border border-cyan-800/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all text-cyan-50 placeholder-cyan-800 text-sm sm:text-base"
                    placeholder="例如：排球少年、吉伊卡哇"
                  />
                </div>
                {formTag && (
                  <div className="mt-4 flex gap-1 sm:gap-2 px-1 overflow-x-auto no-scrollbar pb-2">
                    {AVAILABLE_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormTagColor(c)}
                        className={`w-10 h-10 flex items-center justify-center flex-shrink-0 transition-all ${formTagColor === c ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}
                        title={c}
                      >
                        <div className={`w-6 h-6 rounded-full ${COLOR_PICKER_CLASSES[c]} ${formTagColor === c ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#0d1623]' : ''}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-cyan-400 mb-2 tracking-widest">備註 (選填)</label>
                <input 
                  type="text" 
                  value={formNote}
                  onChange={e => setFormNote(e.target.value)}
                  className="w-full px-4 py-3 sm:py-3.5 bg-slate-900/50 border border-cyan-800/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all text-cyan-50 placeholder-cyan-800 text-sm sm:text-base"
                  placeholder="例如：跟團、預計10月發貨..."
                />
              </div>
            </div>
            <div className="px-5 py-4 sm:px-6 sm:py-5 bg-cyan-950/20 border-t border-cyan-900/50 flex justify-end gap-3 flex-shrink-0">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 sm:px-5 py-3 sm:py-2.5 text-cyan-500 font-medium hover:bg-cyan-900/50 rounded-xl transition-colors tracking-widest text-sm sm:text-base active:bg-cyan-900/50"
              >
                CANCEL
              </button>
              <button 
                onClick={handleSave}
                disabled={!formName || !formPrice || !formDate}
                className="px-6 sm:px-6 py-3 sm:py-2.5 bg-cyan-500 text-black font-bold tracking-widest rounded-xl hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[0_0_10px_rgba(6,182,212,0.3)] text-sm sm:text-base active:scale-95"
              >
                SAVE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-[#050b14]/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="holo-card bg-[#0d1623] rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-200 border border-cyan-500/30 flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-cyan-900/50 flex justify-between items-center bg-cyan-950/20 flex-shrink-0">
              <h3 className="text-lg sm:text-xl font-bold text-cyan-50 tracking-widest font-tech">SETTINGS</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="p-3 sm:p-2 text-cyan-600 hover:text-cyan-300 hover:bg-cyan-900/50 rounded-full transition-colors active:bg-cyan-900/50">
                <X size={22} className="sm:w-5 sm:h-5" />
              </button>
            </div>
            <div className="p-5 sm:p-6 overflow-y-auto no-scrollbar">
              <label className="block text-xs sm:text-sm font-semibold text-cyan-400 mb-2 tracking-widest">每月預算設定</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600 font-tech">$</span>
                <input 
                  type="number" 
                  value={monthlyBudget}
                  onChange={e => setMonthlyBudget(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 sm:py-3.5 bg-slate-900/50 border border-cyan-800/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all text-cyan-50 font-tech text-base sm:text-lg"
                />
              </div>
              <p className="text-xs sm:text-sm text-cyan-700 mt-3">預算將套用於所有月份的計算。</p>
            </div>
            <div className="px-5 py-4 sm:px-6 sm:py-5 bg-cyan-950/20 border-t border-cyan-900/50 flex justify-end flex-shrink-0">
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="px-6 py-3 sm:py-2.5 bg-cyan-500 text-black font-bold tracking-widest rounded-xl hover:bg-cyan-400 transition-colors shadow-[0_0_10px_rgba(6,182,212,0.3)] w-full text-sm sm:text-base active:scale-95"
              >
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
