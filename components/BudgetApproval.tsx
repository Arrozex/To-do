import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileText, AlertCircle, CheckCircle2, Clock, XCircle, MessageSquare } from 'lucide-react';

interface ApprovalRow {
  name: string;
  amount: string;
  result: string;
  note: string;
  isSeparator?: boolean;
  isSummary?: boolean;
}

export const BudgetApproval: React.FC = () => {
  const [data, setData] = useState<ApprovalRow[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<number, string>>({});

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const wb = XLSX.read(data, { type: 'array' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Convert to array of arrays
        const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
        
        // Parse data
        const parsedData: ApprovalRow[] = [];
        
        // Skip header row if it matches our expected headers
        let startIndex = 0;
        if (rawData.length > 0 && rawData[0][0] === '物品名稱') {
          startIndex = 1;
        }

        for (let i = startIndex; i < rawData.length; i++) {
          const row = rawData[i];
          if (!row || row.length === 0 || (row.length === 1 && !row[0])) continue;

          const name = String(row[0] || '').trim();
          const amount = String(row[1] || '').trim();
          const result = String(row[2] || '').trim();
          const note = String(row[3] || '').trim();

          if (name === '---' || name.match(/^-+$/)) {
            parsedData.push({ name: '', amount: '', result: '', note: '', isSeparator: true });
          } else if (name === '累計金額' || name.includes('累計')) {
            parsedData.push({ name, amount, result, note, isSummary: true });
          } else {
            parsedData.push({ name, amount, result, note });
          }
        }
        
        setData(parsedData);
      } catch (error) {
        console.error("Error parsing file:", error);
        alert("檔案解析失敗，請確認格式是否正確。");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const getResultIcon = (result: string) => {
    if (result.includes('買') || result.includes('通過') || result.includes('核准')) {
      if (result.includes('未來') || result.includes('延後')) {
        return <Clock size={16} className="text-amber-400" />;
      }
      return <CheckCircle2 size={16} className="text-emerald-400" />;
    }
    if (result.includes('不') || result.includes('拒絕') || result.includes('駁回')) {
      return <XCircle size={16} className="text-rose-400" />;
    }
    return <AlertCircle size={16} className="text-cyan-400" />;
  };

  const getResultColor = (result: string) => {
    if (result.includes('買') || result.includes('通過') || result.includes('核准')) {
      if (result.includes('未來') || result.includes('延後')) {
        return 'text-amber-400 bg-amber-950/30 border-amber-500/30';
      }
      return 'text-emerald-400 bg-emerald-950/30 border-emerald-500/30';
    }
    if (result.includes('不') || result.includes('拒絕') || result.includes('駁回')) {
      return 'text-rose-400 bg-rose-950/30 border-rose-500/30';
    }
    return 'text-cyan-400 bg-cyan-950/30 border-cyan-500/30';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Upload Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-cyan-50 tracking-widest font-tech flex items-center gap-3">
            <FileText className="text-cyan-400" />
            APPROVAL REPORT
          </h2>
          <p className="text-sm text-cyan-600 mt-1">預算審核企劃書與後續追蹤</p>
        </div>
        
        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-cyan-950/50 hover:bg-cyan-900/50 text-cyan-400 border border-cyan-500/50 rounded-lg font-medium tracking-widest transition-all active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          <Upload size={18} />
          {fileName ? '重新匯入報表' : '匯入審核報表'}
          <input 
            type="file" 
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
            className="hidden" 
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {/* Data Visualization Section */}
      {data && data.length > 0 ? (
        <div className="space-y-4">
          {data.map((row, idx) => {
            if (row.isSeparator) {
              return (
                <div key={idx} className="flex items-center justify-center py-2 sm:py-4">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-800/50 to-transparent" />
                </div>
              );
            }
            
            if (row.isSummary) {
              return (
                <div key={idx} className="mt-8 holo-card rounded-2xl p-5 sm:p-6 border-2 border-cyan-800/50 bg-cyan-950/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-cyan-300 tracking-widest">{row.name}</h3>
                    {row.note && (
                      <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-400 text-xs sm:text-sm font-medium">
                        <AlertCircle size={14} className="animate-pulse" />
                        {row.note}
                      </div>
                    )}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-cyan-400 font-tech tracking-wider">
                    {row.amount}
                  </div>
                </div>
              );
            }

            return (
              <div key={idx} className="holo-card rounded-xl p-5 sm:p-6 border border-cyan-800/50 bg-[#050b14]/80 flex flex-col gap-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Field: Item Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-cyan-600 uppercase tracking-widest">申請項目 (Item)</label>
                    <div className="px-4 py-2.5 bg-cyan-950/20 border border-cyan-900/50 rounded-lg text-cyan-50 font-medium min-h-[44px] flex items-center">
                      {row.name}
                    </div>
                  </div>
                  
                  {/* Field: Amount */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-cyan-600 uppercase tracking-widest">預算金額 (Amount)</label>
                    <div className="px-4 py-2.5 bg-cyan-950/20 border border-cyan-900/50 rounded-lg text-cyan-300 font-tech min-h-[44px] flex items-center">
                      {row.amount}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Field: Status */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-cyan-600 uppercase tracking-widest">審核狀態 (Status)</label>
                    <div className="px-4 py-2.5 bg-cyan-950/20 border border-cyan-900/50 rounded-lg min-h-[44px] flex items-center">
                      {row.result ? (
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium whitespace-nowrap ${getResultColor(row.result)}`}>
                          {getResultIcon(row.result)}
                          {row.result}
                        </div>
                      ) : (
                        <span className="text-cyan-800">-</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Field: Notes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-cyan-600 uppercase tracking-widest">審核備註 (Notes)</label>
                    <div className="px-4 py-2.5 bg-cyan-950/20 border border-cyan-900/50 rounded-lg text-cyan-400 text-sm min-h-[44px] flex items-center leading-relaxed">
                      {row.note || <span className="text-cyan-800">-</span>}
                    </div>
                  </div>
                </div>

                {/* Field: User Comment Input */}
                <div className="space-y-2 pt-4 mt-2 border-t border-cyan-900/40">
                  <label className="text-xs font-semibold text-cyan-500 uppercase tracking-widest flex items-center gap-2">
                    <MessageSquare size={14} />
                    後續處理與追蹤 (Follow-up Action)
                  </label>
                  <input
                    type="text"
                    placeholder="請輸入後續處理備註或追蹤事項..."
                    value={comments[idx] || ''}
                    onChange={(e) => setComments({ ...comments, [idx]: e.target.value })}
                    className="w-full bg-cyan-950/40 border border-cyan-700/50 rounded-lg px-4 py-3 text-sm text-cyan-100 placeholder-cyan-800/70 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 holo-card rounded-3xl border-dashed border-cyan-800/50">
          <div className="w-16 h-16 bg-cyan-950/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-800/30">
            <FileText size={32} className="text-cyan-700" />
          </div>
          <p className="text-cyan-400 font-medium tracking-widest">NO REPORT UPLOADED</p>
          <p className="text-sm text-cyan-700 mt-1">
            請點擊上方按鈕匯入預算審核報表
          </p>
        </div>
      )}
    </div>
  );
};
