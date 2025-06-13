import { deleteSite } from "@/api/sites.api";
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
import { CircleX } from "lucide-react";

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
          className="border border-[#D8D7DB] bg-[#FEF1F1] font-pretendard text-[#F23B3B] hover:bg-[#F23B3B] hover:text-white"
        >
          <CircleX />
          삭제
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-8 rounded-[1rem] font-pretendard">
        <DialogHeader className="flex-col gap-3">
          <DialogTitle className="text-center text-2xl">
            관광지 삭제
          </DialogTitle>
          <DialogDescription className="text-center font-normal">
            해당 관광지를 삭제하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        <section className="flex items-center justify-center text-lg">
          {/* {message} */}
        </section>

        <DialogFooter className="flex justify-center gap-4">
          <DialogClose asChild>
            <Button
              className={cn(
                "h-[2.5rem] rounded-lg border border-[#D8D7DB] bg-[#F3F4F8] font-pretendard text-base text-black hover:bg-[#415776] hover:text-white",
              )}
              variants={"secondary"}
            >
              취소
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              className={cn("h-[2.5rem] rounded-lg font-pretendard text-base")}
              variants={"default"}
              onClick={handleRemove}
            >
              삭제
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { RemoveSiteDialog };
