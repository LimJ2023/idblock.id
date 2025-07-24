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

      <DialogContent className="w-full min-w-fit gap-8 rounded-[1rem] font-pretendard">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            방문자 승인
          </DialogTitle>
          <DialogDescription className="text-center font-normal">
            QR을 촬영하거나 이미지를 업로드하여 방문객의 방문을 승인할 수
            있습니다
          </DialogDescription>
        </DialogHeader>

        <div className={result && result.success ? "flex w-[70vw] gap-10" : ""}>
          <Html5QrcodePlugin
            fps={10}
            qrbox={300}
            disableFlip={false}
            qrCodeSuccessCallback={onNewScanResult}
            className={result && result.success ? "flex-[1]" : ""}
          />
          {result && result.success && (
            <div className="flex-[1.4]">
              <h1 className="mb-6 text-center text-xl font-semibold">
                방문자 신분증
              </h1>
              <div className="flex gap-5 border-t border-[#666666]">
                <div className="mt-5 box-border h-[140px] w-[100px] shrink-0 overflow-hidden rounded-lg border border-[#e5e7eb]">
                  <img
                    src={result.value.profileImageKey}
                    alt="방문자 사진"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-5 divide-y">
                  <div className="flex pt-5">
                    <div className="flex flex-[1] text-sm font-medium text-[#333333]">
                      이름
                    </div>
                    <div className="flex flex-[2] text-sm text-[#666666]">
                      {result.value.name}
                    </div>
                  </div>
                  <div className="flex pt-5">
                    <div className="flex flex-[1] text-sm font-medium text-[#333333]">
                      국가
                    </div>
                    <div className="flex flex-[2] text-sm text-[#666666]">
                      {result.value.countryCode}
                    </div>
                  </div>
                  <div className="flex pt-5">
                    <div className="flex flex-[1] text-sm font-medium text-[#333333]">
                      명예시민
                    </div>
                    <div className="flex flex-[2] text-sm text-[#666666]">
                      {result.value.cityId}
                    </div>
                  </div>
                  <div className="flex pt-5">
                    <div className="flex flex-[1] text-sm font-medium text-[#333333]">
                      생년월일
                    </div>
                    <div className="flex flex-[2] text-sm text-[#666666]">
                      {result.value.birthday}
                    </div>
                  </div>
                  <div className="flex pt-5">
                    <div className="flex flex-[1] text-sm font-medium text-[#333333]">
                      블록체인 주소
                    </div>
                    <div className="flex flex-[2] text-wrap break-all text-sm text-[#666666]">
                      {result.value.txHash}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-center gap-4">
          <DialogClose asChild>
            <Button
              className={cn(
                "h-[2.5rem] w-[6rem] rounded-lg border border-[#D8D7DB] bg-[#F3F4F8] font-pretendard text-base text-black hover:bg-[#415776] hover:text-white",
              )}
            >
              취소
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              className={cn(
                "h-[2.5rem] w-[6rem] rounded-lg font-pretendard text-base",
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
