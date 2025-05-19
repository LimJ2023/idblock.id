import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
} from "lexical";

import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";

import { $patchStyleText, $setBlocksType } from "@lexical/selection";

import {
  DEFAULT_FONT_SIZE,
  MAX_ALLOWED_FONT_SIZE,
  MIN_ALLOWED_FONT_SIZE,
} from "@/components/editor/plugins/toolbar/constants";

import type { LexicalEditor } from "lexical";

import type { BlockType } from "@/components/editor/plugins/toolbar/hooks";

type UpdateFontSizeType = "increment" | "decrement";

const calculateNextFontSize = (
  currentFontSize: number,
  updateType?: UpdateFontSizeType,
) => {
  if (!updateType) {
    return currentFontSize;
  }

  switch (updateType) {
    case "increment": {
      switch (true) {
        case currentFontSize < MIN_ALLOWED_FONT_SIZE:
          return MIN_ALLOWED_FONT_SIZE;
        case currentFontSize < 16:
          return currentFontSize + 1;
        case currentFontSize < 24:
          return currentFontSize + 2;
        case currentFontSize < 48:
          return currentFontSize + 4;
        default:
          return MAX_ALLOWED_FONT_SIZE;
      }
    }
    case "decrement": {
      switch (true) {
        case currentFontSize > MAX_ALLOWED_FONT_SIZE:
          return MAX_ALLOWED_FONT_SIZE;
        case currentFontSize > 40:
          return currentFontSize - 4;
        case currentFontSize > 24:
          return currentFontSize - 2;
        case currentFontSize > 12:
          return currentFontSize - 1;
        default:
          return MIN_ALLOWED_FONT_SIZE;
      }
    }
  }
};

const updateFontFamilyInSelection = (
  editor: LexicalEditor,
  newFontFamily: string,
) => {
  editor.update(() => {
    if (!editor.isEditable()) {
      return;
    }

    const selection = $getSelection();

    if (!selection) {
      return;
    }

    $patchStyleText(selection, { "font-family": newFontFamily });
  });
};

const updateFontSizeInSelection = (
  editor: LexicalEditor,
  newFontSize?: string | null,
  updateType?: UpdateFontSizeType,
) => {
  const getNextFontSize = (prevFontSize: string | null): string => {
    const prev = prevFontSize
      ? Number.parseInt(prevFontSize.slice(0, -2))
      : DEFAULT_FONT_SIZE;

    return `${calculateNextFontSize(prev, updateType)}px`;
  };

  editor.update(() => {
    if (!editor.isEditable()) {
      return;
    }

    const selection = $getSelection();

    if (!selection) {
      return;
    }

    $patchStyleText(selection, { "font-size": newFontSize || getNextFontSize });
  });
};

const updateFontSize = (
  editor: LexicalEditor,
  updateType: UpdateFontSizeType,
  inputValue: string,
) => {
  if (inputValue !== "") {
    const nextFontSize = calculateNextFontSize(Number(inputValue), updateType);
    updateFontSizeInSelection(editor, `${nextFontSize.toString()}px`);
  } else {
    updateFontSizeInSelection(editor, null, updateType);
  }
};

const formatParagraph = (editor: LexicalEditor) => {
  editor.update(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      $setBlocksType(selection, () => $createParagraphNode());
    }
  });
};

const formatBulletList = (editor: LexicalEditor, blockType: BlockType) => {
  if (blockType !== "bullet") {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  } else {
    formatParagraph(editor);
  }
};

const formatNumberedList = (editor: LexicalEditor, blockType: string) => {
  if (blockType !== "number") {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  } else {
    formatParagraph(editor);
  }
};

export {
  formatBulletList,
  formatNumberedList,
  updateFontFamilyInSelection,
  updateFontSize,
  updateFontSizeInSelection,
};
