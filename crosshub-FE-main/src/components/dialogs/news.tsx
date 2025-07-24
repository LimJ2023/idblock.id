import { useState } from "react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { cn } from "@/lib/utils";

import {
  Controller,
  useForm,
  type SubmitErrorHandler,
  type SubmitHandler,
} from "react-hook-form";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createNews,
  updateNews,
  type AddNews,
  type News,
} from "@/api/news.api";

import { queries } from "@/queries";

type NewsDialogData = { type: "add" } | { type: "edit"; news: News };

const NewsDialog = ({ data }: { data: NewsDialogData }) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    formState: { isLoading, isValid },
  } = useForm<AddNews>({
    mode: "onSubmit",
    values: {
      title: data.type === "add" ? "" : data.news.title,
      href: data.type === "add" ? "" : data.news.href,
      isVisible: data.type === "add" ? false : data.news.isVisible,
    },
  });

  const { mutateAsync: create } = useMutation({
    mutationFn: createNews,
    mutationKey: ["create"],
  });
  const { mutateAsync: update } = useMutation({
    mutationFn: updateNews,
    mutationKey: ["update"],
  });

  const [isOpen, setIsOpen] = useState(false);

  const onValid: SubmitHandler<AddNews> = async (formData) => {
    if (data.type === "add") {
      const result = await create(formData);

      if (result.success) {
        setIsOpen(false);
        queryClient.invalidateQueries(queries.news.all);
      }

      return;
    }

    const { id } = data.news;

    const result = await update({ id, ...formData });

    if (result.success) {
      setIsOpen(false);
      queryClient.invalidateQueries(queries.news.all);
    }
  };

  const onInvalid: SubmitErrorHandler<AddNews> = (errors) => {
    console.error(errors);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {data.type === "add" ? (
          <Button className="font-pretendard" variants="secondary">
            뉴스 등록
          </Button>
        ) : (
          <Button className="font-pretendard" variants="link">
            {data.news.title}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl gap-8 rounded-[1.25rem]">
        <DialogHeader>
          <DialogTitle className="text-xl">뉴스 등록</DialogTitle>
          <DialogDescription className="sr-only">
            뉴스 정보를 입력하여 생성할 수 있는 다이얼로그입니다.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onValid, onInvalid)}
          className="flex flex-col gap-7"
        >
          <section className="flex flex-col">
            <div className="flex">
              <span className="w-32 bg-background p-5 text-center">
                진열/미진열
              </span>
              <Controller
                control={control}
                name="isVisible"
                render={({ field: { value, onChange, ...props } }) => (
                  <RadioGroup
                    value={value.toString()}
                    {...props}
                    className="flex flex-1 items-center gap-2 p-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        onClick={() => onChange(false)}
                        value="false"
                        id="r1"
                      />
                      <Label className="font-pretendard" htmlFor="r1">
                        미진열
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        onClick={() => onChange(true)}
                        value="true"
                        id="r2"
                      />
                      <Label className="font-pretendard" htmlFor="r2">
                        진열
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>
            <div className="flex items-center">
              <Label
                className="w-32 bg-background p-5 text-center font-pretendard"
                htmlFor="title"
              >
                제목
              </Label>
              <span className="flex-1 p-2">
                <Input
                  id="title"
                  {...register("title", { required: true })}
                  className="bg-white font-pretendard text-base"
                />
              </span>
            </div>
            <div className="flex items-center">
              <Label
                className="w-32 bg-background p-5 text-center font-pretendard"
                htmlFor="title"
              >
                링크
              </Label>
              <span className="flex-1 p-2">
                <Input
                  id="title"
                  {...register("href", { required: true })}
                  className="bg-white font-pretendard text-base"
                />
              </span>
            </div>
          </section>
          <DialogFooter className="flex justify-center gap-2">
            <Button
              disabled={!isValid || isLoading}
              type="submit"
              className={cn(
                "h-[3.75rem] w-24 rounded-2xl bg-[#232323] font-pretendard text-xl",
                "hover:bg-[#232323]/80",
              )}
            >
              저장
            </Button>
            <DialogClose asChild>
              <Button
                variants="secondary"
                className={cn(
                  "h-[3.75rem] w-24 rounded-2xl border bg-white font-pretendard text-xl text-black",
                  "hover:bg-neutral-200",
                )}
              >
                닫기
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { NewsDialog };
