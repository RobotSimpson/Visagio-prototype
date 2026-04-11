import React, { useState } from "react";
import { CheckCircle2, FileText, X, Download, Building2, Package } from "lucide-react";

interface NegotiationData {
  id: string;
  buyerCompany: string;
  item: string;
  latestOffer: number | string;
  round: number;
}

interface POConfirmationModalProps {
  negotiation: NegotiationData;
  onClose: () => void;
}

export default function POConfirmationModal({ negotiation, onClose }: POConfirmationModalProps) {
  const [isSigning, setIsSigning] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  const handleSign = () => {
    setIsSigning(true);
    // Simulate backend signing process
    setTimeout(() => {
      setIsSigning(false);
      setIsSigned(true);
      // We could automatically close after 2 seconds here
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Purchase Order Summary</h2>
              <p className="text-sm font-medium text-slate-500">Ref: PO-{negotiation.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Document Body */}
        <div className="p-8 pb-10 bg-white">
          {/* Status Badge */}
          <div className="flex justify-end mb-8">
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold border flex items-center gap-2 ${
              isSigned ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"
            }`}>
              <CheckCircle2 size={16} />
              {isSigned ? "EXECUTED" : "PENDING ACKNOWLEDGEMENT"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Buyer Card */}
            <div className="p-5 border border-slate-100 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2 text-slate-400 mb-3">
                <Building2 size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Buyer</span>
              </div>
              <p className="text-lg font-bold text-slate-800">{negotiation.buyerCompany}</p>
              <p className="text-sm text-slate-500 mt-1">Acquisition Department</p>
            </div>

            {/* Item Card */}
            <div className="p-5 border border-slate-100 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2 text-slate-400 mb-3">
                <Package size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Line Item</span>
              </div>
              <p className="text-lg font-bold text-slate-800">{negotiation.item}</p>
              <p className="text-sm text-slate-500 mt-1">Finalized on Round {negotiation.round}</p>
            </div>
          </div>

          {/* Pricing Highlight */}
          <div className="p-6 bg-slate-800 rounded-xl text-white flex items-center justify-between shadow-inner">
            <div>
              <p className="text-sm font-medium text-slate-400">Total Agreed Contract Value</p>
              <p className="text-3xl font-bold mt-1">
                {typeof negotiation.latestOffer === 'number' 
                  ? `$${negotiation.latestOffer.toLocaleString()}` 
                  : negotiation.latestOffer}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-400">Payment Terms</p>
              <p className="font-semibold text-slate-200 mt-1">Net 30 Days</p>
            </div>
          </div>
          
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-200">
          <button className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
            <Download size={16} />
            Download PDF
          </button>
          
          <button
            onClick={handleSign}
            disabled={isSigning || isSigned}
            className={`px-8 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 ${
              isSigned
                ? "bg-emerald-500 text-white cursor-default"
                : "bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.98]"
            } disabled:opacity-80`}
          >
            {isSigning ? (
              <div className="h-5 w-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : isSigned ? (
              <>
                <CheckCircle2 size={18} />
                Acknowledged
              </>
            ) : (
              "Acknowledge & Sign PO"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
