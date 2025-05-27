import { useState } from "react";

import { ListItemNode, ListNode } from "@lexical/list";

import { LexicalComposer } from "@lexical/react/LexicalComposer";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";

import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";

import { ToolbarPlugin } from "@/components/editor/plugins/toolbar";
import { ToolbarProvider } from "@/components/editor/plugins/toolbar/context";

import { ImageNode, ImagePlugin } from "@/components/editor/plugins/image";

import { baseTheme as theme } from "@/components/editor/theme";

import { cn } from "@/lib/utils";

import type { InitialConfigType } from "@lexical/react/LexicalComposer";
import type { EditorState, LexicalEditor } from "lexical";

const onError = (error: Error, editor: LexicalEditor) => {
  console.error(error);
  console.error(editor.getEditorState().toJSON());
};

const EditorContent = ({
  handleChange,
  className,
}: {
  handleChange: (state: EditorState, editor: LexicalEditor) => Promise<void>;
  className?: string;
}) => {
  const [editor] = useLexicalComposerContext();

  const [activeEditor, setActiveEditor] = useState(editor);

  return (
    <article className="flex h-full flex-col" aria-label="Rich Text Editor">
      <ToolbarPlugin
        activeEditor={activeEditor}
        setActiveEditor={setActiveEditor}
      />
      <RichTextPlugin
        contentEditable={
          <div className="max-h-[25rem] flex-1">
            <ContentEditable
              className={cn(
                "h-full overflow-auto outline-none",
                "focus-visible:ring focus-visible:ring-neutral-600",
                className,
              )}
            />
          </div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <OnChangePlugin onChange={handleChange} />
      <HistoryPlugin />
      <AutoFocusPlugin />
      <ListPlugin />
      <ImagePlugin />
    </article>
  );
};

const Editor = ({
  handleChange,
  className,
  initialEditorState,
}: {
  handleChange: (state: EditorState, editor: LexicalEditor) => Promise<void>;
  className?: string;
  initialEditorState?: string;
}) => {
  const intialConfig: InitialConfigType = {
    namespace: "RichTextEditor",
    theme,
    onError,
    nodes: [ListNode, ListItemNode, ImageNode],
    editorState: initialEditorState,
  };

  return (
    <LexicalComposer initialConfig={intialConfig}>
      <ToolbarProvider>
        <EditorContent handleChange={handleChange} className={className} />
      </ToolbarProvider>
    </LexicalComposer>
  );
};

export { Editor as RichTextEditor };
