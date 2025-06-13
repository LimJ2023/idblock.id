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
import Html5QrcodePlugin from "../qr-code-readert";

import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { acceptVisitor } from "@/api/site.visitor.api";
import { useToast } from "@/hooks/use-toast";

const QrScanDialog = () => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const { data: result } = useQuery({
    ...queries.visitor.detail(selected as string),
    enabled: () => !!selected,
  });
  const { toast } = useToast();

  const { mutateAsync } = useMutation({ mutationFn: acceptVisitor });
  const onNewScanResult = useCallback((decodedText: string) => {
    try {
      const parsed = JSON.parse(decodedText);
      if ("userId" in parsed) {
        console.log("userId", parsed.userId);
        setSelected(parsed.userId);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleApprove = async () => {
    // setMessage(MESSAGES.INITIAL);
    // if (!selected) {
    //   setMessage(MESSAGES.NONE);
    //   return;
    // }
    if (!selected) {
      toast({
        variant: "destructive",
        title: "방문 승인 실패",
        description: "방문 승인할 수 없습니다!",
      });
      return false;
    }
    const { success } = await mutateAsync(selected);
    if (!success) {
      toast({
        variant: "destructive",
        title: "방문 승인 실패",
        description: "방문 승인할 수 없습니다!",
      });

      return;
    }

    toast({
      variant: "default",
      title: "방문 승인 성공",
      description: "방문 승인 완료",
    });
    queryClient.invalidateQueries(queries.visitor.all);
    return;
  };

  return (
    <Dialog
      onOpenChange={() => {
        setSelected(null);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variants={"secondary"}
          className="w-full rounded-lg bg-[#415776] text-lg hover:bg-neutral-200 hover:text-[#333333]"
        >
          <span>QR코드 촬영</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen max-w-5xl gap-8 overflow-auto rounded-[1.25rem] font-pretendard">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            승인하시겠습니까?
          </DialogTitle>
          <DialogDescription className=""></DialogDescription>
        </DialogHeader>

        <Html5QrcodePlugin
          fps={10}
          qrbox={300}
          disableFlip={false}
          qrCodeSuccessCallback={onNewScanResult}
        />
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
                "h-[3.75rem] w-full rounded-2xl bg-[#232323] font-pretendard text-xl",
                "hover:bg-[#232323]/80",
              )}
            >
              취소
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              className={cn(
                "h-[3.75rem] w-full rounded-2xl font-pretendard text-xl",
                "hover:bg-[#232323]/80",
              )}
              variants={"default"}
              disabled={!result || !result.success}
              onClick={handleApprove}
            >
              방문 승인
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { QrScanDialog };
