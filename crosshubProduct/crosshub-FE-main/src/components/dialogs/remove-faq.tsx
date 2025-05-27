import { deleteMultipleFAQs } from "@/api/faq.api";
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
import { useState } from "react";

const MESSAGES = {
  INITIAL: "",
  SUCCESS: "삭제되었습니다.",
  PARTIAL: "일부 질문의 삭제에 실패했습니다.",
  ERROR: "질문을 삭제할 수 없습니다.",
  NONE: "선택된 질문이 없습니다.",
} as const;

type REMOVE_MESSAGES_KEYS = (typeof MESSAGES)[keyof typeof MESSAGES];

const RemoveFAQDialog = ({
  selected,
  reset,
}: {
  selected: number[];
  reset: () => void;
}) => {
  const queryClient = useQueryClient();

  const [message, setMessage] = useState<REMOVE_MESSAGES_KEYS>("");
  const { mutateAsync } = useMutation({ mutationFn: deleteMultipleFAQs });

  const handleRemove = async () => {
    setMessage(MESSAGES.INITIAL);

    if (selected.length === 0) {
      setMessage(MESSAGES.NONE);
      return;
    }

    const results = await mutateAsync({ ids: selected });

    const fulfilled = results.filter((result) => result.status === "fulfilled");
    const succeded = fulfilled.map((f) => f.value);

    if (succeded.length === 0) {
      setMessage(MESSAGES.ERROR);
      return;
    }

    if (succeded.length < selected.length) {
      setMessage(MESSAGES.PARTIAL);
      queryClient.invalidateQueries(queries.faq.all);
      reset();
      return;
    }

    setMessage(MESSAGES.SUCCESS);
    queryClient.invalidateQueries(queries.faq.all);
    reset();
    return;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="font-pretendard"
          onClick={handleRemove}
          variants="secondary"
        >
          선택 삭제
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-8 rounded-[1.25rem] font-pretendard">
        <DialogHeader>
          <DialogTitle className="sr-only">선택 삭제</DialogTitle>
          <DialogDescription className="sr-only">
            게시글 삭제 결과를 알려주는 다이얼로그입니다.
          </DialogDescription>
        </DialogHeader>
        <section className="flex items-center justify-center text-lg">
          {message}
        </section>
        <DialogFooter className="flex justify-center gap-2">
          <DialogClose asChild>
            <Button
              className={cn(
                "h-[3.75rem] w-full rounded-2xl bg-[#232323] font-pretendard text-xl",
                "hover:bg-[#232323]/80",
              )}
            >
              확인
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { RemoveFAQDialog };
