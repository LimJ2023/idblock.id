import { useMutation } from "@tanstack/react-query";
import { useFormContext, UseFormWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { cn } from "@/lib/utils";

import { Upload } from "lucide-react";

import type { ChangeEventHandler } from "react";
import { SiteDetail, uploadThumbnail } from "@/api/sites.api";

const ThumbnailUploadForm = ({
  watch,
}: {
  watch: UseFormWatch<SiteDetail>;
}) => {
  const { setValue } = useFormContext();

  const { mutateAsync } = useMutation({ mutationFn: uploadThumbnail });

  const onUploadThumbnail: ChangeEventHandler<HTMLInputElement> = async (
    event,
  ) => {
    const file = event.currentTarget.files?.[0];

    if (file) {
      console.log(file);
      const result = await mutateAsync({ file });

      if (result.success) {
        setValue("thumbnail", result.value);
        return;
      }
    }
  };

  return (
    <section className="flex flex-col gap-5">
      <Label className="font-pretendard" aria-required>
        관광지 이미지
      </Label>

      <div className="flex h-32 w-32 gap-2">
        {watch("thumbnail") && (
          <img
            className="h-full w-full object-cover"
            src={watch("thumbnail").url}
            alt="썸네일 이미지"
          />
        )}
      </div>

      <Button
        type="button"
        className={cn(
          "w-fit border border-black bg-transparent font-pretendard text-black",
          "hover:bg-neutral-200",
        )}
        asChild
      >
        <Label
          className={cn(
            "border-[#E5E7EB] bg-[#415776] font-pretendard text-white",
            "hover:cursor-pointer",
          )}
          htmlFor="thumbnail"
        >
          <Upload className="h-6 w-6" /> 이미지 업로드
        </Label>
      </Button>
      <Input
        onChange={onUploadThumbnail}
        id="thumbnail"
        name="thumbnail"
        type="file"
        accept="image/png, image/jpeg, image/gif"
        className="hidden"
      />
    </section>
  );
};

export { ThumbnailUploadForm };
