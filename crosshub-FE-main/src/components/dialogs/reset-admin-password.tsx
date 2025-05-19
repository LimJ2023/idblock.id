import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { cn } from "@/lib/utils";
import { SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";

import { resetAdminPassword, type ResetAdminPassword } from "@/api/admin.api";
import { useToast } from "@/hooks/use-toast";

const ResetAdminPasswordDialog = ({ id }: { id: number }) => {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { isLoading, isValid, errors },
  } = useForm<ResetAdminPassword>({ mode: "onSubmit" });

  const { mutateAsync } = useMutation({ mutationFn: resetAdminPassword });

  const [isOpen, setIsOpen] = useState(false);

  const onValid: SubmitHandler<ResetAdminPassword> = async (data) => {
    const result = await mutateAsync({ id, password: data.password });

    if (result.success) {
      console.log("Success");
      toast({
        title: "비밀번호 재설정 성공",
        description: "비밀번호가 재설정 되었습니다.",
      });

      return;
    }

    console.log("Failed");
    toast({
      title: "비밀번호 재설정 실패",
      description: "비밀번호 재설정에 실패하였습니다.",
      variant: "destructive",
    });
  };

  const onInvalid: SubmitErrorHandler<ResetAdminPassword> = (errors) => {
    console.error(errors);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="w-fit" asChild>
        <Button className="font-pretendard" variants="link">
          비밀번호 재설정
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-8 rounded-[1.25rem]">
        <DialogHeader>
          <DialogTitle className="text-xl">관리자 추가</DialogTitle>
          <DialogDescription className="sr-only">
            새로운 비밀번호를 입력받아 관리자 비밀번호를 재설정할 수 있는
            다이얼로그입니다.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onValid, onInvalid)}
          className="flex flex-col gap-7"
        >
          <div className="flex flex-col gap-2">
            <Label
              aria-required
              htmlFor="email"
              className="font-pretendard text-neutral-600"
            >
              비밀번호
            </Label>
            <Input
              {...register("password", { required: true })}
              type="password"
              placeholder="관리자 비밀번호를 입력해주세요."
              disabled={isLoading}
              className={cn(
                "h-14 rounded-[1.25rem] border-[#CECECE] bg-white px-6 font-pretendard text-base font-normal",
                "placeholder:text-base placeholder:text-[#AEAEAE]",
              )}
            />
            {errors.password && (
              <p className="text-xs text-[#FF0000]">비밀번호를 입력하세요.</p>
            )}
          </div>
          <DialogFooter className="flex flex-col gap-2">
            <DialogClose asChild>
              <Button
                disabled={!isValid || isLoading}
                type="submit"
                className={cn(
                  "h-[3.75rem] rounded-2xl bg-[#232323] font-pretendard text-xl",
                  "hover:bg-[#232323]/80",
                )}
              >
                재설정
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                variants="secondary"
                className={cn(
                  "h-[3.75rem] rounded-2xl bg-white font-pretendard text-xl text-black",
                  "hover:bg-neutral-200",
                )}
              >
                취소
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { ResetAdminPasswordDialog };
