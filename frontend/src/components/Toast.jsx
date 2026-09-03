import { useState, useEffect, useCallback, useRef } from "react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import React from "react";

let toastId = 0;
let listeners = [];

export function showToast(message, type = "info") {
  const id = ++toastId;
  listeners.forEach((fn) => fn({ id, message, type }));
  return id;
}

const TYPE_STYLE = {
  success: { bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", icon: CheckCircle },
  info: { bg: "bg-blue-50 border-blue-100", text: "text-blue-700", icon: Info },
  warning: { bg: "bg-amber-50 border-amber-100", text: "text-amber-700", icon: AlertTriangle },
};

function ToastItem({ toast, onRemove }) {
  const style = TYPE_STYLE[toast.type] || TYPE_STYLE.info;
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, 5000);
    return () => clearTimeout(timerRef.current);
  }, [toast.id, onRemove]);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-xl shadow-black/5 backdrop-blur-md ${
        exiting ? 'toast-exit' : 'animate-[slideInRight_0.35s_cubic-bezier(0.22,1,0.36,1)]'
      } ${style.bg}`}
    >
      {React.createElement(style.icon, { className: `shrink-0 w-5 h-5 ${style.text}` })}
      <p className={`text-sm font-medium flex-1 leading-relaxed ${style.text}`}>{toast.message}</p>
      <button
        onClick={() => {
          setExiting(true);
          setTimeout(() => onRemove(toast.id), 300);
        }}
        className={`text-xs opacity-40 hover:opacity-100 shrink-0 ${style.text} transition-all duration-200 hover:scale-110 p-0.5`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handler = (toast) => setToasts((prev) => [...prev, toast]);
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((fn) => fn !== handler);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-24 right-4 z-[9999] flex flex-col gap-2.5 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  );
}
