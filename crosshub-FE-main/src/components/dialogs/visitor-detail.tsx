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
      <DialogContent className="max-h-screen max-w-3xl gap-8 overflow-auto rounded-[1.25rem] p-10 font-pretendard">
        <DialogHeader className="flex-col gap-3">
          <DialogTitle className="text-center text-2xl">
            방문자 신분증
          </DialogTitle>
          <DialogDescription className=""></DialogDescription>
        </DialogHeader>

        {result && result.success && (
          <div>
            {/* <h1 className="mb-12 text-center text-3xl font-bold">
              방문자 신분증
            </h1> */}
            <div className="flex gap-10 border-t border-[#666666] pt-6">
              <div className="flex w-full flex-1 flex-col justify-between gap-4 pt-3">
                <div className="h-[16rem] w-[12rem] overflow-hidden rounded-xl border border-[#E5E7EB]">
                  <img
                    src={result.value.profileImageKey}
                    alt="방문자 사진"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-2 flex flex-col gap-4 divide-y">
                <div className="flex pt-4">
                  <div className="w-36 shrink-0 font-medium text-[#333333]">
                    이름
                  </div>
                  <div className="text-sm text-[#666666]">
                    {result.value.name}
                  </div>
                </div>
                <div className="flex pt-4">
                  <div className="w-36 shrink-0 font-medium text-[#333333]">
                    국가
                  </div>
                  <div className="text-sm text-[#666666]">
                    {result.value.countryCode}
                  </div>
                </div>
                <div className="flex pt-4">
                  <div className="w-36 shrink-0 font-medium text-[#333333]">
                    명예시민
                  </div>
                  <div className="text-sm text-[#666666]">
                    {result.value.cityId}
                  </div>
                </div>
                <div className="flex pt-4">
                  <div className="w-36 shrink-0 font-medium text-[#333333]">
                    생년월일
                  </div>
                  <div className="text-sm text-[#666666]">
                    {result.value.birthday}
                  </div>
                </div>
                <div className="flex pt-4">
                  <div className="w-36 shrink-0 font-medium text-[#333333]">
                    블록체인 주소
                  </div>
                  <div className="text-wrap break-all text-sm text-[#666666]">
                    {result.value.txHash}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-end gap-4 pt-8">
          <DialogClose asChild>
            <Button
              className={cn(
                "h-[2.5rem] rounded-lg border border-[#E5E7EB] font-pretendard text-base",
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
