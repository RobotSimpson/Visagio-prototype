import React, { useState } from "react";
import { Settings2, X, ShieldCheck, Target, TrendingDown, Bot } from "lucide-react";

interface VendorParametersPanelProps {
  negotiationId: string;
  onClose: () => void;
  params: any;
  setParams: (val: any) => void;
}

export default function VendorParametersPanel({ negotiationId, onClose, params, setParams }: VendorParametersPanelProps) {
  const [targetPrice, setTargetPrice] = useState<number>(params.targetPrice);
  const [minPrice, setMinPrice] = useState<number>(params.minPrice);
  const [aiEnabled, setAiEnabled] = useState<boolean>(params.aiEnabled);
  const [concessionRate, setConcessionRate] = useState<number>(params.concessionRate); // percentage
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate DB save
    setTimeout(() => {
      setParams({
        targetPrice,
        minPrice,
        aiEnabled,
        concessionRate
      });
      setIsSaving(false);
      onClose();
    }, 800);
  };

  return (
    <div className="absolute inset-0 z-20 bg-slate-50/95 backdrop-blur-md animate-in slide-in-from-bottom-8 duration-300 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-200/60 bg-white/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
            <Settings2 size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Auto-Negotiation Parameters</h2>
            <p className="text-xs font-medium text-slate-500">Limits for ID: {negotiationId.slice(0, 8)}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Toggle AI Agent */}
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <Bot size={20} className={aiEnabled ? "text-amber-500" : "text-slate-400"} />
            <div>
              <p className="text-sm font-semibold text-slate-800">Automated AI Responses</p>
              <p className="text-xs text-slate-500">Allow agent to counter-offer automatically within limits.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAiEnabled(!aiEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
              aiEnabled ? "bg-amber-500" : "bg-slate-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                aiEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Price Bounds */}
        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Target size={16} className="text-slate-400" />
              Target Sell Price ($)
            </label>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(Number(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 font-medium focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all shadow-sm"
              placeholder="e.g. 50000"
            />
            <p className="text-[11px] text-slate-500 mt-1.5 ml-1">Your ideal opening or settled point.</p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <ShieldCheck size={16} className="text-rose-400" />
              Walk-away Price ($)
            </label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
              className="w-full bg-white border border-rose-200 rounded-lg px-4 py-2.5 text-slate-800 font-medium focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 transition-all shadow-sm"
              placeholder="e.g. 40000"
            />
            <p className="text-[11px] text-slate-500 mt-1.5 ml-1">The system will absolutely not accept any offer below this.</p>
          </div>
        </div>

        <hr className="border-slate-200" />

        {/* Concession Rate Slider */}
        <div className={`${!aiEnabled ? "opacity-50 pointer-events-none grayscale" : ""}`}>
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <TrendingDown size={16} className="text-slate-400" />
              Concession Rate
            </label>
            <span className="text-sm font-bold text-amber-600">{concessionRate}%</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-4 ml-1">How aggressively the AI drops price per counter-offer round.</p>
          
          <input 
            type="range" 
            min="1" 
            max="15" 
            step="1"
            value={concessionRate}
            onChange={(e) => setConcessionRate(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
          <div className="flex justify-between mt-1 text-[10px] text-slate-400 font-medium">
            <span>Slow/Stubborn</span>
            <span>Aggressive</span>
          </div>
        </div>
        
      </div>

      {/* Footer / Actions */}
      <div className="p-5 border-t border-slate-200/60 bg-white/50 pb-5">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Save Changes"
          )}
        </button>
      </div>

    </div>
  );
}
