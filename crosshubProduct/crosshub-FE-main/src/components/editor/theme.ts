import type { EditorThemeClasses } from "lexical";

const baseTheme: EditorThemeClasses = {
  list: {
    ul: "list-disc pl-4",
    ol: "list-decimal pl-4",
    nested: {
      list: "pl-4",
    },
  },
  text: {
    underline: "underline",
    strikethrough: "line-through",
  },
  image: "cursor-default inline-block relative select-none",
};

export { baseTheme };
