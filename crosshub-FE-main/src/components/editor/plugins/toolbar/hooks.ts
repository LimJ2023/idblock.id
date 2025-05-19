import { createContext, useContext } from "react";

import { BLOCK_TYPE_TO_BLOCK_NAME } from "@/components/editor/plugins/toolbar/constants";

import type { ContextShape } from "@/components/editor/plugins/toolbar/context";

type BlockType = keyof typeof BLOCK_TYPE_TO_BLOCK_NAME;
type BlockName = (typeof BLOCK_TYPE_TO_BLOCK_NAME)[BlockType];

const Context = createContext<ContextShape | undefined>(undefined);

const useToolbar = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error("useToolbar must be used within a ToolbarProvider");
  }

  return context;
};

export { Context, useToolbar };
export type { BlockName, BlockType };
