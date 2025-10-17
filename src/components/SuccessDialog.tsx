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
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          <AlertDialogTitle className="text-2xl">Điểm Danh Thành Công!</AlertDialogTitle>
          <AlertDialogDescription className="pt-2">
            Đã xác nhận điểm danh thành công cho <strong>{user?.name}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction onClick={onClose}>
            Tuyệt vời!
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};