import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { NewUser, registerUser } from "@/services/checkinService";
import { showError } from "@/utils/toast";

const formSchema = z.object({
  name: z.string().min(2, { message: "Họ và tên là bắt buộc." }),
  position: z.string().min(2, { message: "Chức vụ là bắt buộc." }),
  gender: z.enum(["Nam", "Nữ"], { required_error: "Vui lòng chọn giới tính." }),
});

interface RegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newUser: NewUser) => void;
}

export const RegistrationDialog = ({ open, onOpenChange, onSuccess }: RegistrationDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      position: "",
      gender: "Nam",
    },
  });

  const mutation = useMutation({
    mutationFn: (newUser: NewUser) => registerUser(newUser),
    onSuccess: (_, variables) => {
      form.reset();
      onSuccess(variables);
    },
    onError: () => {
      showError("Đăng ký thất bại. Vui lòng thử lại.");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Sử dụng type assertion vì zodResolver đảm bảo các trường là bắt buộc
    mutation.mutate(values as NewUser);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nhập bổ sung Đại biểu</DialogTitle>
          <DialogDescription>
            Điền thông tin của Đại biểu mới vào form bên dưới.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Nguyễn Văn A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chức vụ</FormLabel>
                  <FormControl>
                    <Input placeholder="Chức vụ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Giới tính</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex items-center space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Nam" />
                        </FormControl>
                        <FormLabel className="font-normal">Nam</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Nữ" />
                        </FormControl>
                        <FormLabel className="font-normal">Nữ</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Đang xử lý..." : "Đăng ký"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};