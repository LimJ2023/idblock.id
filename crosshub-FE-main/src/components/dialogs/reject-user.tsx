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
      <DialogContent className="gap-8 rounded-[1.25rem]">
        <DialogHeader>
          <DialogTitle className="text-xl">‘거절’ 하시겠습니까?</DialogTitle>
          <DialogDescription className="sr-only">
            사용자 승인을 거절하는 다이얼로그입니다.
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
              거절 사유
            </Label>
            <Textarea
              {...register("reason", { required: true })}
              placeholder="거절 사유를 입력해주세요."
              disabled={isLoading}
              className={cn(
                "h-14 rounded-[1.25rem] border-[#CECECE] bg-white px-6 font-pretendard text-base font-normal",
                "placeholder:text-base placeholder:text-[#AEAEAE]",
              )}
            />
            {errors.reason && (
              <p className="text-xs text-[#FF0000]">거절 사유를 입력하세요.</p>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <DialogClose asChild>
              <Button
                variants="secondary"
                className={cn(
                  "h-[3.75rem] flex-1 rounded-2xl bg-white font-pretendard text-xl text-black",
                  "hover:bg-neutral-200",
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
                  "h-[3.75rem] flex-1 rounded-2xl bg-primary font-pretendard text-xl",
                  "hover:bg-[#232323]/80",
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
