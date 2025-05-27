import { useEffect, useRef, useState } from "react";

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

import { blobTodataURL, cn } from "@/lib/utils";

import { INSERT_IMAGE_COMMAND } from "@/components/editor/plugins/image/constants";
import { InsertImagePayload } from "@/components/editor/plugins/image/node";

import { Image } from "lucide-react";

import type { LexicalEditor } from "lexical";
import type { ChangeEventHandler, Dispatch } from "react";

const ImageButton = ({
  dataURL,
  setDataURL,
}: {
  dataURL: string;
  setDataURL: Dispatch<string>;
}) => {
  const onAddImage: ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.currentTarget.files?.[0];

    if (file) {
      setDataURL(await blobTodataURL(file));
    }
  };

  return (
    <>
      <Button
        type="button"
        className={cn(
          "h-full w-full bg-neutral-200 text-black",
          "[&_svg]:size-16",
          "hover:bg-neutral-300",
        )}
        asChild
      >
        <Label
          className={cn("font-pretendard", "hover:cursor-pointer")}
          htmlFor="image"
        >
          {dataURL !== "" ? (
            <img
              src={dataURL}
              alt="선택 이미지"
              className="h-full w-full object-contain"
            />
          ) : (
            <Image />
          )}
        </Label>
      </Button>
      <Input
        onChange={onAddImage}
        id="image"
        name="image"
        type="file"
        accept="image/png, image/jpeg, image/gif"
        className="hidden"
      />
    </>
  );
};

const ImageDialog = ({ activeEditor }: { activeEditor: LexicalEditor }) => {
  const hasModifier = useRef(false);

  const [dataURL, setDataURL] = useState("");

  useEffect(() => {
    hasModifier.current = false;
    const handler = (e: KeyboardEvent) => {
      hasModifier.current = e.altKey;
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [activeEditor]);

  const handleClick = (payload: InsertImagePayload) => {
    activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className={cn(
            "h-10 w-10 bg-transparent text-neutral-600",
            "hover:bg-neutral-200",
          )}
        >
          <Image className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>이미지 업로드</DialogTitle>
          <DialogDescription className="sr-only">
            이미지 업로드를 위한 다이얼로그입니다.
          </DialogDescription>
        </DialogHeader>
        <div className="flex aspect-video w-full items-center justify-center rounded-md">
          <ImageButton dataURL={dataURL} setDataURL={setDataURL} />
        </div>
        <DialogFooter className="flex flex-col gap-2">
          <DialogClose asChild>
            <Button
              onClick={() =>
                handleClick({
                  src: dataURL,
                  altText: "공지사항 본문 이미지",
                  maxWidth: 1280,
                })
              }
              variants="secondary"
              className="w-full"
            >
              확인
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              variants="secondary"
              className={cn(
                "w-full bg-white text-black",
                "hover:bg-neutral-200",
              )}
            >
              취소
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { ImageDialog };
