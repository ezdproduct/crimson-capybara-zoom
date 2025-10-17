"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { showError, showSuccess, showLoading, dismissToast } from "@/utils/toast";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string; // Chức vụ
  department: string; // Phòng ban
  note: string; // Ghi chú
}

const CheckinPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        // URL GET
        const response = await fetch("https://n8n.probase.tech/webhook/checkin");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        
        // Cập nhật logic ánh xạ dữ liệu dựa trên cấu trúc mới
        const formattedUsers = data
          .filter((user: any) => user["Họ và tên"]) // Chỉ lấy những người có tên
          .map((user: any) => ({
            id: user.row_number ? String(user.row_number) : user["Họ và tên"],
            name: user["Họ và tên"],
            email: user.email || "", 
            phone: user.phone || "N/A",
            position: user.position || user["Chức vụ"] || "N/A",
            department: user.department || "N/A",
            note: user.note || "",
          }));
          
        setUsers(formattedUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        showError("Không thể tải danh sách người dùng.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleCheckin = async () => {
    if (!selectedUser) {
      showError("Vui lòng chọn một người dùng để check-in.");
      return;
    }

    setIsSubmitting(true);
    const toastId = showLoading("Đang thực hiện check-in...");

    try {
      // URL POST
      const response = await fetch("https://n8n.probase.tech/webhook-test/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedUser),
      });

      dismissToast(toastId);

      if (response.ok) {
        showSuccess(`Check-in thành công cho ${selectedUser.name}!`);
        setSelectedUser(null); // Reset form
      } else {
        showError("Check-in thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      dismissToast(toastId);
      console.error("Failed to submit check-in:", error);
      showError("Đã xảy ra lỗi khi gửi dữ liệu.");
    } finally {
      setIsSubmitting(false);
    }
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
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="user-search">Tìm kiếm người dùng</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {selectedUser
                        ? selectedUser.name
                        : "Chọn người dùng..."}
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
                              onSelect={(currentValue) => {
                                const userToSelect = users.find(
                                  (u) => u.name.toLowerCase() === currentValue.toLowerCase()
                                );
                                setSelectedUser(userToSelect || null);
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedUser?.name === user.name
                                    ? "opacity-100"
                                    : "opacity-0"
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

              {selectedUser && (
                <div className="space-y-3 pt-4 border-t">
                    <h3 className="font-semibold text-lg">Thông tin người dùng</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="name">Tên</Label>
                      <Input id="name" value={selectedUser.name} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input id="phone" value={selectedUser.phone} readOnly />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="position">Chức vụ</Label>
                    <Input id="position" value={selectedUser.position} readOnly />
                  </div>
                  
                  <div>
                    <Label htmlFor="department">Phòng ban</Label>
                    <Input id="department" value={selectedUser.department} readOnly />
                  </div>

                  <div>
                    <Label htmlFor="note">Ghi chú</Label>
                    <Input id="note" value={selectedUser.note} readOnly />
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleCheckin}
            disabled={!selectedUser || isSubmitting || isLoading}
            className="w-full"
          >
            {isSubmitting ? "Đang xử lý..." : "Check-in"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CheckinPage;