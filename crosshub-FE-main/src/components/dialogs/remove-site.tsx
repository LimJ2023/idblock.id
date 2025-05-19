import { deleteSite } from "@/api/sites.api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { cn } from "@/lib/utils";
import { queries } from "@/queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const RemoveSiteDialog = ({ selected }: { selected: number }) => {
  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation({
    mutationFn: deleteSite,
  });

  const handleRemove = async () => {
    if (!selected) {
      return;
    }

    const results = await mutateAsync({ id: selected });

    if (!results.success) {
      return;
    }

    queryClient.invalidateQueries(queries.sites.all);
    return;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variants="secondary"
          className="border border-[#D8D7DB] bg-[#F3F4F8] font-pretendard text-black hover:text-white"
        >
          선택 삭제
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-8 rounded-[1.25rem] font-pretendard">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            ‘삭제’ 하시겠습니까?
          </DialogTitle>
        </DialogHeader>

        <DialogFooter className="flex justify-center gap-2">
          <DialogClose asChild>
            <Button
              className={cn(
                "h-[3.75rem] w-full rounded-2xl border border-[#D8D7DB] bg-[#F3F4F8] font-pretendard text-xl text-black hover:text-white",
              )}
              variants={"secondary"}
            >
              아니오
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              className={cn(
                "h-[3.75rem] w-full rounded-2xl font-pretendard text-xl",
              )}
              variants={"default"}
              onClick={handleRemove}
            >
              예
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { RemoveSiteDialog };
