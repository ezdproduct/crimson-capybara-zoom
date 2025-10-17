import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  show: boolean;
  message?: string;
}

export const LoadingOverlay = ({ show, message = "Đang xử lý..." }: LoadingOverlayProps) => {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4 text-white">
        <Loader2 className="h-16 w-16 animate-spin" />
        <p className="text-xl font-semibold">{message}</p>
      </div>
    </div>
  );
};