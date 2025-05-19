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
        className="mx-auto flex h-full w-full max-w-xl flex-1 flex-col"
      >
        <div className="flex h-full flex-col gap-10">
          <ThumbnailUploadForm />
          <div className="flex min-h-24 gap-2">
            {watch("thumbnail") && (
              <img
                className="w-48"
                src={watch("thumbnail").url}
                alt="썸네일 이미지"
              />
            )}
          </div>
          <section className="flex flex-1 flex-col justify-between gap-10">
            <div className="flex flex-1 flex-col gap-8">
              <div className="flex flex-col gap-3">
                <Label className="font-pretendard text-[14px]" aria-required>
                  이름
                </Label>
                <Input
                  {...register("name", { required: true })}
                  className={cn(
                    "h-14 rounded-[1.25rem] border-[#CECECE] bg-white px-6 font-pretendard text-base font-normal",
                  )}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label className="font-pretendard text-[14px]" aria-required>
                  위치
                </Label>
                <Input
                  {...register("address", { required: true })}
                  className={cn(
                    "h-14 rounded-[1.25rem] border-[#CECECE] bg-white px-6 font-pretendard text-base font-normal",
                  )}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label className="font-pretendard text-[14px]" aria-required>
                  설명
                </Label>
                <Input
                  {...register("description", { required: true })}
                  className={cn(
                    "h-14 rounded-[1.25rem] border-[#CECECE] bg-white px-6 font-pretendard text-base font-normal",
                  )}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label className="font-pretendard text-[14px]" aria-required>
                  아이디
                </Label>
                <Input
                  {...register("siteManager.email", { required: true })}
                  className={cn(
                    "h-14 rounded-[1.25rem] border-[#CECECE] bg-white px-6 font-pretendard text-base font-normal",
                  )}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label className="font-pretendard text-[14px]" aria-required>
                  비밀번호
                </Label>
                <Input
                  {...register("siteManager.password", { required: true })}
                  className={cn(
                    "h-14 rounded-[1.25rem] border-[#CECECE] bg-white px-6 font-pretendard text-base font-normal",
                  )}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label className="font-pretendard text-[14px]" aria-required>
                  비밀번호 재입력
                </Label>
                <Input
                  {...register("siteManager.passwordCheck", { required: true })}
                  className={cn(
                    "h-14 rounded-[1.25rem] border-[#CECECE] bg-white px-6 font-pretendard text-base font-normal",
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex justify-center gap-3">
                <Button
                  type="submit"
                  variants={"default"}
                  disabled={isSubmitDisabled}
                  className={cn(
                    "h-14 w-full rounded-2xl text-lg font-bold disabled:bg-neutral-200",
                  )}
                >
                  등록
                </Button>
              </div>
            </div>
          </section>
        </div>
      </form>
    </FormProvider>
  );
};

const SiteEditPage = () => {
  const data = useLoaderData() as SiteDetail;

  return (
    <div className="flex min-h-full w-full flex-col bg-neutral-100 p-8">
      <h1 className="px-4 pt-6 text-4xl font-semibold">관광지 관리</h1>

      <div className="mb-6 mt-16 flex">
        <Button variants={"default"} asChild>
          <Link to={".."}>나가기</Link>
        </Button>
      </div>
      <main className="flex h-full w-full flex-col rounded-3xl bg-white px-10 py-20">
        <header className="flex w-full flex-col gap-5 pb-10">
          {/* <span className="font-pretendard text-sm">관광지 관리</span> */}
          <div className="flex justify-center gap-4">
            <h1 className="p-1 text-center font-pretendard text-4xl font-semibold leading-[1.35rem]">
              관광지 수정
            </h1>
          </div>
        </header>
        <SiteEditForm current={data} />
      </main>
    </div>
  );
};
export { SiteEditPage };
