import { approveUser } from "@/api/users.api";
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
import { queries } from "@/queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "../ui/spinner";
import { CircleCheck } from "lucide-react";

const ApproveUserDialog = ({ selected }: { selected: string }) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({ mutationFn: approveUser });

  const handleApprove = async () => {
    // setMessage(MESSAGES.INITIAL);

    // if (!selected) {
    //   setMessage(MESSAGES.NONE);
    //   return;
    // }

    await mutateAsync(selected);

    // if (!results.success) {
    //   setMessage(MESSAGES.ERROR);
    //   return;
    // }

    // setMessage(MESSAGES.SUCCESS);
    queryClient.invalidateQueries(queries.users.all());
    return;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variants="default"
          className="border border-[#CEE9D4] bg-[#EEF7F0] font-pretendard text-[#008A1E] hover:bg-[#008A1E] hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <CircleCheck />
          승인
        </Button>
      </DialogTrigger>

      <DialogContent className="gap-8 rounded-[1rem] font-pretendard">
        <DialogHeader className="flex-col gap-3">
          <DialogTitle className="text-center text-2xl">
            사용자 승인
          </DialogTitle>
          <DialogDescription className="text-center font-normal">
            해당 사용자의 회원가입을 승인하시겠습니까?
          </DialogDescription>
        </DialogHeader>
        <section className="flex items-center justify-center text-lg">
          {/* {message} */}
        </section>

        <DialogFooter className="flex justify-center gap-4">
          <DialogClose asChild>
            <Button
              variants={"secondary"}
              className={cn(
                "h-[2.5rem] w-[5rem] rounded-lg border border-[#D8D7DB] bg-[#F3F4F8] font-pretendard text-base text-black hover:bg-[#415776] hover:text-white",
              )}
              disabled={isPending}
            >
              {isPending ? <Spinner /> : <span>취소</span>}
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              className={cn(
                "h-[2.5rem] w-[5rem] rounded-lg font-pretendard text-base",
              )}
              onClick={handleApprove}
              disabled={isPending}
            >
              {isPending ? <Spinner /> : <span>승인</span>}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { ApproveUserDialog };
