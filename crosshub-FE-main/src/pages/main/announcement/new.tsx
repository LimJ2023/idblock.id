import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Controller,
  FormProvider,
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { $nodesOfType } from "lexical";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { ThumbnailUploadForm } from "@/pages/main/announcement/thumbnail-upload-form";

import { RichTextEditor } from "@/components/editor";

import { ArrowLeft } from "lucide-react";

import { cn, dataUrlToBlob, getMIMETypeFromDataURI } from "@/lib/utils";

import {
  AddAnnouncement,
  createAnnouncement,
  uploadEmbedded,
} from "@/api/announcement.api";

import { ImageNode } from "@/components/editor/plugins/image";

import { useState } from "react";

import { $isEmpty } from "@/components/editor/utils";
import { $getRoot, type EditorState, type LexicalEditor } from "lexical";

import { SWITCH_IMAGES_COMMAND } from "@/components/editor/plugins/image/constants";
import { useToast } from "@/hooks/use-toast";
import { queries } from "@/queries";

const AnnouncementNewForm = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [editor, setEditor] = useState<LexicalEditor>();
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);

  const methods = useForm<AddAnnouncement>();
  const {
    // setValue,
    watch,
    register,
    handleSubmit,
    control,
    formState: { isLoading, isValid },
  } = methods;

  const { mutateAsync: upload } = useMutation({ mutationFn: uploadEmbedded });
  const { mutateAsync: create } = useMutation({
    mutationFn: createAnnouncement,
  });

  const onValid: SubmitHandler<AddAnnouncement> = async (data) => {
    if (!editor) {
      return;
    }

    const imageNodes = editor
      .getEditorState()
      .read(() => $nodesOfType(ImageNode));

    const files = imageNodes.map((node, index) => {
      const dataURL = node.getSrc();

      const mime = getMIMETypeFromDataURI(dataURL);

      return new File(
        [dataUrlToBlob(dataURL)],
        `announcement image ${index + 1}`,
        { type: mime },
      );
    });

    const requests = files.map((file) => upload({ file }));

    const responses = await Promise.allSettled(requests);
    const succeeded = responses
      .filter((response) => response.status === "fulfilled")
      .map((res) => res.value)
      .filter((result) => result.success);

    if (succeeded.length !== imageNodes.length) {
      toast({
        variant: "destructive",
        title: "게시글 이미지 업로드 실패",
        description: "게시글 이미지를 업로드할 수 없습니다.",
      });
      return;
    }

    const payload = succeeded.map((result, index) => ({
      node: imageNodes[index],
      storageSrc: result.value.url,
    }));

    editor.update(
      () => {
        editor.dispatchCommand(SWITCH_IMAGES_COMMAND, payload);
      },
      { discrete: true },
    );

    const current = editor.getEditorState().toJSON();

    const { title, thumbnail } = data;

    const text = editor
      .getEditorState()
      .read(() => $getRoot().getTextContent())
      .slice(0, 100);

    const result = await create({
      title,
      thumbnail: thumbnail,
      content: JSON.stringify(current),
      summary: text,
    });

    if (result.success) {
      queryClient.invalidateQueries(queries.announcement.all);
      navigate("..", { relative: "route" });
    }
  };

  const onInvalid: SubmitErrorHandler<AddAnnouncement> = (error) => {
    console.error(error);
  };

  const handleContentChange = async (
    editorState: EditorState,
    editor: LexicalEditor,
  ) => {
    editorState.read(() => {
      setEditor(editor);
      setIsEditorEmpty($isEmpty(editorState));
    });
  };

  const isSubmitDisabled = isLoading || !isValid || isEditorEmpty;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onValid, onInvalid)}
        className="flex h-full w-full flex-1 flex-col"
      >
        <div className="flex h-full flex-col gap-10">
          <ThumbnailUploadForm />
          <div className="flex min-h-24 gap-2">
            {watch("thumbnail") && (
              <img
                className="h-24 w-48"
                src={watch("thumbnail").url}
                alt="썸네일 이미지"
              />
            )}
          </div>
          <section className="flex flex-1 flex-col justify-between gap-10">
            <div className="flex flex-1 flex-col gap-10">
              <div className="flex flex-col gap-2">
                <Label className="font-pretendard" aria-required>
                  제목
                </Label>
                <Input
                  {...register("title", { required: true })}
                  className={cn(
                    "h-14 rounded-[1.25rem] border-[#CECECE] bg-white px-6 font-pretendard text-base font-normal",
                  )}
                />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <Label className="font-pretendard" aria-required>
                  내용
                </Label>
                <div className="flex-1">
                  <Controller
                    control={control}
                    name="content"
                    render={() => (
                      <RichTextEditor
                        handleChange={handleContentChange}
                        className="border p-4"
                      />
                    )}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex justify-center gap-3">
                <Button
                  type="button"
                  variants="secondary"
                  className="h-12 w-24 bg-neutral-400 font-pretendard"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className={cn(
                    "h-12 w-24 font-pretendard",
                    "disabled:bg-neutral-200",
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

const AnnouncementNewPage = () => {
  return (
    <div className="flex h-full w-full flex-col bg-neutral-100 p-20">
      <main className="flex h-full w-full flex-col rounded-3xl bg-white px-10 py-8">
        <header className="flex w-full flex-col gap-5 pb-20">
          <span className="font-pretendard text-sm">공지사항 관리</span>
          <div className="flex gap-4">
            <Button
              variants="secondary"
              className={cn(
                "h-8 w-8 bg-transparent font-pretendard",
                "hover:bg-neutral-200",
              )}
              asChild
            >
              <Link to=".." relative="route">
                <ArrowLeft className="h-6 w-6 stroke-black" />
              </Link>
            </Button>
            <h1 className="p-1 font-pretendard text-xl font-semibold leading-[1.35rem]">
              공지사항 등록
            </h1>
          </div>
        </header>
        <AnnouncementNewForm />
      </main>
    </div>
  );
};

export { AnnouncementNewPage };
