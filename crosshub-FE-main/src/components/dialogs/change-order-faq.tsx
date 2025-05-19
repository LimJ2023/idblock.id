import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

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

import { ArrowBigDown, ArrowBigUp } from "lucide-react";

import { reorderFAQs, type FAQ } from "@/api/faq.api";

import { queries } from "@/queries";

type FAQItem = Omit<FAQ, "content" | "sortOrder" | "isVisible">;

const ChangeOrderFAQDialog = ({
  initialItems,
}: {
  initialItems: FAQItem[];
}) => {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<FAQItem[]>(() => initialItems);
  const [isOpen, setIsOpen] = useState(false);

  const { mutateAsync } = useMutation({ mutationFn: reorderFAQs });

  const swapLower = (index: number) => {
    if (index === 0) {
      return;
    }

    const nextItems = [...items];
    [nextItems[index - 1], nextItems[index]] = [
      nextItems[index],
      nextItems[index - 1],
    ];

    setItems(nextItems);
  };

  const swapUpper = (index: number) => {
    if (index === items.length - 1) {
      return;
    }

    const nextItems = [...items];
    [nextItems[index], nextItems[index + 1]] = [
      nextItems[index + 1],
      nextItems[index],
    ];

    setItems(nextItems);
  };

  const handleClick = async () => {
    const result = await mutateAsync({ ids: items.map(({ id }) => id) });

    if (result.success) {
      queryClient.invalidateQueries(queries.faq.all);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="font-pretendard" variants="secondary">
          순서 수정
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl gap-8 rounded-[1.25rem]">
        <DialogHeader>
          <DialogTitle className="px-36 text-xl">순서 수정</DialogTitle>
          <DialogDescription className="sr-only">
            자주 묻는 질문 게시글 순서를 수정할 수 있는 다이얼로그입니다.
          </DialogDescription>
        </DialogHeader>
        <section className="flex flex-col divide-y px-36">
          <div className="flex divide-x border bg-background">
            <span className="flex w-1/6 items-center justify-center p-1">
              번호
            </span>
            <span className="flex w-1/6 items-center justify-center p-1">
              변경
            </span>
            <span className="flex flex-1 items-center justify-center p-1">
              자주 묻는 질문 제목
            </span>
          </div>
          {items.map((item, index) => (
            <div key={item.id} className="flex divide-x border bg-background">
              <span className="flex w-1/6 items-center justify-center p-1">
                {item.id}
              </span>
              <span className="flex w-1/6 items-center justify-center gap-2 p-1">
                <Button
                  onClick={() => swapLower(index)}
                  className={cn(
                    "h-6 w-6 bg-background font-pretendard",
                    "hover:bg-neutral-300",
                  )}
                >
                  <ArrowBigUp className="h-3 w-3 fill-secondary stroke-secondary" />
                </Button>
                <Button
                  onClick={() => swapUpper(index)}
                  className={cn(
                    "h-6 w-6 bg-background font-pretendard",
                    "hover:bg-neutral-300",
                  )}
                >
                  <ArrowBigDown className="h-3 w-3 fill-secondary stroke-secondary" />
                </Button>
              </span>
              <span className="flex flex-1 items-center justify-center p-1">
                {item.title}
              </span>
            </div>
          ))}
        </section>
        <DialogFooter className="flex justify-center gap-2">
          <DialogClose asChild>
            <Button
              variants="secondary"
              className={cn(
                "h-[3.75rem] w-24 rounded-md bg-secondary/50 font-pretendard text-xl",
                "hover:bg-neutral-400",
              )}
            >
              취소
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleClick}
            className={cn(
              "h-[3.75rem] w-24 rounded-md bg-[#232323] font-pretendard text-xl",
              "hover:bg-[#232323]/80",
            )}
          >
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { ChangeOrderFAQDialog };
export type { FAQItem };
