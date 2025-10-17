"use client";

import * as React from "react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Skeleton } from "@/components/ui/skeleton";
import { showError, showLoading, dismissToast } from "@/utils/toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { User, fetchUsers, performCheckin } from "@/services/checkinService";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { SuccessDialog } from "@/components/SuccessDialog";

const CheckinPage = () => {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isFormActive, setIsFormActive] = useState(false);

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
      queryClient.invalidateQueries({ queryKey: ["users"] });
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

  const handlePopoverOpenChange = (open: boolean) => {
    setIsComboboxOpen(open);
    if (open && !isFormActive) {
      setIsFormActive(true);
    }
  };

  const notCheckedInUsers = users.filter(user => !user.checkin);
  const checkedInUsers = users.filter(user => user.checkin);

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
        <Popover open={isComboboxOpen} onOpenChange={handlePopoverOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isComboboxOpen}
              className="w-full justify-between"
            >
              {selectedUser ? selectedUser.name : "Mời nhập tên"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder="Tìm tên Đại biểu..." />
              <CommandList>
                <CommandEmpty>Không tìm thấy Đại biểu.</CommandEmpty>
                
                {notCheckedInUsers.length > 0 && (
                  <CommandGroup heading="Chưa Check-in">
                    {notCheckedInUsers.map((user) => (
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
                )}

                {checkedInUsers.length > 0 && (
                  <CommandGroup heading="Đã Check-in">
                    {checkedInUsers.map((user) => (
                      <CommandItem
                        key={user.id}
                        value={user.name}
                        disabled={true}
                        className="text-muted-foreground"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        {user.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  return (
    <div className={cn(
      "container mx-auto px-4 flex justify-center items-start min-h-screen transition-[padding-top] duration-700 ease-in-out",
      isFormActive ? "pt-16 md:pt-24" : "pt-[30vh]"
    )}>
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Check-in</CardTitle>
          <CardDescription>
            Nhập tên Đại biểu
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