import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FormProvider,
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { useToast } from "@/hooks/use-toast";
import { queries } from "@/queries";
import { ThumbnailUploadForm } from "./thumbnail-upload-form";
import { AddSite, createSite } from "@/api/sites.api";

const SiteNewForm = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const methods = useForm<AddSite>();
  const {
    // setValue,
    watch,
    register,
    handleSubmit,
    formState: { isLoading, isValid },
  } = methods;

  const { mutateAsync: create } = useMutation({
    mutationFn: createSite,
  });

  const onValid: SubmitHandler<AddSite> = async (data) => {
    const {
      address,
      description,
      name,
      email,
      password,
      passwordCheck,
      thumbnail,
    } = data;

    const result = await create({
      address,
      description,
      email,
      name,
      thumbnail,
      password,
      passwordCheck,
    });

    if (result.success) {
      queryClient.invalidateQueries(queries.sites.all);
      toast({
        variant: "default",
        title: "관광지 등록 완료",
        description: "관광지가 등록되었습니다.",
      });
      navigate("..", { relative: "route" });
    } else if (result.success === false) {
      const errorMessage = Array.isArray(result.error.message)
        ? result.error.message[0]?.message || "알 수 없는 오류가 발생했습니다."
        : result.error.message || "알 수 없는 오류가 발생했습니다.";
      console.log("관광지 등록 실패 : ", errorMessage);
      toast({
        variant: "destructive",
        title: "관광지 등록 실패",
        description: errorMessage,
      });
    }
  };

  const onInvalid: SubmitErrorHandler<AddSite> = (error) => {
    console.log("관광지 등록 중 문제 발생", error);
  };

  const isSubmitDisabled = isLoading || !isValid;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onValid, onInvalid)}
        className="flex h-full w-full flex-1 flex-col gap-10 border-t border-[#999999] pt-5 text-[#333333]"
      >
        <div className="flex h-full w-full gap-10">
          <section className="flex w-full flex-1 flex-col justify-between gap-4">
            <div className="flex flex-col gap-5">
              <Label
                className="font-pretendard text-[15px] font-medium"
                aria-required
              >
                관광지 이미지
              </Label>

              <div className="flex h-32 w-full gap-2 rounded-lg bg-[#F4F4F4] p-3">
                {watch("thumbnail") && (
                  <img
                    className="object-fit w-contain h-full border-[#FAFBFC]"
                    src={watch("thumbnail").url}
                    alt="썸네일 이미지"
                  />
                )}
              </div>
              <ThumbnailUploadForm />
            </div>
            <div className="flex flex-col gap-2">
              <Label
                className="font-pretendard text-[14px] font-medium"
                aria-required
              >
                이름
              </Label>
              <Input
                {...register("name", { required: true })}
                className={cn(
                  "h-14 rounded-xl border-[#CECECE] bg-white px-6 font-pretendard text-sm font-normal",
                )}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label
                className="font-pretendard text-[14px] font-medium"
                aria-required
              >
                위치
              </Label>
              <Input
                {...register("address", { required: true })}
                className={cn(
                  "h-14 rounded-xl border-[#CECECE] bg-white px-6 font-pretendard text-sm font-normal",
                )}
              />
            </div>
          </section>

          <section className="flex w-full flex-1 flex-col justify-between gap-4">
            <div className="flex flex-1 flex-col gap-10">
              <div className="flex flex-col gap-2">
                <Label
                  className="font-pretendard text-[14px] font-medium"
                  aria-required
                >
                  설명
                </Label>
                <Input
                  {...register("description", { required: true })}
                  className={cn(
                    "h-14 rounded-xl border-[#CECECE] bg-white px-6 font-pretendard text-sm font-normal",
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label
                  className="font-pretendard text-[14px] font-medium"
                  aria-required
                >
                  아이디
                </Label>
                <Input
                  {...register("email", { required: true })}
                  className={cn(
                    "h-14 rounded-xl border-[#CECECE] bg-white px-6 font-pretendard text-sm font-normal",
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label
                  className="font-pretendard text-[14px] font-medium"
                  aria-required
                >
                  비밀번호
                </Label>
                <Input
                  {...register("password", { required: true })}
                  className={cn(
                    "h-14 rounded-xl border-[#CECECE] bg-white px-6 font-pretendard text-sm font-normal",
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label
                  className="font-pretendard text-[14px] font-medium"
                  aria-required
                >
                  비밀번호 재입력
                </Label>
                <Input
                  {...register("passwordCheck", { required: true })}
                  className={cn(
                    "h-14 rounded-xl border-[#CECECE] bg-white px-6 font-pretendard text-sm font-normal",
                  )}
                />
              </div>
            </div>
          </section>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex justify-center gap-3">
            <Button
              type="submit"
              disabled={isSubmitDisabled}
              variants={"default"}
              className={cn(
                "rounded-lg border border-[#E5E7EB] px-3.5 py-2 disabled:bg-neutral-200",
              )}
            >
              등록
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

const SitesNewPage = () => {
  return (
    <div className="flex w-full flex-col bg-white">
      <div className="p-5">
        <h1 className="px-4 py-2 text-3xl font-semibold text-[#1E1E1E]">
          관광지 관리
        </h1>
      </div>

      <main className="flex w-full flex-col border-t border-[#E5E7EB] bg-[#FAFBFC] px-6 py-4 pb-24">
        <div className="flex justify-end pb-4">
          <Button
            variants={"default"}
            className="rounded-lg border border-[#E5E7EB] px-3.5 py-2"
            asChild
          >
            <Link to={".."}>홈으로</Link>
          </Button>
        </div>

        <section className="flex w-full flex-col rounded-3xl border border-[#E5E7EB] bg-white px-10 py-10">
          <header className="flex w-full flex-col gap-5 pb-5">
            <div className="flex gap-4">
              <h1 className="p-1 font-pretendard text-2xl font-medium leading-[1.35rem] text-[#1E1E1E]">
                관광지 등록
              </h1>
            </div>
          </header>
          <SiteNewForm />
        </section>
      </main>
    </div>
  );
};

export { SitesNewPage };
