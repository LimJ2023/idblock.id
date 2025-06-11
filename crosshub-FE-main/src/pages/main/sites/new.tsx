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

const SitetNewForm = () => {
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
    } else if(result.success === false) {
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
    console.log("관광지 등록 중 문제 발생", error)
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
                className="aspect-square w-48"
                src={watch("thumbnail").url}
                alt="썸네일 이미지"
              />
            )}
          </div>
          <section className="flex flex-1 flex-col justify-between gap-10">
            <div className="flex flex-1 flex-col gap-10">
              <div className="flex flex-col gap-2">
                <Label className="font-pretendard" aria-required>
                  이름
                </Label>
                <Input
                  {...register("name", { required: true })}
                  className={cn(
                    "h-14 rounded-[1.25rem] border-[#CECECE] bg-white px-6 font-pretendard text-base font-normal",
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-pretendard" aria-required>
                  위치
                </Label>
                <Input
                  {...register("address", { required: true })}
                  className={cn(
                    "h-14 rounded-[1.25rem] border-[#CECECE] bg-white px-6 font-pretendard text-base font-normal",
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-pretendard" aria-required>
                  설명
                </Label>
                <Input
                  {...register("description", { required: true })}
                  className={cn(
                    "h-14 rounded-[1.25rem] border-[#CECECE] bg-white px-6 font-pretendard text-base font-normal",
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-pretendard" aria-required>
                  아이디
                </Label>
                <Input
                  {...register("email", { required: true })}
                  className={cn(
                    "h-14 rounded-[1.25rem] border-[#CECECE] bg-white px-6 font-pretendard text-base font-normal",
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-pretendard" aria-required>
                  비밀번호
                </Label>
                <Input
                  {...register("password", { required: true })}
                  className={cn(
                    "h-14 rounded-[1.25rem] border-[#CECECE] bg-white px-6 font-pretendard text-base font-normal",
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-pretendard" aria-required>
                  비밀번호 재입력
                </Label>
                <Input
                  {...register("passwordCheck", { required: true })}
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
                  disabled={isSubmitDisabled}
                  variants={"default"}
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

const SitesNewPage = () => {
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
          <div className="flex justify-center gap-4">
            <h1 className="p-1 text-center font-pretendard text-4xl font-semibold leading-[1.35rem]">
              관광지 등록
            </h1>
          </div>
        </header>
        <SitetNewForm />
      </main>
    </div>
  );
};

export { SitesNewPage };
