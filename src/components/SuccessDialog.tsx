import { CheckCircle2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { User } from "@/services/checkinService";

interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onClose: () => void;
}

export const SuccessDialog = ({
  open,
  onOpenChange,
  user,
  onClose,
}: SuccessDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader className="flex flex-col items-center text-center">
          <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 text-green-500 mb-4" />
          <AlertDialogTitle className="text-xl sm:text-2xl">Điểm Danh Thành Công!</AlertDialogTitle>
          <AlertDialogDescription className="pt-2 text-base">
            Đã xác nhận điểm danh thành công cho <strong>{user?.name}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction onClick={onClose}>
            Tra cứu tài liệu đại hội
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};