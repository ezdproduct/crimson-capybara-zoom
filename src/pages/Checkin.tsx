"use client";

import * as React from "react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Terminal, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { showError, showSuccess, showLoading, dismissToast } from "@/utils/toast";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Định nghĩa kiểu dữ liệu User
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  note: string;
}

// Hàm API để lấy danh sách người dùng
const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch("https://n8n.probase.tech/webhook/checkin");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  
  // Lọc và ánh xạ dữ liệu
  return data
    .filter((user: any) => user["Họ và tên"])
    .map((user: any) => ({
      id: user.row_number ? String(user.row_number) : user["Họ và tên"],
      name: user["Họ và tên"],
      email: user.email || "",
      phone: user.phone || "N/A",
      position: user.position || user["Chức vụ"] || "N/A",
      department: user.department || "N/A",
      note: user.note || "",
    }));
};

// Hàm API để thực hiện check-in
const performCheckin = async (user: User): Promise<Response> => {
  const response = await fetch("https://n8n.probase.tech/webhook-test/xac-nhan-check-in", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    throw new Error("Check-in failed");
  }
  return response;
};

const CheckinPage = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  // Sử dụng React Query để lấy dữ liệu người dùng
  const { data: users = [], isLoading: isLoadingUsers, isError: isFetchError } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  // Sử dụng React Query để thực hiện check-in
  const checkinMutation = useMutation({
    mutationFn: performCheckin,
    onMutate: () => {
      return showLoading(`Đang thực hiện check-in cho ${selectedUser?.name}...`);
    },
    onSuccess: (_, __, toastId) => {
      dismissToast(toastId as string | number);
      setIsConfirmDialogOpen(false);
      setIsSuccessDialogOpen(true);
    },
    onError: (error, _, toastId) => {
      if (toastId) dismissToast(toastId as string | number);
      console.error("Failed to submit check-in:", error);
      showError("Check-in thất bại. Vui lòng thử lại.");
    },
  });

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setIsComboboxOpen(false);
    setIsConfirmDialogOpen(true);
  };

  const handleCheckinConfirm = () => {
    if (selectedUser) {
      checkinMutation.mutate(selectedUser);
    }
  };

  const handleSuccessDialogClose = () => {
    setIsSuccessDialogOpen(false);
    setSelectedUser(null);
  };

  const renderContent = () => {
    if (isLoadingUsers) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }

    if (isFetchError) {
      return (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>
            Không thể tải danh sách người dùng. Vui lòng thử lại sau.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div>
        <Label htmlFor="user-search">Tìm kiếm người dùng</Label>
        <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isComboboxOpen}
              className="w-full justify-between"
            >
              {selectedUser ? selectedUser.name : "Chọn người dùng..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder="Tìm tên..." />
              <CommandList>
                <CommandEmpty>Không tìm thấy người dùng.</CommandEmpty>
                <CommandGroup>
                  {users.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={user.name}
                      onSelect={() => handleUserSelect(user)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedUser?.name === user.name ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {user.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 flex justify-center items-start min-h-screen">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Check-in</CardTitle>
          <CardDescription>
            Tìm kiếm và chọn người dùng để thực hiện check-in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận Check-in</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn check-in cho người dùng này không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {selectedUser && (
            <div className="space-y-2 p-4 border rounded-md bg-muted/50">
              <p><strong>Tên:</strong> {selectedUser.name}</p>
              <p><strong>Chức vụ:</strong> {selectedUser.position}</p>
              {selectedUser.department && <p><strong>Phòng ban:</strong> {selectedUser.department}</p>}
              {selectedUser.note && <p><strong>Ghi chú:</strong> {selectedUser.note}</p>}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={checkinMutation.isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCheckinConfirm} 
              disabled={checkinMutation.isPending}
            >
              {checkinMutation.isPending ? "Đang xử lý..." : "Check-in"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Dialog */}
      <AlertDialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader className="flex flex-col items-center text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <AlertDialogTitle className="text-2xl">Check-in Thành Công!</AlertDialogTitle>
            <AlertDialogDescription className="pt-2">
              Đã xác nhận check-in thành công cho <strong>{selectedUser?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction onClick={handleSuccessDialogClose}>
              Tuyệt vời!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CheckinPage;