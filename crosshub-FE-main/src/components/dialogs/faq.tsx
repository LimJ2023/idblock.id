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
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";

import {
  Controller,
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
} from "react-hook-form";

import { AddFAQ, createFAQ, FAQ, updateFAQ } from "@/api/faq.api";

import { queries } from "@/queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type FAQDialogData = { type: "add" } | { type: "edit"; faq: FAQ };

const FAQDialog = ({ data }: { data: FAQDialogData }) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    formState: { isLoading, isValid },
  } = useForm<AddFAQ>({
    mode: "onSubmit",
    values: {
      title: data.type === "add" ? "" : data.faq.title,
      content: data.type === "add" ? "" : data.faq.content,
      isVisible: data.type === "add" ? false : data.faq.isVisible,
    },
  });

  const { mutateAsync: create } = useMutation({
    mutationFn: createFAQ,
    mutationKey: ["create"],
  });
  const { mutateAsync: update } = useMutation({
    mutationFn: updateFAQ,
    mutationKey: ["update"],
  });

  const [isOpen, setIsOpen] = useState(false);

  const onValid: SubmitHandler<AddFAQ> = async (formData) => {
    if (data.type === "add") {
      const result = await create(formData);

      if (result.success) {
        setIsOpen(false);
        queryClient.invalidateQueries(queries.faq.all);
      }

      return;
    }

    const { id } = data.faq;

    const result = await update({ id, ...formData });

    if (result.success) {
      setIsOpen(false);
      queryClient.invalidateQueries(queries.faq.all);
    }
  };

  const onInvalid: SubmitErrorHandler<AddFAQ> = (errors) => {
    console.error(errors);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {data.type === "add" ? (
          <Button className="font-pretendard" variants="secondary">
            자주 묻는 질문 등록
          </Button>
        ) : (
          <Button className="font-pretendard" variants="link">
            {data.faq.title}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl gap-8 rounded-[1.25rem]">
        <DialogHeader>
          <DialogTitle className="text-xl">자주 묻는 질문 등록</DialogTitle>
          <DialogDescription className="sr-only">
            자주 묻는 질문 정보를 입력하여 생성할 수 있는 다이얼로그입니다.
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
            <div className="flex">
              <Label
                className="flex w-32 items-center justify-center bg-background p-5 font-pretendard"
                htmlFor="content"
              >
                답변
              </Label>
              <span className="flex-1 p-2 pb-0">
                <Textarea
                  id="content"
                  {...register("content", { required: true })}
                  className="h-56 resize-none bg-white text-base"
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

export { FAQDialog };
