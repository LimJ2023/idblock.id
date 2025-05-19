import { useCallback } from "react";

import { $patchStyleText } from "@lexical/selection";
import { $getSelection } from "lexical";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useToolbar } from "@/components/editor/plugins/toolbar/hooks";

import { cn } from "@/lib/utils";

import { PaintBucket } from "lucide-react";

import { HexColorPicker } from "react-colorful";

import type { LexicalEditor } from "lexical";

const BASIC_COLORS = ["#D0021B", "#F8E71C", "#4A90E2", "#FFFFFF"];

const BackgroundColorPickerDropdown = ({
  activeEditor,
}: {
  activeEditor: LexicalEditor;
}) => {
  const { toolbarState } = useToolbar();
  const { bgColor } = toolbarState;

  const applyStyleText = useCallback(
    (styles: Record<string, string>) => {
      activeEditor.update(() => {
        const selection = $getSelection();
        if (selection !== null) {
          $patchStyleText(selection, styles);
        }
      });
    },
    [activeEditor],
  );

  const onBackgroundColorSelect = useCallback(
    (value: string) => {
      applyStyleText({ "background-color": value });
    },
    [applyStyleText],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          aria-label="Format Font Size"
          className={cn(
            "h-10 w-10 bg-transparent text-neutral-600",
            "hover:bg-neutral-200",
          )}
        >
          <PaintBucket className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white">
        <div className="flex flex-wrap justify-evenly gap-2 pt-2">
          {BASIC_COLORS.map((color) => (
            <Button
              style={{ backgroundColor: color }}
              key={color}
              className="h-6 w-8 border border-neutral-300 p-0"
              onClick={() => onBackgroundColorSelect(color)}
            />
          ))}
        </div>
        <div className="p-2">
          <HexColorPicker color={bgColor} onChange={onBackgroundColorSelect} />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { BackgroundColorPickerDropdown };
