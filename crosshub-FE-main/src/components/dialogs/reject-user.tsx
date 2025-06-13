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

import { Label } from "@/components/ui/label";

import { cn } from "@/lib/utils";
import { SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";

import { useToast } from "@/hooks/use-toast";
import { rejectUser, RejectUser } from "@/api/users.api";
import { Textarea } from "../ui/textarea";
import { queries } from "@/queries";
import { CircleX } from "lucide-react";

const RejectUserDialog = ({ id }: { id: string }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { isLoading, isValid, errors },
  } = useForm<RejectUser>({ mode: "onSubmit" });

  const { mutateAsync } = useMutation({ mutationFn: rejectUser });

  const [isOpen, setIsOpen] = useState(false);

  const onValid: SubmitHandler<RejectUser> = async (data) => {
    const result = await mutateAsync({ documentId: id, reason: data.reason });

    if (result.success) {
      console.log("Success");
      toast({
        title: "거절 성공",
        description: "승인이 거절 되었습니다.",
      });
      queryClient.invalidateQueries(queries.users.all());

      return;
    }

    console.log("Failed");
    toast({
      title: "거절 실패",
      description: "승인 거절에 실패하였습니다.",
      variant: "destructive",
    });
  };

  const onInvalid: SubmitErrorHandler<RejectUser> = (errors) => {
    console.error(errors);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="w-fit" asChild>
        <Button
          variants="secondary"
          className="border border-[#D8D7DB] bg-[#FEF1F1] font-pretendard text-[#F23B3B] hover:bg-[#F23B3B] hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <CircleX />
          거절
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-14 rounded-[1rem]">
        <DialogHeader className="flex-col gap-3">
          <DialogTitle className="text-center text-2xl">
            사용자 거절
          </DialogTitle>
          <DialogDescription className="text-center font-normal">
            해당 사용자의 회원가입을 거절하시겠습니까?
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onValid, onInvalid)}
          className="flex flex-col gap-7"
        >
          <div className="flex flex-col gap-3">
            <Label
              aria-required
              htmlFor="email"
              className="font-pretendard text-neutral-600"
            >
              거절 사유
            </Label>
            <Textarea
              {...register("reason", { required: true })}
              placeholder="거절 사유를 입력해주세요."
              disabled={isLoading}
              className={cn(
                "h-20 rounded-[0.5rem] border-[#CECECE] bg-white px-6 font-pretendard text-sm font-normal",
                "placeholder:text-sm placeholder:font-normal placeholder:text-[#AEAEAE]",
              )}
            />
            {errors.reason && (
              <p className="text-base text-xs text-[#FF0000]">
                거절 사유를 입력하세요.
              </p>
            )}
          </div>
          <DialogFooter className="flex justify-center gap-4">
            <DialogClose asChild>
              <Button
                variants="secondary"
                className={cn(
                  "h-[2.5rem] w-[5rem] rounded-lg border border-[#D8D7DB] bg-[#F3F4F8] font-pretendard text-base text-black hover:bg-[#415776] hover:text-white",
                )}
              >
                아니오
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                disabled={!isValid || isLoading}
                type="submit"
                className={cn(
                  "h-[2.5rem] w-[5rem] rounded-lg font-pretendard text-base",
                )}
              >
                예
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { RejectUserDialog };
