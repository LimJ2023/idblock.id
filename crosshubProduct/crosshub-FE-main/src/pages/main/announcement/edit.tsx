import {
  Controller,
  FormProvider,
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { Link, useLoaderData, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

import { ThumbnailUploadForm } from "@/pages/main/announcement/thumbnail-upload-form";

import { cn, dataUrlToBlob, getMIMETypeFromDataURI } from "@/lib/utils";

import {
  Announcement,
  AnnouncementDetail,
  updateAnnouncement,
  uploadEmbedded,
} from "@/api/announcement.api";
import { RichTextEditor } from "@/components/editor";
import { ImageNode } from "@/components/editor/plugins/image";
import { SWITCH_IMAGES_COMMAND } from "@/components/editor/plugins/image/constants";
import { $isEmpty } from "@/components/editor/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queries } from "@/queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { $getRoot, $nodesOfType, EditorState, LexicalEditor } from "lexical";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

const AnnouncementEditForm = ({ current }: { current: AnnouncementDetail }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutateAsync: upload } = useMutation({ mutationFn: uploadEmbedded });
  const { mutateAsync: update } = useMutation({
    mutationFn: updateAnnouncement,
  });

  const [editor, setEditor] = useState<LexicalEditor>();
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);

  const thumbnail = new URL(current.thumbnail);

  const methods = useForm<Announcement>({
    defaultValues: {
      ...current,
      thumbnail: {
        url: thumbnail.toString(),
        key: thumbnail.pathname.slice(1),
      },
    },
  });

  const {
    handleSubmit,
    watch,
    register,
    control,
    formState: { isLoading, isValid },
  } = methods;

  const onValid: SubmitHandler<Announcement> = async (data) => {
    if (!editor) {
      return;
    }

    const newImageNodes = editor
      .getEditorState()
      .read(() => $nodesOfType(ImageNode))
      .filter((node) => node.getSrc().startsWith("data"));

    const files = newImageNodes.map((node, index) => {
      const dataURL = node.getSrc();

      const mime = getMIMETypeFromDataURI(dataURL);

      return new File(
        [dataUrlToBlob(dataURL)],
        `edited announcement image ${index + 1}`,
        { type: mime },
      );
    });

    const requests = files.map((file) => upload({ file }));

    const responses = await Promise.allSettled(requests);
    const succeeded = responses
      .filter((response) => response.status === "fulfilled")
      .map((res) => res.value)
      .filter((result) => result.success);

    if (succeeded.length !== newImageNodes.length) {
      toast({
        variant: "destructive",
        title: "게시글 이미지 업로드 실패",
        description: "게시글 이미지를 업로드할 수 없습니다.",
      });
      return;
    }

    const payload = succeeded.map((result, index) => ({
      node: newImageNodes[index],
      storageSrc: result.value.url,
    }));

    editor.update(
      () => {
        editor.dispatchCommand(SWITCH_IMAGES_COMMAND, payload);
      },
      { discrete: true },
    );

    const current = editor.getEditorState().toJSON();

    const { id, title, thumbnail } = data;

    const text = editor
      .getEditorState()
      .read(() => $getRoot().getTextContent())
      .slice(0, 100);

    const result = await update({
      id,
      title,
      thumbnail: thumbnail,
      content: JSON.stringify(current),
      summary: text,
    });

    if (result.success) {
      queryClient.invalidateQueries(queries.announcement.detail(id));
      queryClient.invalidateQueries(queries.announcement.all);
      navigate("..", { relative: "route" });
    }
  };

  const onInvalid: SubmitErrorHandler<Announcement> = (error) => {
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
                        initialEditorState={current.content}
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
                  onClick={() => navigate("..", { relative: "route" })}
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

const AnnouncementEditPage = () => {
  const data = useLoaderData() as AnnouncementDetail;

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
              공지사항 수정
            </h1>
          </div>
        </header>
        <AnnouncementEditForm current={data} />
      </main>
    </div>
  );
};
export { AnnouncementEditPage };
