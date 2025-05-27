import { Dispatch, useCallback, useEffect } from "react";

import {
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_LOW,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  KEY_DOWN_COMMAND,
  LexicalEditor,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";

import { $isListNode, ListNode } from "@lexical/list";
import { $isHeadingNode } from "@lexical/rich-text";
import { $getSelectionStyleValueForProperty } from "@lexical/selection";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import {
  $findMatchingParent,
  $getNearestNodeOfType,
  mergeRegister,
} from "@lexical/utils";

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  List,
  ListOrdered,
  Redo,
  Strikethrough,
  Underline,
  Undo,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import {
  BLOCK_TYPE_TO_BLOCK_NAME,
  DEFAULT_FONT_SIZE,
} from "@/components/editor/plugins/toolbar/constants";
import {
  FontFamilyDropdown,
  FontSizeDropdown,
} from "@/components/editor/plugins/toolbar/font-dropdown";
import {
  formatBulletList,
  formatNumberedList,
} from "@/components/editor/plugins/toolbar/utils";

import { useToolbar } from "@/components/editor/plugins/toolbar/hooks";

import { ImageDialog } from "@/components/editor/plugins/image/dialog";

import { BackgroundColorPickerDropdown } from "@/components/color-picker/dropdown-background-color-picker";
import { FontColorPickerDropdown } from "@/components/color-picker/dropdown-color-picker";
import type { BlockType } from "@/components/editor/plugins/toolbar/hooks";

const ToolbarPlugin = ({
  activeEditor,
  setActiveEditor,
}: {
  activeEditor: LexicalEditor;
  setActiveEditor: Dispatch<LexicalEditor>;
}) => {
  const [editor] = useLexicalComposerContext();

  const { toolbarState, updateToolbarState } = useToolbar();

  const {
    canUndo,
    canRedo,
    isBold,
    isItalic,
    isUnderline,
    isStrikethrough,
    blockType,
  } = toolbarState;

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();

      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode,
          );

          const type = parentList
            ? parentList.getListType()
            : element.getListType();

          updateToolbarState("blockType", type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();

          if (type in BLOCK_TYPE_TO_BLOCK_NAME) {
            updateToolbarState("blockType", type as BlockType);
          }
        }
      }

      updateToolbarState(
        "fontColor",
        $getSelectionStyleValueForProperty(selection, "color", "#000000"),
      );
      updateToolbarState(
        "bgColor",
        $getSelectionStyleValueForProperty(
          selection,
          "background-color",
          "#000000",
        ),
      );

      updateToolbarState(
        "fontSize",
        Number.parseInt(
          $getSelectionStyleValueForProperty(
            selection,
            "font-size",
            `${DEFAULT_FONT_SIZE}px`,
          ).slice(0, -2),
        ),
      );

      updateToolbarState(
        "fontFamily",
        $getSelectionStyleValueForProperty(selection, "font-family", "Arial"),
      );

      updateToolbarState("isBold", selection.hasFormat("bold"));
      updateToolbarState("isItalic", selection.hasFormat("italic"));
      updateToolbarState("isUnderline", selection.hasFormat("underline"));
      updateToolbarState(
        "isStrikethrough",
        selection.hasFormat("strikethrough"),
      );

      // TODO: code | highlight | subscript | superscript
    }
  }, [updateToolbarState, activeEditor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        setActiveEditor(newEditor);
        $updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, $updateToolbar, setActiveEditor]);

  useEffect(() => {
    activeEditor.getEditorState().read(() => $updateToolbar());
  }, [activeEditor, $updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => $updateToolbar());
      }),
      editor.registerCommand(
        KEY_DOWN_COMMAND,
        (e) => {
          if (e.metaKey && e.key === "y") {
            e.stopPropagation();
            e.preventDefault();
            editor.dispatchCommand(REDO_COMMAND, undefined);
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          updateToolbarState("canUndo", payload);

          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          updateToolbarState("canRedo", payload);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, $updateToolbar, updateToolbarState]);

  return (
    <menu className="flex gap-2 border border-neutral-600 p-2">
      <Button
        type="button"
        aria-label="Undo"
        disabled={!canUndo}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        className={cn(
          "h-10 w-10 bg-transparent text-neutral-600",
          "hover:bg-neutral-200",
        )}
      >
        <Undo className="h-6 w-6" />
      </Button>
      <Button
        type="button"
        aria-label="Redo"
        disabled={!canRedo}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        className={cn(
          "h-10 w-10 bg-transparent text-neutral-600",
          "hover:bg-neutral-200",
        )}
      >
        <Redo className="h-6 w-6" />
      </Button>
      <Button
        type="button"
        aria-label="Format Bold"
        data-state={isBold ? "active" : "inactive"}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        className={cn(
          "h-10 w-10 bg-transparent text-neutral-600",
          "hover:bg-neutral-200",
          "data-[state=active]:bg-neutral-300",
        )}
      >
        <Bold className="h-6 w-6" />
      </Button>
      <Button
        type="button"
        aria-label="Format Italic"
        data-state={isItalic ? "active" : "inactive"}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        className={cn(
          "h-10 w-10 bg-transparent text-neutral-600",
          "hover:bg-neutral-200",
          "data-[state=active]:bg-neutral-300",
        )}
      >
        <Italic className="h-6 w-6" />
      </Button>
      <Button
        type="button"
        aria-label="Format Underline"
        data-state={isUnderline ? "active" : "inactive"}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        className={cn(
          "h-10 w-10 bg-transparent text-neutral-600",
          "hover:bg-neutral-200",
          "data-[state=active]:bg-neutral-300",
        )}
      >
        <Underline className="h-6 w-6" />
      </Button>
      <Button
        type="button"
        aria-label="Format Strikethrough"
        data-state={isStrikethrough ? "active" : "inactive"}
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
        }
        className={cn(
          "h-10 w-10 bg-transparent text-neutral-600",
          "hover:bg-neutral-200",
          "data-[state=active]:bg-neutral-300",
        )}
      >
        <Strikethrough className="h-6 w-6" />
      </Button>
      <Button
        type="button"
        aria-label="Align Left"
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
        className={cn(
          "h-10 w-10 bg-transparent text-neutral-600",
          "hover:bg-neutral-200",
          "data-[state=active]:bg-neutral-300",
        )}
      >
        <AlignLeft className="h-6 w-6" />
      </Button>
      <Button
        type="button"
        aria-label="Align Center"
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}
        className={cn(
          "h-10 w-10 bg-transparent text-neutral-600",
          "hover:bg-neutral-200",
          "data-[state=active]:bg-neutral-300",
        )}
      >
        <AlignCenter className="h-6 w-6" />
      </Button>
      <Button
        type="button"
        aria-label="Align Right"
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}
        className={cn(
          "h-10 w-10 bg-transparent text-neutral-600",
          "hover:bg-neutral-200",
          "data-[state=active]:bg-neutral-300",
        )}
      >
        <AlignRight className="h-6 w-6" />
      </Button>
      <Button
        type="button"
        aria-label="Align Justify"
        onClick={() =>
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")
        }
        className={cn(
          "h-10 w-10 bg-transparent text-neutral-600",
          "hover:bg-neutral-200",
          "data-[state=active]:bg-neutral-300",
        )}
      >
        <AlignJustify className="h-6 w-6" />
      </Button>
      <Button
        type="button"
        aria-label="Format Bullet List"
        onClick={() => {
          formatBulletList(editor, blockType);
        }}
        className={cn(
          "h-10 w-10 bg-transparent text-neutral-600",
          "hover:bg-neutral-200",
          "data-[state=active]:bg-neutral-300",
        )}
      >
        <List className="h-6 w-6" />
      </Button>
      <Button
        type="button"
        aria-label="Format Numbered List"
        onClick={() => {
          formatNumberedList(editor, blockType);
        }}
        className={cn(
          "h-10 w-10 bg-transparent text-neutral-600",
          "hover:bg-neutral-200",
          "data-[state=active]:bg-neutral-300",
        )}
      >
        <ListOrdered className="h-6 w-6" />
      </Button>
      <FontSizeDropdown editor={editor} />
      <FontFamilyDropdown editor={editor} />
      <ImageDialog activeEditor={activeEditor} />
      <FontColorPickerDropdown activeEditor={activeEditor} />
      <BackgroundColorPickerDropdown activeEditor={activeEditor} />
    </menu>
  );
};

export { ToolbarPlugin };
