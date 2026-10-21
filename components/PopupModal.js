import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function PopupModal({ isOpen, onClose, title, message, type = 'success', actionText = 'Continue', onAction }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#242424] border border-[#3A3A3A] rounded-3xl p-6 sm:p-8 w-full max-w-md text-white shadow-2xl relative text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">

        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition">
          <X className="w-5 h-5" />
        </button>

        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-lg ${
          type === 'success' ? 'bg-emerald-600/20 text-emerald-500 border border-emerald-600/30' :
          type === 'error' ? 'bg-rose-600/20 text-rose-500 border border-rose-600/30' : 'bg-redPrimary/20 text-redPrimary border border-redPrimary/30'
        }`}>
          {type === 'success' ? <CheckCircle2 className="w-9 h-9" /> :
           type === 'error' ? <AlertCircle className="w-9 h-9" /> : <Info className="w-9 h-9" />}
        </div>

        <div>
          <h3 className="text-xl font-black text-white leading-snug">{title || 'Notification'}</h3>
          <div className="text-xs text-slate-300 mt-2 leading-relaxed whitespace-pre-line bg-[#1A1A1A] p-4 rounded-2xl border border-[#333333] text-left space-y-1">
            {message}
          </div>
        </div>

        <button
          onClick={() => {
            onClose();
            if (onAction) onAction();
          }}
          className="btn-primary w-full py-3.5 text-sm font-black bg-redPrimary hover:bg-redDark text-white rounded-xl shadow-xl transition"
        >
          {actionText}
        </button>
      </div>
    </div>
  );
}
