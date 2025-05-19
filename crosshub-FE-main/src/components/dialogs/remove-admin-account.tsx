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

import { cn } from "@/lib/utils";
import { type SubmitHandler, useForm } from "react-hook-form";

import { removeAdmin, RemoveAdmin } from "@/api/admin.api";
import { useToast } from "@/hooks/use-toast";
import { queries } from "@/queries";

const RemoveAdminAccountDialog = ({
  id,
  name,
}: {
  id: number;
  name: string;
}) => {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const {
    handleSubmit,
    formState: { isLoading, isValid },
  } = useForm<RemoveAdmin>({ mode: "onSubmit" });

  const { mutateAsync } = useMutation({ mutationFn: removeAdmin });

  const [isOpen, setIsOpen] = useState(false);

  const onValid: SubmitHandler<RemoveAdmin> = async () => {
    const result = await mutateAsync({ id });

    if (result.success) {
      console.log("Success");
      toast({
        title: "관리자 삭제 성공",
        description: "관리자가 삭제되었습니다.",
      });
      queryClient.invalidateQueries(queries.admin.all);
      return;
    }

    console.log("Failed");
    toast({
      title: "관리자 삭제 실패",
      description: "관리자 삭제에 실패하었습니다.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="w-fit" asChild>
        <Button className="font-pretendard" variants="link">
          삭제하기
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-8 rounded-[1.25rem]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">관리자 삭제</DialogTitle>
          <DialogDescription className="sr-only">
            관리자 계정을 삭제할 수 있는 다이얼로그입니다.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-7">
          <section className="flex items-center justify-center">
            {name} 관리자를 삭제합니다.
          </section>
          <DialogFooter className="flex flex-col gap-2">
            <DialogClose asChild>
              <Button
                disabled={!isValid || isLoading}
                type="submit"
                className={cn(
                  "h-[3.75rem] rounded-2xl bg-[#232323] font-pretendard text-xl",
                  "hover:bg-red-600",
                )}
              >
                삭제
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

export { RemoveAdminAccountDialog };
