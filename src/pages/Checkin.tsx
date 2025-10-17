"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Terminal } from "lucide-react";

import { cn, normalizeString } from "@/lib/utils";
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
import { Highlight } from "@/components/Highlight";

const CheckinPage = () => {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isFormActive, setIsFormActive] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const { data: users = [], isLoading: isLoadingUsers, isError: isFetchError } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const checkinMutation = useMutation({
    mutationFn: performCheckin,
    onMutate: () => {
      return showLoading(`Đang thực hiện điểm danh cho ${selectedUser?.name}...`);
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
      showError("Điểm danh thất bại. Vui lòng thử lại.");
    },
  });

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setIsComboboxOpen(false);
    setSearchValue("");
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
    if (!open) {
      setSearchValue("");
    }
  };

  const { checkedInUsers, groupedNotCheckedInUsers } = useMemo(() => {
    const getLastName = (fullName: string): string => fullName.split(' ').pop() || '';

    const sortedUsers = [...users].sort((a, b) => {
      const lastNameA = getLastName(a.name);
      const lastNameB = getLastName(b.name);
      const compareLast = lastNameA.localeCompare(lastNameB, 'vi');
      if (compareLast !== 0) return compareLast;
      return a.name.localeCompare(b.name, 'vi');
    });

    const notCheckedIn = sortedUsers.filter(user => !user.checkin);
    const checkedIn = sortedUsers.filter(user => user.checkin);
    
    const grouped = notCheckedIn.reduce((acc, user) => {
      const lastName = getLastName(user.name);
      if (!lastName) return acc;
      const firstLetter = lastName.charAt(0).toUpperCase();
      
      // Gom các tên không bắt đầu bằng chữ cái vào nhóm '#'
      const groupKey = firstLetter.match(/\p{L}/u) ? firstLetter : '#';

      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(user);
      return acc;
    }, {} as Record<string, User[]>);

    return { 
      checkedInUsers: checkedIn,
      groupedNotCheckedInUsers: grouped
    };
  }, [users]);

  const commandFilter = (value: string, search: string) => {
    if (normalizeString(value).includes(normalizeString(search))) return 1;
    return 0;
  };

  const renderName = (fullName: string) => {
    if (searchValue.trim()) {
      return <Highlight text={fullName} highlight={searchValue} />;
    }
    const parts = fullName.split(' ');
    if (parts.length === 1) {
      return <strong className="font-bold">{fullName}</strong>;
    }
    const lastName = parts.pop() || '';
    const firstName = parts.join(' ');
    return (
      <span>
        {firstName}{' '}
        <strong className="font-bold">{lastName}</strong>
      </span>
    );
  };

  const renderUserSearch = () => {
    if (isLoadingUsers) return <Skeleton className="h-12 w-full" />;
    if (isFetchError) return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Lỗi</AlertTitle>
        <AlertDescription>Không thể tải danh sách người dùng.</AlertDescription>
      </Alert>
    );

    return (
      <Popover open={isComboboxOpen} onOpenChange={handlePopoverOpenChange}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="w-full justify-between text-lg h-12">
            {selectedUser ? selectedUser.name : "Mời nhập tên"}
            <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command filter={commandFilter}>
            <CommandInput placeholder="Tìm tên Đại biểu..." value={searchValue} onValueChange={setSearchValue} className="h-12 text-lg" />
            <CommandList>
              <CommandEmpty className="p-4 text-lg">Không tìm thấy Đại biểu.</CommandEmpty>
              
              {Object.keys(groupedNotCheckedInUsers).sort((a, b) => {
                if (a === '#') return 1; // Đưa nhóm '#' xuống cuối
                if (b === '#') return -1;
                return a.localeCompare(b, 'vi');
              }).map(letter => (
                <CommandGroup heading={letter} key={letter}>
                  {groupedNotCheckedInUsers[letter].map(user => (
                    <CommandItem key={user.id} value={user.name} onSelect={() => handleUserSelect(user)} className="text-lg py-3">
                      <Check className={cn("mr-3 h-5 w-5", selectedUser?.name === user.name ? "opacity-100" : "opacity-0")} />
                      {renderName(user.name)}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}

              {checkedInUsers.length > 0 && (
                <CommandGroup heading="Đã Điểm Danh">
                  {checkedInUsers.map(user => (
                    <CommandItem key={user.id} value={user.name} disabled={true} className="text-muted-foreground text-lg py-3">
                      <Check className="mr-3 h-5 w-5" />
                      {renderName(user.name)}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div className={cn("w-full px-4 flex justify-center items-start min-h-screen transition-[padding-top] duration-700 ease-in-out", isFormActive ? "pt-16 md:pt-24" : "pt-[30vh]")}>
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-3xl">Điểm Danh</CardTitle>
          <CardDescription className="text-lg pt-1">Nhập tên Đại biểu</CardDescription>
        </CardHeader>
        <CardContent>{renderUserSearch()}</CardContent>
      </Card>
      <ConfirmationDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen} user={selectedUser} onConfirm={handleCheckinConfirm} isPending={checkinMutation.isPending} />
      <SuccessDialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen} user={selectedUser} onClose={handleSuccessDialogClose} />
    </div>
  );
};

export default CheckinPage;