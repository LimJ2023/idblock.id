import { deleteUser } from "@/api/users.api";
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
import { Spinner } from "../ui/spinner";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { queries } from "@/queries";
import { CircleX } from "lucide-react";

const DeleteUserDialog = ({
  selected,
  onSuccess,
}: {
  selected: string;
  onSuccess: () => void;
}) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({ mutationFn: deleteUser });

  const handleDelete = async () => {
    // setMessage(MESSAGES.INITIAL);

    // if (!selected) {
    //   setMessage(MESSAGES.NONE);
    //   return;
    // }

    await mutateAsync(selected);
    onSuccess();

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
          className="border border-[#FCCCCC] bg-[#FEF1F1] font-pretendard text-[#EE0000] hover:bg-[#EE0000] hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <CircleX />
          삭제
        </Button>
      </DialogTrigger>

      <DialogContent className="gap-8 rounded-[1rem] font-pretendard">
        <DialogHeader className="flex-col gap-3">
          <DialogTitle className="text-center text-2xl">
            사용자 삭제
          </DialogTitle>
          <DialogDescription className="text-center font-normal">
            해당 사용자를 삭제하시겠습니까?
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
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? <Spinner /> : <span>확인</span>}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { DeleteUserDialog };
