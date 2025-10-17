"use client";

import * as React from "react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Terminal } from "lucide-react";

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
import { showError, showLoading, dismissToast } from "@/utils/toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { User, fetchUsers, performCheckin } from "@/services/checkinService";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { SuccessDialog } from "@/components/SuccessDialog";

const CheckinPage = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  const { data: users = [], isLoading: isLoadingUsers, isError: isFetchError } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

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

  const renderUserSearch = () => {
    if (isLoadingUsers) {
      return <Skeleton className="h-10 w-full" />;
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
          {renderUserSearch()}
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        user={selectedUser}
        onConfirm={handleCheckinConfirm}
        isPending={checkinMutation.isPending}
      />

      <SuccessDialog
        open={isSuccessDialogOpen}
        onOpenChange={setIsSuccessDialogOpen}
        user={selectedUser}
        onClose={handleSuccessDialogClose}
      />
    </div>
  );
};

export default CheckinPage;