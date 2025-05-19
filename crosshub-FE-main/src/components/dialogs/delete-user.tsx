import {  deleteUser } from "@/api/users.api";
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

const DeleteUserDialog = ({ selected }: { selected: string }) => {
    
    const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({ mutationFn: deleteUser });

  const handleDelete = async () => {
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
            className="border border-[#D8D7DB] bg-[#F3F4F8] font-pretendard text-black hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            삭제
          </Button>
        </DialogTrigger>
        <DialogContent className="gap-8 rounded-[1.25rem] font-pretendard">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              삭제하시겠습니까?
            </DialogTitle>
            <DialogDescription className=""></DialogDescription>
          </DialogHeader>
          <section className="flex items-center justify-center text-lg">
            {/* {message} */}
          </section>
          <DialogFooter className="flex justify-center gap-2">
            <DialogClose asChild>
              <Button
                variants={"secondary"}
                className={cn(
                  "h-[3.75rem] w-full rounded-2xl border border-[#D8D7DB] bg-[#F3F4F8] font-pretendard text-xl text-black hover:text-white",
                )}
                disabled={isPending}
              >
                {isPending ? <Spinner /> : <span>취소</span>}
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                className={cn(
                  "h-[3.75rem] w-full rounded-2xl font-pretendard text-xl",
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
    )
}

export { DeleteUserDialog };
