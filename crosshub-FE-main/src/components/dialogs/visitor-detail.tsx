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
import { useQuery } from "@tanstack/react-query";
import React from "react";

const VisitorDetailDialog = ({
  selected,
  children,
}: {
  selected: string;
  children: React.ReactNode;
}) => {
  const { data: result } = useQuery({
    ...queries.visitor.detail(selected as string),
    enabled: () => !!selected,
  });

  return (
    <Dialog onOpenChange={() => {}}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-screen max-w-5xl gap-8 overflow-auto rounded-[1.25rem] font-pretendard">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            승인하시겠습니까?
          </DialogTitle>
          <DialogDescription className=""></DialogDescription>
        </DialogHeader>

        {result && result.success && (
          <div className="mb-12">
            <h1 className="mb-12 text-center text-3xl font-bold">
              방문자 신분증
            </h1>
            <div className="flex gap-5">
              <div className="basis-52">
                <img
                  src={result.value.profileImageKey}
                  alt="방문자 사진"
                  className="w-full"
                />
              </div>
              <div className="flex flex-1 flex-col gap-5 divide-y border-t border-black">
                <div className="flex pt-5">
                  <div className="flex flex-1 font-bold text-black">이름</div>
                  <div className="flex flex-1 text-[#666666]">
                    {result.value.name}
                  </div>
                </div>
                <div className="flex pt-5">
                  <div className="flex flex-1 font-bold text-black">국가</div>
                  <div className="flex flex-1 text-[#666666]">
                    {result.value.countryCode}
                  </div>
                </div>
                <div className="flex pt-5">
                  <div className="flex flex-1 font-bold text-black">
                    명예시민
                  </div>
                  <div className="flex flex-1 text-[#666666]">
                    {result.value.cityId}
                  </div>
                </div>
                <div className="flex pt-5">
                  <div className="flex flex-1 font-bold text-black">
                    생년월일
                  </div>
                  <div className="flex flex-1 text-[#666666]">
                    {result.value.birthday}
                  </div>
                </div>
                <div className="flex pt-5">
                  <div className="flex flex-1 font-bold text-black">
                    블록체인 주소
                  </div>
                  <div className="flex flex-1 text-wrap break-all text-[#666666]">
                    {result.value.txHash}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-center gap-2">
          <DialogClose asChild>
            <Button
              className={cn(
                "h-[3.75rem] w-full rounded-2xl font-pretendard text-xl",
                "hover:bg-[#232323]/80",
              )}
              variants={"default"}
            >
              확인
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { VisitorDetailDialog };
