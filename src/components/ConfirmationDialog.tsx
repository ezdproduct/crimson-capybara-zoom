import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { User } from "@/services/checkinService";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onConfirm: () => void;
  isPending: boolean;
}

export const ConfirmationDialog = ({
  open,
  onOpenChange,
  user,
  onConfirm,
  isPending,
}: ConfirmationDialogProps) => {
  if (!user) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl">Xác nhận thông tin điểm danh</AlertDialogTitle>
        </AlertDialogHeader>
        
        <div className="space-y-3 p-4 border rounded-md bg-muted/50 text-lg">
          <p><strong>Tên Đại Biểu:</strong> {user.name}</p>
          <p><strong>Chức vụ:</strong> {user.position}</p>
          {user.department && user.department !== "N/A" && <p><strong>Phòng ban:</strong> {user.department}</p>}
          {user.note && <p><strong>Ghi chú:</strong> {user.note}</p>}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending} className="h-11 px-6 text-base">Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isPending} className="h-11 px-6 text-base">
            {isPending ? "Đang xử lý..." : "Điểm Danh"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};