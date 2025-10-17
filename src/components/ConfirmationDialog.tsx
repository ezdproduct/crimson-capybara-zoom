import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
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
          <AlertDialogTitle>Xác nhận Check-in</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn check-in cho người dùng này không?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-2 p-4 border rounded-md bg-muted/50">
          <p><strong>Tên:</strong> {user.name}</p>
          <p><strong>Chức vụ:</strong> {user.position}</p>
          {user.department && <p><strong>Phòng ban:</strong> {user.department}</p>}
          {user.note && <p><strong>Ghi chú:</strong> {user.note}</p>}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isPending}>
            {isPending ? "Đang xử lý..." : "Check-in"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};