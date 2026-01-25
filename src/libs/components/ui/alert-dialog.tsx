import { Heart, X, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "primary" | "warning" | "destructive";
}

export function AlertDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
}: AlertDialogProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  // Determine icon and colors based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case "destructive":
        return {
          iconBg: "bg-destructive/10",
          iconColor: "text-destructive",
          icon: AlertTriangle,
          buttonBg: "bg-destructive hover:bg-destructive/90",
          buttonText: "text-destructive-foreground",
        };
      case "warning":
        return {
          iconBg: "bg-yellow-500/10",
          iconColor: "text-yellow-600",
          icon: AlertTriangle,
          buttonBg: "bg-yellow-600 hover:bg-yellow-600/90",
          buttonText: "text-white",
        };
      default:
        return {
          iconBg: "bg-primary/10",
          iconColor: "text-primary fill-primary",
          icon: Heart,
          buttonBg: "bg-primary hover:bg-primary/90",
          buttonText: "text-white",
        };
    }
  };

  const styles = getVariantStyles();
  const Icon = styles.icon;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`pointer-events-auto w-full max-w-md transform transition-all duration-200 ${
            isOpen
              ? "scale-100 opacity-100 translate-y-0"
              : "scale-95 opacity-0 translate-y-4"
          }`}
        >
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>

            {/* Header with Icon */}
            <div className="px-6 pt-8 pb-4 text-center">
              <div
                className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${styles.iconBg}`}
              >
                <Icon className={`h-8 w-8 ${styles.iconColor}`} />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                {title}
              </h2>
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              <p className="text-center text-sm text-muted-foreground leading-relaxed mb-6">
                {description}
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 h-10 px-4 rounded-lg font-semibold text-sm border border-border bg-background hover:bg-muted transition-colors"
                >
                  {cancelText}
                </button>
                {onConfirm && (
                  <button
                    onClick={handleConfirm}
                    className={`flex-1 h-10 px-4 rounded-lg font-semibold text-sm ${styles.buttonText} ${styles.buttonBg} transition-colors shadow-sm`}
                  >
                    {confirmText}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
