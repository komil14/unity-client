import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { id, message, type };

      setToasts((prev) => [...prev, newToast]);

      // Auto remove after 3 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 3000);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto animate-in slide-in-from-bottom-2 fade-in duration-300 flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-lg min-w-[320px] max-w-[420px]"
          >
            {toast.type === "success" && (
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            )}
            {toast.type === "error" && (
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            )}
            {toast.type === "info" && (
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
            )}

            <p className="flex-1 text-sm font-medium text-foreground">
              {toast.message}
            </p>

            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 rounded-full p-1 hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
