import { useState, useEffect, useCallback } from "react";

let toastId = 0;
let listeners = [];

export function showToast(message, type = "info") {
  const id = ++toastId;
  listeners.forEach((fn) => fn({ id, message, type }));
  return id;
}

const TYPE_STYLE = {
  success: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800", icon: "✓" },
  info: { bg: "bg-sky-50 border-sky-200", text: "text-sky-800", icon: "ℹ" },
  warning: { bg: "bg-amber-50 border-amber-200", text: "text-amber-800", icon: "⚠" },
};

function ToastItem({ toast, onRemove }) {
  const style = TYPE_STYLE[toast.type] || TYPE_STYLE.info;

  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 5000);
    return () => clearTimeout(t);
  }, [toast.id, onRemove]);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm animate-[slideInRight_0.3s_cubic-bezier(0.22,1,0.36,1)] ${style.bg}`}
    >
      <span className={`text-base font-bold shrink-0 ${style.text}`}>{style.icon}</span>
      <p className={`text-sm font-medium flex-1 ${style.text}`}>{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className={`text-xs opacity-50 hover:opacity-100 shrink-0 ${style.text}`}
      >
        ✕
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
    <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  );
}
