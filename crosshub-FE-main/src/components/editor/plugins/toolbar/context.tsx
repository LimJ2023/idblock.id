import { useCallback, useMemo, useState } from "react";

import { DEFAULT_FONT_SIZE } from "@/components/editor/plugins/toolbar/constants";
import { Context } from "@/components/editor/plugins/toolbar/hooks";

import type { PropsWithChildren } from "react";

import type { BlockType } from "@/components/editor/plugins/toolbar/hooks";

type ToolbarState = {
  canUndo: boolean;
  canRedo: boolean;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  blockType: BlockType;
  fontSize: number;
  fontFamily: string;
  fontColor: string;
  bgColor: string;
};

type ToolbarStateKey = keyof ToolbarState;
type ToolbarStateValue<Key extends ToolbarStateKey> = ToolbarState[Key];

type ContextShape = {
  toolbarState: ToolbarState;
  updateToolbarState<Key extends ToolbarStateKey>(
    key: Key,
    value: ToolbarStateValue<Key>,
  ): void;
};

const initialToolbarState: ToolbarState = {
  canUndo: false,
  canRedo: false,
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrikethrough: false,
  blockType: "paragraph",
  fontSize: DEFAULT_FONT_SIZE,
  fontFamily: "Arial",
  fontColor: "#000000",
  bgColor: "#FFFFFF",
};

const ToolbarProvider = ({ children }: PropsWithChildren) => {
  const [toolbarState, setToolbarState] = useState(initialToolbarState);

  const updateToolbarState = useCallback(
    <Key extends ToolbarStateKey>(key: Key, value: ToolbarStateValue<Key>) => {
      setToolbarState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const contextValue = useMemo(
    () => ({ toolbarState, updateToolbarState }),
    [toolbarState, updateToolbarState],
  );

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export { ToolbarProvider };
export type { ContextShape };
