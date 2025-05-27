import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { FONT_FAMILY_OPTIONS } from "@/components/editor/plugins/toolbar/constants";
import { useToolbar } from "@/components/editor/plugins/toolbar/hooks";
import {
  updateFontFamilyInSelection,
  updateFontSizeInSelection,
} from "@/components/editor/plugins/toolbar/utils";

import { cn } from "@/lib/utils";

import { ALargeSmall, Type } from "lucide-react";

import type { LexicalEditor } from "lexical";

const fontSizeOptions = [
  12, 13, 14, 15, 16, 18, 20, 22, 24, 28, 32, 36, 40, 44, 48,
];

const FontSizeDropdown = ({ editor }: { editor: LexicalEditor }) => {
  const { toolbarState } = useToolbar();
  const { fontSize } = toolbarState;

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
          <ALargeSmall className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {fontSizeOptions.map((value) => (
          <DropdownMenuItem key={value} asChild>
            <Button
              data-state={value === fontSize ? "active" : "inactive"}
              onClick={() => updateFontSizeInSelection(editor, `${value}px`)}
              className={cn(
                "w-full rounded-md bg-neutral-100 text-neutral-900",
                "data-[state=active]:bg-neutral-400 data-[state=active]:text-neutral-100",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
              )}
            >
              {value}
            </Button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const FontFamilyDropdown = ({ editor }: { editor: LexicalEditor }) => {
  const { toolbarState } = useToolbar();
  const { fontFamily } = toolbarState;

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
          <Type className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {FONT_FAMILY_OPTIONS.map(([key, value]) => (
          <DropdownMenuItem key={key} asChild>
            <Button
              data-state={key === fontFamily ? "active" : "inactive"}
              onClick={() => updateFontFamilyInSelection(editor, key)}
              className={cn(
                "w-full rounded-md bg-neutral-100 text-neutral-900",
                "data-[state=active]:bg-neutral-400 data-[state=active]:text-neutral-100",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
              )}
            >
              {value}
            </Button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { FontFamilyDropdown, FontSizeDropdown };
