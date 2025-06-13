import { useMutation } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { cn } from "@/lib/utils";

import { Upload } from "lucide-react";

import type { ChangeEventHandler } from "react";
import { uploadThumbnail } from "@/api/sites.api";

const ThumbnailUploadForm = () => {
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
    <div className="flex w-full justify-end">
      <Button
        type="button"
        className={cn(
          "h-fit w-fit border border-black bg-transparent py-3 font-pretendard text-black",
          "hover:bg-neutral-200",
        )}
        asChild
      >
        <Label
          className={cn(
            "border-[#E5E7EB] bg-[#415776] font-pretendard text-white",
            "hover:cursor-pointer hover:text-[#666666]",
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
    </div>
  );
};

export { ThumbnailUploadForm };
