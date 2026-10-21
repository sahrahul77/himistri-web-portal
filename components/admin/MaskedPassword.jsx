import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

export function MaskedPassword({ password }) {
  const [show, setShow] = useState(false);
  if (!password) return null;

  return (
    <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-600 dark:text-amber-400 mt-1">
      <Lock className="w-3.5 h-3.5 text-amber-500 inline shrink-0" />
      <span>Password: {show ? password : '•••••••• (Hashed)'}</span>
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-neutral-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
        title={show ? "Hide Password" : "Show Password"}
      >
        {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
