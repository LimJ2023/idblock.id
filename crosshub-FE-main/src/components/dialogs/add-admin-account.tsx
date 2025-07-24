import { useMutation, useQueryClient } from "@tanstack/react-query";
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

import { createAdmin, type AddAdmin } from "@/api/admin.api";
import { queries } from "@/queries";

const AddAdminAccountDialog = () => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { isLoading, isValid, errors },
  } = useForm<AddAdmin>({ mode: "onSubmit" });

  const { mutateAsync } = useMutation({ mutationFn: createAdmin });

  const [isOpen, setIsOpen] = useState(false);

  const onValid: SubmitHandler<AddAdmin> = async (data) => {
    const result = await mutateAsync(data);

    if (result.success) {
      
      queryClient.invalidateQueries(queries.admin.all);
      setIsOpen(false);
    }
  };

  const onInvalid: SubmitErrorHandler<AddAdmin> = (errors) => {
    console.error(errors);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="font-pretendard" variants="secondary">
          관리자 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-8 rounded-[1.25rem]">
        <DialogHeader>
          <DialogTitle className="text-xl">관리자 추가</DialogTitle>
          <DialogDescription className="sr-only">
            관리자 계정 정보를 입력받아 새로운 관리자를 생성할 수 있는
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
              아이디
            </Label>
            <Input
              {...register("email", { required: true })}
              placeholder="관리자 아이디를 입력해주세요."
              className={cn(
                "h-14 rounded-[1.25rem] border-[#CECECE] bg-white px-6 font-pretendard text-base font-normal",
                "placeholder:text-base placeholder:text-[#AEAEAE]",
              )}
            />
            {errors.email && (
              <p className="text-xs text-[#FF0000]">아이디를 입력하세요.</p>
            )}
          </div>
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
              className={cn(
                "h-14 rounded-[1.25rem] border-[#CECECE] bg-white px-6 font-pretendard text-base font-normal",
                "placeholder:text-base placeholder:text-[#AEAEAE]",
              )}
            />
            {errors.password && (
              <p className="text-xs text-[#FF0000]">비밀번호를 입력하세요.</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label
              aria-required
              htmlFor="email"
              className="font-pretendard text-neutral-600"
            >
              이름
            </Label>
            <Input
              {...register("name", { required: true })}
              placeholder="관리자 이름을 입력해주세요."
              className={cn(
                "h-14 rounded-[1.25rem] border-[#CECECE] bg-white px-6 font-pretendard text-base font-normal",
                "placeholder:text-base placeholder:text-[#AEAEAE]",
              )}
            />
            {errors.name && (
              <p className="text-xs text-[#FF0000]">이름을 입력하세요.</p>
            )}
          </div>
          <DialogFooter className="flex flex-col gap-2">
            <Button
              disabled={!isValid || isLoading}
              type="submit"
              className={cn(
                "h-[3.75rem] rounded-2xl bg-[#232323] font-pretendard text-xl",
                "hover:bg-[#232323]/80",
              )}
            >
              추가
            </Button>
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

export { AddAdminAccountDialog };
