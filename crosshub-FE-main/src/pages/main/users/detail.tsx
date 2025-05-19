import { argosCall, User } from "@/api/users.api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { queries } from "@/queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Info, RefreshCcw } from "lucide-react";
import {
  Link,
  useLoaderData,
  useLocation,
  useNavigate,
  useRevalidator,
} from "react-router-dom";

const UserDetailPage = () => {
  const data = useLoaderData() as User & { txHash: string };
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const revalidator = useRevalidator();
  const { toast } = useToast();

  const { mutateAsync, isPending } = useMutation({ mutationFn: argosCall });

  const handleArgos = async () => {
    await mutateAsync(data.documentId);

    toast({
      variant: "default",
      title: "Argos 데이터 호출",
      description: "데이터 동기화 완료",
    });

    await queryClient.refetchQueries(queries.users.detail(data.documentId));
    revalidator.revalidate();
    navigate(location.pathname, { replace: true });
  };

  return (
    <div className="flex min-h-full w-full flex-col border bg-neutral-100 p-8">
      <h1 className="px-4 pt-6 text-4xl font-semibold">사용자 관리</h1>
      <div className="mb-6 mt-16 flex">
        <Button variants={"default"} asChild>
          <Link to={".."}>나가기</Link>
        </Button>
      </div>
      <main className="flex h-full w-full flex-col rounded-3xl bg-white px-10 py-20">
        <header className="flex w-full flex-col gap-5 pb-10">
          <div className="flex justify-center gap-4">
            <h1 className="p-1 text-center font-pretendard text-4xl font-semibold leading-[1.35rem]">
              승인 사용자 상세
            </h1>
          </div>
        </header>
        <div className="mb-2"></div>
        <div className="mx-auto flex max-w-xl flex-1 flex-col gap-5 divide-y border-t border-black">
          <div className="flex items-center gap-2 pt-5">
            <Label className="basis-40 font-pretendard">이름</Label>
            <div
              className={cn(
                "rounded-[1.25rem] border-[#CECECE] bg-white px-6 font-pretendard text-base font-normal text-[#666]",
              )}
            >
              {data.name}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-5">
            <Label className="basis-40 font-pretendard">이메일</Label>
            <div
              className={cn(
                "rounded-[1.25rem] border-[#CECECE] bg-white px-6 font-pretendard text-base font-normal text-[#666]",
              )}
            >
              {data.email}
            </div>
          </div>
          <div className="flex items-start gap-2 pt-5">
            <div className="flex flex-1 gap-2">
              <Label className="basis-16 font-pretendard">여권사진</Label>
              <div
                className={cn(
                  "flex-1 rounded-[1.25rem] border-[#CECECE] bg-white px-6 font-pretendard text-base font-normal text-[#666]",
                )}
              >
                <Link target="_blank" to={data.passportImageKey}>
                  <img
                    src={data.passportImageKey}
                    alt="passport"
                    className=""
                  />
                </Link>
              </div>
            </div>
            <div className="flex flex-1 gap-2">
              <Label className="basis-16 font-pretendard">얼굴 사진</Label>
              <div
                className={cn(
                  "flex-1 rounded-[1.25rem] border-[#CECECE] bg-white px-6 font-pretendard text-base font-normal text-[#666]",
                )}
              >
                <Link target="_blank" to={data.profileImageKey}>
                  <img src={data.profileImageKey} alt="profile" className="" />
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-5">
            <Label className="basis-40 font-pretendard">국가</Label>
            <div
              className={cn(
                "rounded-[1.25rem] border-[#CECECE] bg-white px-6 font-pretendard text-base font-normal text-[#666]",
              )}
            >
              {data.countryCode}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-5">
            <Label className="basis-40 font-pretendard">명예시민</Label>
            <div
              className={cn(
                "rounded-[1.25rem] border-[#CECECE] bg-white px-6 font-pretendard text-base font-normal text-[#666]",
              )}
            >
              {data.cityId}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-5">
            <Label className="basis-40 font-pretendard">생년월일</Label>
            <div
              className={cn(
                "rounded-[1.25rem] border-[#CECECE] bg-white px-6 font-pretendard text-base font-normal text-[#666]",
              )}
            >
              {data.birthday}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-5">
            <Label className="basis-40 font-pretendard">여권번호</Label>
            <div
              className={cn(
                "rounded-[1.25rem] border-[#CECECE] bg-white px-6 font-pretendard text-base font-normal text-[#666]",
              )}
            >
              {data.passportNumber}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-5">
            <Label className="flex-shrink-0 basis-40 font-pretendard">
              블록체인 주소
            </Label>
            <div
              className={cn(
                "flex-1 text-wrap break-all rounded-[1.25rem] border-[#CECECE] bg-white px-6 font-pretendard text-base font-normal text-[#666]",
              )}
            >
              {data.txHash}
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2 pt-5">
              <Label className="flex-shrink-0 font-pretendard">Argos</Label>
              <Button
                className="rounded-full border border-[#D8D7DB] bg-[#F3F4F8] p-2"
                disabled={isPending}
                onClick={handleArgos}
              >
                <RefreshCcw
                  className={`${isPending ? "animate-spin" : ""} stroke-black transition-transform hover:stroke-white`}
                />
              </Button>
              <div className="inline-block pl-4 align-bottom text-xs font-light">
                * 평균적으로 30초 내외의 시간이 소요됩니다.
              </div>
            </div>

            <div className="divide-y bg-[#F7F7F7] p-5">
              <div className="flex py-4">
                <div className="flex basis-60 items-center gap-2 font-bold uppercase">
                  <span>Screen replay</span>
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info strokeWidth={1} />
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <TooltipArrow />
                        <p className="px-6 py-3">
                          이미지를 모니터 화면에서 촬영한 것인지, 실제 장면을
                          촬영한 것인지 여부를 판별
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex-1 text-[#666666]">
                  {data.screenReplay ?? "-"} %
                </div>
              </div>
              <div className="flex py-4">
                <div className="flex basis-60 items-center gap-2 font-bold uppercase">
                  <span>Paper printed</span>
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info strokeWidth={1} />
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <TooltipArrow />
                        <p className="px-6 py-3">
                          종이에 출력된 사진을 재촬영한 이미지인지 여부를 식별
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex-1 text-[#666666]">
                  {data.paperPrinted ?? "-"} %
                </div>
              </div>
              <div className="flex py-4">
                <div className="flex basis-60 items-center gap-2 font-bold uppercase">
                  <span>replace portraits</span>
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info strokeWidth={1} />
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <TooltipArrow />
                        <p className="px-6 py-3">
                          얼굴 합성 또는 포토샵 등의 기법으로 인물의 얼굴이
                          변경되었는지 여부를 판단
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex-1 text-[#666666]">
                  {data.replacePortraits ?? "-"} %
                </div>
              </div>
              <div className="flex py-4">
                <div className="flex basis-60 items-center gap-2 font-bold uppercase">
                  <span>similarity</span>
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info strokeWidth={1} />
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <TooltipArrow />
                        <p className="px-6 py-3">
                          이미지 속 인물이 실제 대상 인물과 얼마나 유사한지를
                          평가
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex-1 text-[#666666]">
                  {data.matchSimilarity ?? "-"} %
                </div>
              </div>
              <div className="flex py-4">
                <div className="flex basis-60 items-center gap-2 font-bold uppercase">
                  <span>Confidence</span>
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info strokeWidth={1} />
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <TooltipArrow />
                        <p className="px-6 py-3">
                          유사성 판단 결과에 대한 신뢰도 점수 또는 정확도 지표
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex-1 text-[#666666]">
                  {data.matchConfidence ?? "-"} %
                </div>
              </div>
              <div className="flex py-4">
                <div className="flex basis-60 items-center gap-2 font-bold uppercase">
                  <span>liveness</span>
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info strokeWidth={1} />
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <TooltipArrow />
                        <p className="px-6 py-3">
                          이미지가 실제 존재하는 인물의 실시간 촬영 사진인지
                          여부를 판단
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex-1 text-[#666666]">
                  {data.faceLiveness ?? "-"} %
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
export { UserDetailPage };
