"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
import { showError } from "@/utils/toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { User, fetchUsers, performCheckin } from "@/services/checkinService";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { SuccessDialog } from "@/components/SuccessDialog";
import { Highlight } from "@/components/Highlight";
import { LoadingOverlay } from "@/components/LoadingOverlay";

const CheckinPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isFormActive, setIsFormActive] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: users = [], isLoading: isLoadingUsers, isError: isFetchError } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  useEffect(() => {
    if (users.length > 0) {
      const searchTerms = normalizeString(searchValue).split(' ').filter(Boolean);
      
      if (searchTerms.length === 0) {
        setFilteredUsers(users);
        return;
      }

      const newlyFiltered = users.filter(user => {
        const normalizedValue = normalizeString(user.name);
        return searchTerms.every(term => normalizedValue.includes(term));
      });

      if (newlyFiltered.length > 0) {
        setFilteredUsers(newlyFiltered);
      } else if (searchValue === "") {
        setFilteredUsers(users);
      }
    }
  }, [searchValue, users]);


  const checkinMutation = useMutation({
    mutationFn: performCheckin,
    onMutate: () => {
      setIsProcessing(true);
    },
    onSuccess: () => {
      setTimeout(() => {
        setIsProcessing(false);
        setIsConfirmDialogOpen(false);
        setIsSuccessDialogOpen(true);
        queryClient.invalidateQueries({ queryKey: ["users"] });
      }, 5000);
    },
    onError: (error) => {
      setIsProcessing(false);
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
    navigate("/documents");
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

    const sortedUsers = [...filteredUsers].sort((a, b) => {
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
  }, [filteredUsers]);

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
    if (isLoadingUsers) return <Skeleton className="h-10 w-full" />;
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
          <Button variant="outline" role="combobox" className="w-full justify-between h-11">
            {selectedUser ? selectedUser.name : "Mời nhập tên"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" sideOffset={8} className="w-[--radix-popover-trigger-width] p-0">
          <Command filter={() => 1}>
            <CommandInput placeholder="Tìm tên Đại biểu..." value={searchValue} onValueChange={setSearchValue} />
            <CommandList>
              <CommandEmpty />
              
              {Object.keys(groupedNotCheckedInUsers).sort((a, b) => {
                if (a === '#') return 1;
                if (b === '#') return -1;
                return a.localeCompare(b, 'vi');
              }).map(letter => (
                <CommandGroup heading={letter} key={letter}>
                  {groupedNotCheckedInUsers[letter].map(user => (
                    <CommandItem key={user.id} value={user.name} onSelect={() => handleUserSelect(user)}>
                      <Check className={cn("mr-2 h-4 w-4", selectedUser?.name === user.name ? "opacity-100" : "opacity-0")} />
                      {renderName(user.name)}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}

              {checkedInUsers.length > 0 && (
                <CommandGroup heading="Đã Điểm Danh">
                  {checkedInUsers.map(user => (
                    <CommandItem key={user.id} value={user.name} disabled={true} className="text-muted-foreground">
                      <Check className="mr-2 h-4 w-4" />
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
    <>
      <LoadingOverlay show={isProcessing} message="Đang xử lý..." />
      <div className={cn("w-full px-4 flex justify-center items-start min-h-screen transition-[padding-top] duration-700 ease-in-out", isFormActive ? "pt-16 md:pt-24" : "pt-[30vh]")}>
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl">Điểm Danh</CardTitle>
            <CardDescription className="text-base pt-1">Nhập tên Đại biểu</CardDescription>
          </CardHeader>
          <CardContent>{renderUserSearch()}</CardContent>
        </Card>
        <ConfirmationDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen} user={selectedUser} onConfirm={handleCheckinConfirm} isPending={isProcessing} />
        <SuccessDialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen} user={selectedUser} onClose={handleSuccessDialogClose} />
      </div>
    </>
  );
};

export default CheckinPage;