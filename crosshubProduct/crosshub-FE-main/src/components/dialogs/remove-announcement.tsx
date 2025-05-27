import { deleteMultiplAnnouncements } from "@/api/announcement.api";
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
  PARTIAL: "일부 뉴스의 삭제에 실패했습니다.",
  ERROR: "뉴스를 삭제할 수 없습니다.",
  NONE: "선택된 뉴스가 없습니다.",
} as const;

type REMOVE_MESSAGES_KEYS = (typeof MESSAGES)[keyof typeof MESSAGES];

const RemoveAnnouncementDialog = ({
  selected,
  reset,
}: {
  selected: number[];
  reset: () => void;
}) => {
  const queryClient = useQueryClient();

  const [message, setMessage] = useState<REMOVE_MESSAGES_KEYS>("");
  const { mutateAsync } = useMutation({
    mutationFn: deleteMultiplAnnouncements,
  });

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
      queryClient.invalidateQueries(queries.announcement.all);
      reset();
      return;
    }

    setMessage(MESSAGES.SUCCESS);
    queryClient.invalidateQueries(queries.announcement.all);
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
            공지사항 게시글 삭제 결과를 알려주는 다이얼로그입니다.
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

export { RemoveAnnouncementDialog };
