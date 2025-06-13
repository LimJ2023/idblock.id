import {
  FormProvider,
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { Link, useLoaderData, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Site, SiteDetail, updateSite } from "@/api/sites.api";
import { ThumbnailUploadForm } from "./thumbnail-upload-form";
import { queries } from "@/queries";

const SiteEditForm = ({ current }: { current: SiteDetail }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutateAsync: update } = useMutation({
    mutationFn: updateSite,
  });

  const thumbnail = new URL(current.imageKey);

  const methods = useForm<SiteDetail>({
    defaultValues: {
      ...current,
      thumbnail: {
        url: thumbnail.toString(),
        key: `public/${thumbnail.pathname.slice(1)}`,
      },
    },
  });

  const {
    handleSubmit,
    watch,
    register,
    formState: { isLoading, isValid },
  } = methods;

  const onValid: SubmitHandler<SiteDetail> = async (data) => {
    const { thumbnail, address, description, name, imageKey, siteManager, id } =
      data;

    const result = await update({
      id,
      address,
      description,
      name,
      siteManager,
      thumbnail: thumbnail,
      imageKey,
    });
    if (result.success) {
      await queryClient.invalidateQueries(queries.sites.all);
      await queryClient.invalidateQueries({
        queryKey: ["sites", "detail"],
        type: "all",
      });
      navigate("..", { relative: "route" });
    }
  };

  const onInvalid: SubmitErrorHandler<Site> = (error) => {
    console.error(error);
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
            <ThumbnailUploadForm watch={watch} />
            <div className="flex flex-col gap-3">
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
            <div className="flex flex-col gap-3">
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
            <div className="flex flex-col gap-3">
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
            <div className="flex flex-col gap-3">
              <Label
                className="font-pretendard text-[14px] font-medium"
                aria-required
              >
                아이디
              </Label>
              <Input
                {...register("siteManager.email", { required: true })}
                className={cn(
                  "h-14 rounded-xl border-[#CECECE] bg-white px-6 font-pretendard text-sm font-normal",
                )}
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label
                className="font-pretendard text-[14px] font-medium"
                aria-required
              >
                비밀번호
              </Label>
              <Input
                {...register("siteManager.password", { required: true })}
                className={cn(
                  "h-14 rounded-xl border-[#CECECE] bg-white px-6 font-pretendard text-sm font-normal",
                )}
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label
                className="font-pretendard text-[14px] font-medium"
                aria-required
              >
                비밀번호 재입력
              </Label>
              <Input
                {...register("siteManager.passwordCheck", { required: true })}
                className={cn(
                  "h-14 rounded-xl border-[#CECECE] bg-white px-6 font-pretendard text-sm font-normal",
                )}
              />
            </div>
          </section>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex justify-center gap-3">
            <Button
              type="submit"
              variants={"default"}
              disabled={isSubmitDisabled}
              className={cn(
                "rounded-lg border border-[#E5E7EB] px-3.5 py-2 disabled:bg-neutral-200",
              )}
            >
              저장
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

const SiteEditPage = () => {
  const data = useLoaderData() as SiteDetail;

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
            asChild
            className="rounded-lg border border-[#E5E7EB] px-3.5 py-2"
          >
            <Link to={".."}>홈으로</Link>
          </Button>
        </div>

        <section className="flex w-full flex-col rounded-3xl border border-[#E5E7EB] bg-white px-10 py-10">
          <header className="flex w-full flex-col gap-5 pb-5">
            {/* <span className="font-pretendard text-sm">관광지 관리</span> */}
            <div className="flex gap-4">
              <h1 className="p-1 font-pretendard text-2xl font-medium leading-[1.35rem] text-[#1E1E1E]">
                관광지 수정
              </h1>
            </div>
          </header>
          <SiteEditForm current={data} />
        </section>
      </main>
    </div>
  );
};
export { SiteEditPage };
